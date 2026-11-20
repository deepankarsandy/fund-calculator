# Release, Versioning & Pre-Push Verification Guide

This repository enforces **Semantic Versioning (SemVer)**, **Automated Git Hook Verification**, and **Continuous Deployment / GitHub Releases** for every release targeting the `main` branch.

---

## 1. Overview & Release Architecture

The release lifecycle consists of three automated safety gates:

```
┌─────────────────────────────────┐
│     Local Development Branch    │
│            (e.g. dev)           │
└────────────────┬────────────────┘
                 │
                 │ 1. Format & Test Quality Gates
                 ▼
┌─────────────────────────────────┐
│       Local Git Pre-Push Hook   │
│   (scripts/verify-release.js)   │
│  • SemVer Increment Check       │
│  • Release Doc Exists in Commit │
└────────────────┬────────────────┘
                 │
                 │ 2. Push / PR Merge to main
                 ▼
┌─────────────────────────────────┐
│     GitHub Actions Workflow     │
│   (.github/workflows/release)   │
│  • Reads docs/releases/v*.md    │
│  • Creates Git Tag (vX.Y.Z)     │
│  • Publishes GitHub Release     │
└─────────────────────────────────┘
```

---

## 2. Pre-Release Verification Rules (`scripts/verify-release.js`)

Whenever a push targeting `main` is initiated, Git executes `.githooks/pre-push`, which delegates to `scripts/verify-release.js`.

The script enforces the following mandatory rules:

### A. Target Branch Filtering

- Checks are **enforced exclusively** on pushes targeting `refs/heads/main` or `main`.
- Pushes to other branches (such as `dev`, `feature/*`, or `hotfix/*`) skip release verification with:
  `ℹ️ [pre-push] Push target is not main. Skipping release checks.`
- Branch deletions are safely ignored.

### B. Strict Semantic Version Increment

- The version defined in `package.json` must adhere strictly to SemVer (`MAJOR.MINOR.PATCH[-PRERELEASE]`).
- The proposed version is compared against the **highest existing version** across:
  1. `origin/main:package.json`
  2. All existing git tags (`git tag -l`)
- The proposed version must be **strictly greater** (`newVersion > currentRemoteVersion`). Duplicate versions or backwards revisions are rejected with exit code 1.

### C. Committed Release Documentation Check

- A corresponding release document must exist under `docs/releases/`:
  - `docs/releases/v<version>.md` (Recommended convention)
  - `docs/releases/<version>.md`
  - `docs/releases/v<version>.markdown`
  - `docs/releases/<version>.markdown`
- **Substantive Content Requirement**: The document must contain at least **20 characters** of non-whitespace content.
- **Commit Tree Verification**: If a commit SHA is pushed, the script checks the tree of that specific commit (`git show <localSha>:<path>`). **Uncommitted or untracked release files on your local filesystem will NOT pass verification.**

---

## 3. Pre-Release Quality Checklist

Before bumping the version and pushing to `main`, run the full quality suite:

```bash
# 1. Format check
npm run format:check

# 2. Run all unit and calculation tests
npm test

# 3. Compile TypeScript and build production bundle
npm run build

# 4. (Optional) Preview production build locally
npm run preview
```

All commands must exit cleanly with zero errors.

---

## 4. Step-by-Step Release Procedure

### Step 1: Switch to `main` and Pull Latest

Ensure your local branch is synchronized:

```bash
git checkout main
git pull origin main
```

_(Or merge your tested feature branch into `main`)_:

```bash
git merge dev
```

### Step 2: Bump the Version

Use standard `npm version` to update both `package.json` and `package-lock.json`:

```bash
# For backwards-compatible bug fixes:
npm version patch --no-git-tag-version    # e.g. 0.1.1 -> 0.1.2

# For new backwards-compatible features:
npm version minor --no-git-tag-version    # e.g. 0.1.1 -> 0.2.0

# For breaking changes:
npm version major --no-git-tag-version    # e.g. 0.2.0 -> 1.0.0
```

> **Note**: Pass `--no-git-tag-version` because the GitHub Actions workflow creates the tag automatically upon push.

### Step 3: Create / Update the Release Notes Document

Create `docs/releases/v<version>.md` (e.g. `docs/releases/v0.2.0.md`):

```markdown
# Release v0.2.0

## Summary

Brief description of the release highlights.

## Features & Improvements

- **Feature Name**: Detailed description of capabilities.

## Bug Fixes & Refinements

- **Fix**: Description of fixed edge cases.
```

### Step 4: Commit All Release Artifacts

Stage and commit `package.json`, `package-lock.json`, and the release markdown file:

```bash
git add package.json package-lock.json docs/releases/v<version>.md docs/features/
git commit -m "chore(release): bump version to <version> and add release notes"
```

### Step 5: Verify Release Manually (Optional Pre-Flight)

You can test the release validator before pushing:

```bash
node scripts/verify-release.js refs/heads/main $(git rev-parse HEAD) refs/heads/main
```

Expected output:

```
🔍 [pre-push] Verifying release requirements for push to main...
✅ [pre-push] SemVer verified: 0.1.1 -> 0.2.0
✅ [pre-push] Release document found: docs/releases/v0.2.0.md
```

### Step 6: Push to `main`

```bash
git push origin main
```

The `.githooks/pre-push` hook will execute automatically. Once validated, the commit lands on `origin/main`.

---

## 5. Automated GitHub Release Deployment

Once pushed to `main`, `.github/workflows/release.yml` triggers automatically:

1. **Version Extraction**: Extracts `version` from `package.json`.
2. **Tag Idempotency**: Verifies if `v<version>` tag already exists in the repository.
3. **Automated Publishing**:
   - Reads the release notes from `docs/releases/v<version>.md`.
   - Generates the git tag `v<version>`.
   - Creates a public GitHub Release with the tag and the markdown release notes.

---

## 6. Troubleshooting Common Pre-Push Rejection Errors

### Error: `[PRE-PUSH REJECTED] Semantic version increment required for push to main!`

- **Cause**: The version in `package.json` is less than or equal to the current version on `origin/main` or an existing git tag.
- **Solution**: Increment the version using `npm version patch` or `npm version minor`, stage `package.json` and `package-lock.json`, and amend your commit (`git commit --amend`).

### Error: `[PRE-PUSH REJECTED] Release details doc missing for version vX.Y.Z!`

- **Cause**: Either `docs/releases/vX.Y.Z.md` does not exist, has fewer than 20 characters, or was created locally but not committed to git.
- **Solution**: Ensure `docs/releases/vX.Y.Z.md` is populated with release notes and committed (`git add docs/releases/ && git commit --amend`).
