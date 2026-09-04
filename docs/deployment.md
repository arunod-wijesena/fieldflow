# FieldFlow Deployment

## Hosting provider

The project proposal permits deployment to Vercel or another approved host.

Vercel account verification did not provide Sri Lanka/+94 phone
verification during deployment. No verification bypass was attempted.

The mentor approved Render, Azure, or AWS as alternative hosting
providers. Render was selected because it provides the simplest
deployment path for the existing Next.js, Node.js, Prisma, Better Auth,
and Neon PostgreSQL stack.

## Runtime

FieldFlow uses Node.js 22.x in production.

## Required environment variables

The following variables are configured privately in the hosting
platform:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

Environment-variable values are not stored in GitHub.

## Build configuration

Install command:

```text
npm install