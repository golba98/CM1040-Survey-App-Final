# CM1040 Prototype Feedback Survey

This is a structured user-testing survey for the three Connected South Africa prototype concepts. It contains all nine concept/era screens and 18 desktop/mobile full-page screenshots copied or captured from the read-only prototype work.

## Local development

```bash
npm install
npm run dev
```

The Cloudflare Vite plugin runs the React client and Worker together. Apply the local D1 migration before exercising submission and admin routes:

```bash
npx wrangler d1 migrations apply cm1040-survey --local
```

No participant seed data is included in the repository. Local D1 state is stored under `.wrangler/` and is ignored by Git.

## Deployment

1. Create a D1 database: `npx wrangler d1 create cm1040-survey`.
2. Replace `REPLACE_WITH_D1_DATABASE_ID` in `wrangler.jsonc` with the returned ID.
3. Apply the production migration: `npx wrangler d1 migrations apply cm1040-survey --remote`.
4. Configure a custom Cloudflare hostname/route for the Worker, then run `npm run deploy`.
5. In Cloudflare Zero Trust, create a self-hosted Access application for the hostname. Protect `/admin*` and `/api/admin/*` with an Allow policy containing only the owner’s email identity. Keep the public survey and `/api/survey/submit` outside that policy.

`workers_dev` is disabled in the production configuration so the private admin API is not reachable through an unintended worker.dev bypass.

## Prototype asset capture

The existing 2006–2012 images were copied from the supplied design-concept directory. The remaining route images were captured from the source Vite projects with `scripts/capture-prototypes.ts` at 1440px and 390px, then stored under `public/prototypes/`. The source directories are never written to by this project.

## Testing

```bash
npm run build
npx wrangler deploy --dry-run
npx wrangler d1 migrations apply cm1040-survey --local
npm test
```

The submission endpoint validates the same question catalog used by the client, writes the response and answers atomically, and treats a repeated response UUID as an idempotent success.

# CM1040-Survey-App-Final
