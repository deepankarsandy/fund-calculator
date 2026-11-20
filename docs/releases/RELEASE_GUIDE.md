# Release & Versioning Guide

This repository enforces **Semantic Versioning** and automated **GitHub Releases** for pushes to the `main` branch.

---

## How It Works

### 1. Local Git Hooks (`.githooks/`)

- **`pre-commit`**: Automatically runs Prettier on staged files (`.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.css`, `.md`, `.html`) so committed code is always uniformly formatted.
- **`pre-push`**: When pushing to `main`, the hook validates:
  1. **SemVer Increment**: The version in `package.json` must be strictly higher than the current highest version on `origin/main` and git tags (following Semantic Versioning: `major.minor.patch`).
  2. **Release Documentation**: A release notes document (`docs/releases/v<version>.md`) must be present and contain release notes (minimum 20 characters).

### 2. Automated GitHub Release (`.github/workflows/release.yml`)

When a validated commit is pushed or merged into `main`:

1. The GitHub Actions workflow triggers automatically.
2. It inspects `package.json` for the new version.
3. It checks if the git tag `v<version>` exists.
4. If the tag does not exist:
   - It reads the release notes from `docs/releases/v<version>.md`.
   - It atomically creates the Git tag (e.g. `v0.2.0`) and creates the GitHub Release with the release notes attached.

---

## Step-by-Step: Releasing a New Version

1. **Bump the Version**:

   ```bash
   npm version patch   # For bug fixes (e.g. 0.1.1 -> 0.1.2)
   # or
   npm version minor   # For new features (e.g. 0.1.1 -> 0.2.0)
   # or
   npm version major   # For breaking changes (e.g. 0.1.1 -> 1.0.0)
   ```

2. **Create the Release Notes Document**:
   Create `docs/releases/v<version>.md` (e.g. `docs/releases/v0.2.0.md`):

   ```markdown
   # Release v0.2.0

   ## What's Changed

   - Dynamic page chunk splitting for fast initial page load.
   - Pre-commit formatting hook with Prettier.
   - Automated release and semver enforcement workflow.
   ```

3. **Commit and Push**:
   ```bash
   git add package.json package-lock.json docs/releases/
   git commit -m "chore(release): bump version to 0.2.0 and add release notes"
   git push origin main
   ```
   The pre-push hook will verify the SemVer increment and release notes doc. Upon push to `main`, GitHub Actions creates the git tag and release automatically!
