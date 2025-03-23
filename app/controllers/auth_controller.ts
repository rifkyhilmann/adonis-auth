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

            const user = await User.findBy('email', payload.email);

            if (!user) {
                return response.unauthorized({ message: 'Email atau password salah' })
            } 

            const token = await User.accessTokens.create(user);

            if (await hash.verify(payload.password, user.password)) {
                return response.unauthorized({ message: 'Email atau password salah' })
            }

            response.status(200).send({
                message : "success",
                status : 200,
                
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

            const hashPassword = await hash.make(payload.password);

            payload.password = hashPassword

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
}