#!/usr/bin/env node

/**
 * verify-release.js
 *
 * Pre-push validation script:
 * 1. Verifies that pushes to 'main' increment SemVer (major.minor.patch).
 * 2. Verifies that a release details document (docs/releases/v<version>.md) is present and non-empty.
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Parses a semver string into [major, minor, patch, prerelease].
 */
function parseSemver(ver) {
  if (!ver) return null
  const clean = ver.trim().replace(/^v/, '')
  const match = clean.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/)
  if (!match) return null
  return {
    raw: clean,
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null,
  }
}

/**
 * Returns:
 *   1 if a > b
 *  -1 if a < b
 *   0 if a == b
 */
function compareSemver(a, b) {
  const parsedA = parseSemver(a)
  const parsedB = parseSemver(b)

  if (!parsedA || !parsedB) {
    throw new Error(`Invalid semver comparison between "${a}" and "${b}"`)
  }

  if (parsedA.major !== parsedB.major) return parsedA.major > parsedB.major ? 1 : -1
  if (parsedA.minor !== parsedB.minor) return parsedA.minor > parsedB.minor ? 1 : -1
  if (parsedA.patch !== parsedB.patch) return parsedA.patch > parsedB.patch ? 1 : -1

  // Handle prereleases: standard semver says 1.0.0 > 1.0.0-beta
  if (!parsedA.prerelease && parsedB.prerelease) return 1
  if (parsedA.prerelease && !parsedB.prerelease) return -1
  if (parsedA.prerelease && parsedB.prerelease) {
    return parsedA.prerelease.localeCompare(parsedB.prerelease)
  }

  return 0
}

function getRemoteMainVersion() {
  const candidates = []

  // Try reading package.json from origin/main
  try {
    const originPkgJson = execSync('git show origin/main:package.json 2>/dev/null', {
      encoding: 'utf8',
    })
    const pkg = JSON.parse(originPkgJson)
    if (pkg.version) candidates.push(pkg.version)
  } catch {
    // origin/main may not exist yet locally
  }

  // Try checking existing git tags
  try {
    const rawTags = execSync('git tag -l', { encoding: 'utf8' })
    const tags = rawTags
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)

    for (const tag of tags) {
      if (parseSemver(tag)) {
        candidates.push(tag.replace(/^v/, ''))
      }
    }
  } catch {
    // tags might not be available
  }

  if (candidates.length === 0) {
    return '0.0.0'
  }

  // Sort candidates to find the highest
  candidates.sort((x, y) => compareSemver(x, y))
  return candidates[candidates.length - 1]
}

function getPushedPackageJson(localSha) {
  if (localSha && localSha !== '0000000000000000000000000000000000000000') {
    try {
      const output = execSync(`git show ${localSha}:package.json`, { encoding: 'utf8' })
      return JSON.parse(output)
    } catch {
      // Fallback to local file if ref not accessible
    }
  }
  const pkgPath = path.resolve(process.cwd(), 'package.json')
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
}

function checkReleaseDoc(version, localSha) {
  const filenames = [
    `docs/releases/v${version}.md`,
    `docs/releases/${version}.md`,
    `docs/releases/v${version}.markdown`,
    `docs/releases/${version}.markdown`,
  ]

  for (const relPath of filenames) {
    // Check in commit tree if sha is provided
    if (localSha && localSha !== '0000000000000000000000000000000000000000') {
      try {
        const content = execSync(`git show ${localSha}:${relPath} 2>/dev/null`, {
          encoding: 'utf8',
        })
        if (content && content.trim().length >= 20) {
          return { found: true, path: relPath, content }
        }
      } catch {
        // Not found in commit, try next
      }
    }

    // Check on filesystem
    const fullPath = path.resolve(process.cwd(), relPath)
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8')
      if (content.trim().length >= 20) {
        return { found: true, path: relPath, content }
      }
    }
  }

  return { found: false }
}

export function verifyRelease({ localRef, localSha, remoteRef, remoteSha }) {
  // Only enforce checks if pushing to main
  const isPushingToMain =
    remoteRef === 'refs/heads/main' ||
    remoteRef === 'main' ||
    (!remoteRef && localRef === 'refs/heads/main')

  if (!isPushingToMain) {
    console.log(
      `ℹ️ [pre-push] Push target is not main (${remoteRef || 'unknown'}). Skipping release checks.`
    )
    return true
  }

  // Branch deletion
  if (localSha === '0000000000000000000000000000000000000000') {
    return true
  }

  console.log('🔍 [pre-push] Verifying release requirements for push to main...')

  // 1. Check SemVer
  const pkg = getPushedPackageJson(localSha)
  const newVersion = pkg.version
  const parsedNew = parseSemver(newVersion)

  if (!parsedNew) {
    console.error(`\n❌ [PRE-PUSH REJECTED] Invalid semver in package.json: "${newVersion}"`)
    console.error(`   Version must follow Semantic Versioning (e.g. 0.2.0, 1.0.0).`)
    process.exit(1)
  }

  const currentRemoteVersion = getRemoteMainVersion()

  try {
    const cmp = compareSemver(newVersion, currentRemoteVersion)
    if (cmp <= 0) {
      console.error(
        `\n❌ [PRE-PUSH REJECTED] Semantic version increment required for push to main!`
      )
      console.error(`   Current highest version on main/tags: ${currentRemoteVersion}`)
      console.error(`   Attempting to push version:          ${newVersion}\n`)
      console.error(`   To resolve, increment your package.json version:`)
      console.error(`     npm version patch  # (e.g. bug fixes)`)
      console.error(`     npm version minor  # (e.g. new features)`)
      console.error(`     npm version major  # (e.g. breaking changes)\n`)
      process.exit(1)
    }
  } catch (err) {
    console.error(`\n❌ [PRE-PUSH REJECTED] SemVer comparison failed: ${err.message}`)
    process.exit(1)
  }

  // 2. Check Release Details Doc
  const docCheck = checkReleaseDoc(newVersion, localSha)
  if (!docCheck.found) {
    console.error(
      `\n❌ [PRE-PUSH REJECTED] Release details doc missing for version v${newVersion}!`
    )
    console.error(`   Each push to main must include a release notes document:`)
    console.error(
      `     Expected file: docs/releases/v${newVersion}.md (or docs/releases/${newVersion}.md)\n`
    )
    console.error(`   Please create this file with details of changes, summary, and features,`)
    console.error(`   then commit it before pushing to main.\n`)
    process.exit(1)
  }

  console.log(`✅ [pre-push] SemVer verified: ${currentRemoteVersion} -> ${newVersion}`)
  console.log(`✅ [pre-push] Release document found: ${docCheck.path}`)
  return true
}

// CLI / Stdin execution
if (process.argv[1] && process.argv[1].endsWith('verify-release.js')) {
  // If run with arguments: node verify-release.js <localRef> <localSha> <remoteRef> <remoteSha>
  const args = process.argv.slice(2)
  if (args.length >= 3) {
    verifyRelease({
      localRef: args[0],
      localSha: args[1],
      remoteRef: args[2],
      remoteSha: args[3],
    })
  } else {
    // Read from stdin (git pre-push hook passes stdin)
    let input = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => {
      input += chunk
    })
    process.stdin.on('end', () => {
      const lines = input.trim().split('\n').filter(Boolean)
      if (lines.length === 0) {
        // No lines piped (e.g. manual invocation) - verify current HEAD against main
        try {
          const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
            encoding: 'utf8',
          }).trim()
          const headSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
          verifyRelease({
            localRef: `refs/heads/${currentBranch}`,
            localSha: headSha,
            remoteRef: currentBranch === 'main' ? 'refs/heads/main' : 'other',
          })
        } catch {
          process.exit(0)
        }
      } else {
        for (const line of lines) {
          const [localRef, localSha, remoteRef, remoteSha] = line.split(' ')
          verifyRelease({ localRef, localSha, remoteRef, remoteSha })
        }
      }
    })
  }
}
