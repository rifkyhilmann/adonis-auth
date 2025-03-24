import User from '#models/user';
import env from '#start/env';
import { ForgotPasswordValidator, LoginValidator, RegisterValidator, ResetPasswordValidator } from '#validators/auth';
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash';
import mail from '@adonisjs/mail/services/main';
import { errors } from '@vinejs/vine';
import { promises as fs } from 'fs'

export default class AuthController {
    async login(ctx : HttpContext) {
        const { request, response } = ctx;

        try {
            const payload = await LoginValidator.validate(request.all());

            const user = await User.findBy('email', payload.email)

            if (!user) {
                return response.unauthorized('User not found');
            }

            const isPasswordValid = await hash.verify(user.password, payload.password)

            if (!isPasswordValid) {
                return response.unauthorized('Password Salah')
            }
            const token = await User.accessTokens.create(user,
                ['*'],
                {
                    name : 'auth_token',
                    expiresIn : '2 minutes'
                }
            )

            response.status(200).send({
                message : "success",
                status : 200,
                token : token.value!.release(),
                data :  {
                    full_name : user.fullName,
                    email : user.email
                }
            });
        } catch (error) {
            if (error instanceof errors.E_VALIDATION_ERROR) {
                response.status(500).send({
                    errors: error.messages
                })
            }

            response.status(500).send({
                errors: error.messages
            })

            console.log(error)
        }
    }

    async register(ctx : HttpContext) {
        const { request, response } = ctx;

        try {
            const payload = await RegisterValidator.validate(request.all());    

            const user = await User.findBy('email', payload.email);

            if (user) {
                return response.unauthorized({ message: 'Email sudah terdaftar' })
            }

            await User.create(payload);

            response.status(200).send({ message: 'Berhasil mendaftar' });
        } catch (error) {
            if (error instanceof errors.E_VALIDATION_ERROR) {
                response.status(500).send({
                    errors: error.messages
                })
            }

            response.status(500).send({
                errors: error.messages
            })

            console.log(error)
        }
    }

    async logout(ctx : HttpContext) {
        const { auth, response } = ctx;

        try {
            const user = auth.getUserOrFail()
            const token = auth.user?.currentAccessToken.identifier

            if (!token) {
                return response.badRequest({ message: 'Token not found' })
            }

            await User.accessTokens.delete(user, token);

            return response.ok({
                success: true,
                message: 'User logged out',
                data: token
            })
        } catch (error) {
            response.status(500).send({ message: "Terjadi kesalahan saat logout" });
        }
    
    }

    async forgotPassword({ response, request } : HttpContext) {
        
        try {
            const payload = await ForgotPasswordValidator.validate(request.all());

            const user = await User.findBy('email', payload.email);

            if (!user) {
                return response.unauthorized('User not found');
            }

            const token = await User.accessTokens.create(user,
                ['*'],
                {
                    name : 'reset_password',
                    expiresIn : '2 minutes'
                }
            )

            let template = await fs.readFile('resources/views/emails/reset_password.html', 'utf-8')
    
            const resetLink = `${env.get('APP_URL')}/reset-password?id=${token.value!.release()}`

            console.log(token);
    
            template = template.replace('{{resetLink}}', resetLink)
            template = template.replace('{{name}}', user.fullName || user.email);

            await mail.send((message) => {
                message
                  .to(payload.email)
                  .from('Adonis Auth')
                  .subject('Reset Password')
                  .html(template)
            })
        } catch (error) {
            if (error instanceof errors.E_VALIDATION_ERROR) {
                response.status(500).send({
                    errors: error.messages
                })
            }

            response.status(500).send({
                errors: error.messages
            })

            console.log(error)
        }
    }

    async resetPassword({ request, response, auth } : HttpContext) {
        try {
            if (!auth || auth.user?.currentAccessToken.name !== 'reset_password') {
                return response.unauthorized({ message: 'Invalid or expired token' })
            }

            const payload = await ResetPasswordValidator.validate(request.all());

            const user = await User.findBy('id', auth.user.id);
            

            if (!user) {
                return response.unauthorized('User not found');
            }

            await User.accessTokens.delete(user, auth.user?.currentAccessToken.identifier)

            user.merge({ password: payload.password })
            await user.save()

            return response.ok({ message: 'Password berhasil direset' });
        } catch (error) {
            if (error instanceof errors.E_VALIDATION_ERROR) {
                response.status(500).send({
                    errors: error.messages
                })
            }

            response.status(500).send({
                errors: error.messages
            })

            console.log(error)
        }
    }

    async githubCallback({ response, ally } : HttpContext) {
        try {
            const github = ally.use('github');

            if (github.accessDenied()) {
                return response.unauthorized({ message: 'Access was denied' })
            }

            if (github.hasError()) {
                return response.badRequest({ message: github.getError() })
            }

            const user = await github.user()

            return response.status(200).send({
                message : "success",
                data : user
            })
        
        } catch (error) {
            if (error instanceof errors.E_VALIDATION_ERROR) {
                response.status(500).send({
                    errors: error.messages
                })
            }

            response.status(500).send({
                errors: error.messages
            })

            console.log(error)
        }
    }

    async googleCallback({ response, ally } : HttpContext) {
        try {
            const google = ally.use('google');

            if (google.accessDenied()) {
                return response.unauthorized({ message: 'Access was denied' })
            }

            if(google.hasError()) {
                return response.badRequest({ message: google.getError() })
            }

            const user = await google.user();

            return response.status(200).send({
                message : "success",
                data : user
            })
        } catch (error) {
            response.status(500).send({
                errors: error.messages
            })

            console.log(error)
        }
    }
}