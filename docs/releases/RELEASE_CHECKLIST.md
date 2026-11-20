# Release Pre-Flight Checklist

Quick reference checklist to consult before cutting a new release in `lifetime-cost-corpus-calculator`.

---

## Pre-Release Verification Checklist

Run through these checks sequentially prior to pushing to `main`:

### 1. Code Quality & Integrity

- [ ] **Formatting**: Run `npm run format:check` (Fix with `npm run format` if needed).
- [ ] **Unit Tests**: Run `npm test` (All Vitest suites must pass).
- [ ] **Build Check**: Run `npm run build` (TypeScript compiles without error; Vite bundle generates).
- [ ] **Manual Smoke Test**: Run `npm run preview` to verify that routing, charts, and calculators function cleanly.

### 2. Version Bump (`package.json` & `package-lock.json`)

- [ ] Version adheres to Semantic Versioning (`MAJOR.MINOR.PATCH`).
- [ ] Version is strictly greater than the latest release on `origin/main` and git tags (`git tag -l`).
- [ ] Both `package.json` and `package-lock.json` are updated with the identical new version.

### 3. Release Notes Document

- [ ] Create `docs/releases/v<version>.md` (e.g. `docs/releases/v0.2.0.md`).
- [ ] Document contains substantive summary, features, improvements, and fixes (minimum 20 characters).
- [ ] Document is staged and committed to git (validator inspects the commit tree).

### 4. Local Pre-Push Simulation (Optional)

Test the validator locally before pushing:

```bash
node scripts/verify-release.js refs/heads/main $(git rev-parse HEAD) refs/heads/main
```

Verify that it prints:

- `✅ [pre-push] SemVer verified: <old> -> <new>`
- `✅ [pre-push] Release document found: docs/releases/v<new>.md`

### 5. Push & Automated Release

- [ ] Push commit to `main` branch: `git push origin main`.
- [ ] Confirm GitHub Actions workflow `.github/workflows/release.yml` triggers.
- [ ] Confirm tag `v<version>` and GitHub Release are published with release notes.
