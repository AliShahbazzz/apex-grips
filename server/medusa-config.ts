import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    {
      resolve: "./src/modules/pattern",
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        // Cash on delivery uses the built-in pp_system_default, which is always registered
        providers: process.env.RAZORPAY_KEY_ID
          ? [
              {
                resolve: "./src/modules/razorpay",
                id: "razorpay",
                options: {
                  key_id: process.env.RAZORPAY_KEY_ID,
                  key_secret: process.env.RAZORPAY_KEY_SECRET,
                  webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
                },
              },
            ]
          : [],
      },
    },
  ],
})
