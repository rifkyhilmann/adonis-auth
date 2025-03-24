import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const smtpHost = env.get('SMTP_HOST');
if (!smtpHost) {
  throw new Error('SMTP_HOST environment variable is not set');
}

const mailConfig = defineConfig({
  default: 'smtp',

   /**
    * The mailers object can be used to configure multiple mailers
    * each using a different transport or same transport with different
    * options.
   */
  mailers: { 
    smtp: transports.smtp({
      host: env.get('SMTP_HOST') as string,
      port: env.get('SMTP_PORT') as unknown as number,
			secure: false,

      auth: {
        type: 'login',
        user: env.get('SMTP_USERNAME') as string,
        pass: env.get('SMTP_PASSWORD') as string
      },

      tls: {},

      ignoreTLS: false,
      requireTLS: false,

      pool: false,
      maxConnections: 5,
      maxMessages: 100,
    }),
		     
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}