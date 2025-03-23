import User from '#models/user';
import { LoginValidator, RegisterValidator } from '#validators/auth';
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash';
import { errors } from '@vinejs/vine'

export default class AuthController {
    async login(ctx : HttpContext) {
        const { request, response } = ctx;

        try {
            const payload = await LoginValidator.validate(request.all());

            const user = await User.findBy('email', payload.email)

            if (!user) {
                return response.unauthorized('Invalid credentials')
            }

            const isPasswordValid = await hash.verify(user.password, payload.password)

            if (!isPasswordValid) {
                return response.unauthorized('Invalid credentials')
            }
            const token = await User.accessTokens.create(user)

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
            const getUser = auth.user?.id
            const user = await User.findOrFail(getUser)
            await User.accessTokens.delete(user, user.id);

            return response.ok({
                success: true,
                message: 'User logged out',
                data: getUser
            })
        } catch (error) {
            response.status(500).send({ message: "Terjadi kesalahan saat logout" });
        }
    
    }
}