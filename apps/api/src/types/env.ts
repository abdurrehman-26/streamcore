export interface EnvironmentVariables {
  DATABASE_URI: string;
  PORT: string;
  MAILERSEND_API_KEY: string;
  MAILERSEND_FROM_NAME: string;
  MAILERSEND_FROM_EMAIL: string;
  MINIO_ENDPOINT: string;
  MINIO_PORT: string;
  MINIO_USE_SSL: string;
  MINIO_ACCESS_KEY: string;
  MINIO_SECRET_KEY: string;
  REDIS_HOST: string;
  REDIS_PORT: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
}
