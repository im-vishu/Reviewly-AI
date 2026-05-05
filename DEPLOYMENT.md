# Deployment Guide

Reviewly AI is a Vite SPA and can be deployed to Vercel, Netlify, Cloudflare Pages, or any static hosting provider that supports SPA rewrites.

## Vercel

1. Import `https://github.com/im-vishu/Reviewly-AI` into Vercel.
2. Add environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Use these build settings:

```text
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

4. Add the deployed URL to Supabase Auth redirect URLs.
5. Deploy and verify deep links such as `/dashboard` and `/auth/signin`.

## Netlify

Use the same build command and output directory:

```text
npm run build
dist
```

Add an SPA redirect rule:

```text
/* /index.html 200
```

## Pre-Deploy Checks

```bash
npm run typecheck
npm run lint
npm run build
```
