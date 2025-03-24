import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
    async getProfile({ response, auth } : HttpContext) {
        try {
            const user = await auth.user;

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