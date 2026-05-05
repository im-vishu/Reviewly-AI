# Contributing to Reviewly AI

Thanks for your interest in contributing to Reviewly AI. This project is a React, TypeScript, Vite, Tailwind CSS, and Supabase application for AI-assisted code review workflows.

## Getting Started

1. Fork the repository.
2. Clone your fork.
3. Install dependencies.

```bash
npm install
```

4. Copy `.env.example` to `.env` and add your Supabase values.
5. Start the dev server.

```bash
npm run dev
```

## Development Guidelines

- Keep changes focused and easy to review.
- Follow the existing React and Tailwind patterns.
- Prefer typed interfaces over `any`.
- Keep Supabase service-role keys out of the frontend.
- Do not commit `.env`, build output, logs, or local editor settings.

## Quality Checks

Run these before opening a pull request:

```bash
npm run typecheck
npm run lint
npm run build
```

## Pull Requests

When opening a pull request:

- Describe what changed and why.
- Include screenshots for UI changes.
- Mention any Supabase migration or environment variable changes.
- Link related issues when applicable.

## Commit Style

Use short, meaningful commit messages:

```text
feat: add review export action
fix: handle missing Supabase config
docs: update deployment instructions
```
