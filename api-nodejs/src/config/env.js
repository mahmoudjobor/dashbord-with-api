require('dotenv').config();
const { z } = require('zod');

const EnvSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(3001),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),
  })
  .superRefine((env, ctx) => {
    // Fail fast in production if the secret is weak or still the placeholder.
    if (env.NODE_ENV === 'production' && (env.JWT_SECRET.length < 32 || env.JWT_SECRET === 'jwt_secret')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_SECRET'],
        message: 'must be at least 32 characters in production (generate: openssl rand -hex 32)',
      });
    }
  });

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  // Never print the values themselves, only which variables are wrong.
  console.error(`Invalid environment configuration:\n${problems}`);
  process.exit(1);
}

module.exports = Object.freeze(parsed.data);
