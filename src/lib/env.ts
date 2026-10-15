import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  AUTH_SECRET: z.string().min(16).optional(),
  APP_BASE_URL: z.string().url().optional(),
  MONGODB_URI: z.string().min(1).optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD_HASH: z.string().min(1).optional(),
  WOO_STORE_URL: z.string().url().optional(),
  WOO_CONSUMER_KEY: z.string().min(1).optional(),
  WOO_CONSUMER_SECRET: z.string().min(1).optional(),
  WOO_WEBHOOK_SECRET: z.string().min(1).optional(),
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  OPENROUTER_MODEL: z.string().min(1).default('deepseek/deepseek-r1:free'),
  OPENROUTER_SITE_URL: z.string().url().optional(),
  OPENROUTER_SITE_NAME: z.string().min(1).optional()
});

export type AppEnv = z.infer<typeof environmentSchema>;

let cachedEnv: AppEnv | undefined;

export function getEnv(): AppEnv {
  cachedEnv ??= environmentSchema.parse(process.env);
  return cachedEnv;
}

export function isDemoMode(): boolean {
  const env = getEnv();
  return !env.MONGODB_URI || !env.WOO_STORE_URL || !env.WOO_CONSUMER_KEY || !env.WOO_CONSUMER_SECRET;
}

export function hasMongoConnection(): boolean {
  return Boolean(getEnv().MONGODB_URI);
}