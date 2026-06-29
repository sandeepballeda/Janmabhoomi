# Security Policy

## Supported Versions

The `main` branch is the supported development line for this prototype.

## Reporting a Vulnerability

Please report suspected vulnerabilities privately to the repository maintainers. Do not open a public issue that includes exploit details, secrets, private citizen data, or production credentials.

Include:

- A short description of the issue.
- Steps to reproduce.
- Potential impact.
- Suggested mitigation, if known.

Maintainers should acknowledge reports within 5 business days and provide an expected remediation path when the issue is confirmed.

## Security Practices

- Never commit `.env`, real credentials, API tokens, private keys, or real citizen data.
- Use `.env.example` for safe configuration examples.
- Run secret scanning before merge.
- Run dependency and static-analysis checks in CI.
