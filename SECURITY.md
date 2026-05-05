# Security Policy

## Supported Versions

Security updates are currently applied to the latest version on the default branch.

## Reporting a Vulnerability

If you discover a security issue, please do not open a public issue with exploit details.

Instead, contact the maintainer through GitHub:

```text
https://github.com/im-vishu
```

Please include:

- A clear description of the issue
- Steps to reproduce
- Impact assessment
- Suggested fix, if available

## Security Notes

- Never commit `.env` files or private keys.
- Never expose Supabase service-role keys in frontend code.
- Keep Row Level Security enabled for Supabase tables.
- Review dependency audit output regularly.
