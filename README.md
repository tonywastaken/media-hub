# Media Hub

A fast, static media directory portal built with React, Tailwind, and Vite.

## Security Setup

This project does not store the admin password in the repository. The password must be supplied through GitHub repository secrets.

1. Open your GitHub repository.
2. Click Settings.
3. In the left sidebar, click Secrets and variables.
4. Click Actions.
5. Click New repository secret.
6. Set the name to `VITE_ADMIN_PASSWORD`.
7. Set the value to your secure administrator passphrase.
8. Click Add secret.

Example:

```yaml
env:
  VITE_ADMIN_PASSWORD: ${{ secrets.VITE_ADMIN_PASSWORD }}
```

The app reads the value dynamically with:

```js
const adminPassword =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ADMIN_PASSWORD) ||
  (typeof process !== 'undefined' ? process.env?.VITE_ADMIN_PASSWORD : '') ||
  '';
```

Important notes:
- Never commit a real password to source control.
- Never put the password in README files, JSON files, or committed `.env` files.
- Use a strong random password and rotate it periodically.
- This project is a static frontend; any client-side `VITE_` value is not a true server-side secret. For a hardened production admin flow, use a backend or protected server endpoint.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## GitHub Pages deployment

The repository includes a GitHub Actions workflow that builds the app and deploys the `dist` output to GitHub Pages.

It expects the secret `VITE_ADMIN_PASSWORD` to be configured in GitHub repository settings.
