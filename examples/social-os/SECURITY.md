# Security Updates

## January 25, 2026 - Next.js Security Patch

### Vulnerability Fixed
Updated Next.js from version 15.1.0 to 15.2.6 to address multiple critical security vulnerabilities:

1. **DoS via Cache Poisoning** (CVE)
   - Affected: >= 15.0.4-canary.51, < 15.1.8
   - Patched in: 15.1.8

2. **Remote Code Execution (RCE) in React Flight Protocol**
   - Multiple variants affecting versions 14.3.0+ through 16.0.x
   - Patched in: 15.2.6 (for 15.2.x line)

3. **Authorization Bypass in Middleware**
   - Affected: >= 15.0.0, < 15.2.3
   - Patched in: 15.2.3

### Action Taken
- Updated `next` package from `15.1.0` to `15.2.6`
- Updated `eslint-config-next` from `15.1.0` to `15.2.6`
- Version 15.2.6 includes all security patches for the above vulnerabilities

### Recommendation
If you've already installed dependencies, run:
```bash
cd ui
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Verification
You can verify the patched version is installed by running:
```bash
cd ui
pnpm list next
# Should show: next 15.2.6
```

### References
- Next.js Security Advisories: https://github.com/vercel/next.js/security
- Next.js Release Notes: https://github.com/vercel/next.js/releases

## Security Best Practices

This project follows security best practices:

1. **Dependency Updates**: Regular updates to patch security vulnerabilities
2. **SQL Injection Prevention**: Parameterized queries throughout
3. **XSS Protection**: React's built-in escaping
4. **Environment Variables**: Secure secret management
5. **No Sensitive Data in Logs**: Production logging filtered
6. **URL Encoding**: Proper encoding for user-generated content

## Reporting Security Issues

If you discover a security vulnerability in this project:

1. **Do NOT** open a public GitHub issue
2. Email the maintainers directly
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Checklist for Production

Before deploying to production:

- [ ] Update all dependencies to latest patched versions
- [ ] Enable HTTPS/SSL for all connections
- [ ] Set up proper CORS headers
- [ ] Implement rate limiting on API routes
- [ ] Add authentication and authorization
- [ ] Enable database connection encryption
- [ ] Set up monitoring and alerting
- [ ] Configure proper CSP headers
- [ ] Review and update environment variables
- [ ] Enable security headers (via next.config.js)

## Automated Security Scanning

Consider setting up:

- **Dependabot**: For automated dependency updates
- **Snyk**: For vulnerability scanning
- **GitHub Security Advisories**: For vulnerability notifications
- **CodeQL**: For code security analysis

## Contact

For security concerns, please contact the repository maintainers.
