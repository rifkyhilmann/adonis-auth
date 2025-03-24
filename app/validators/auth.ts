import vine from '@vinejs/vine'

export const LoginValidator = vine.compile(
    vine.object({
        email: vine.string().email(),
        password: vine
            .string()
            .minLength(8)
            .maxLength(32)
            .confirmed()
    })
)

export const RegisterValidator = vine.compile(
    vine.object({
        full_name : vine.string().minLength(3),
        email: vine.string().email(),
        password: vine
            .string()
            .minLength(8)
            .maxLength(32),
        
    })
)

export const ForgotPasswordValidator = vine.compile(
    vine.object({
        email: vine.string().email(),
    })
)

export const ResetPasswordValidator = vine.compile(
    vine.object({
        password: vine
            .string()
            .minLength(8)
            .maxLength(32)
            .confirmed()
    })
)