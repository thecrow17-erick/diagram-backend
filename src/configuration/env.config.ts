

export const EnvConfig = ():any => ({
  enviroment: process.env.NODE_ENV || "dev",
  port: +process.env.PORT || 3000,
  secret_key_jwt: process.env.SECRET_KEY_JWT,
  database_url: process.env.DATABASE_URL,
})