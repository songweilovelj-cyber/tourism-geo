---
name: "github-maintainer"
description: "Maintains GitHub repositories: commits changes, creates branches, pushes to remote, and manages versions. Invoke when user wants to upload code to GitHub or manage repository versions."
---

# GitHub Maintainer

This skill provides a complete workflow for maintaining GitHub repositories, including project initialization, committing changes, branch/tag management, version releases, and troubleshooting.

## Core Principle

**When pushing to GitHub fails but browser can access GitHub → Check system proxy configuration first.**

Git browser traffic auto-routes through system proxy, but git command-line does NOT. This is the #1 cause of "connection timeout/reset" errors on Windows.

## Standard Workflow

### 1. Configure Token Remote (One-time Setup)

```bash
git remote set-url origin https://<TOKEN>@github.com/<owner>/<repo>.git
```

### 2. Check System Proxy (Windows)

```powershell
Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" | Select-Object ProxyServer
```

If proxy exists (e.g., `127.0.0.1:7892`):
```bash
git config http.proxy http://127.0.0.1:7892
git config https.proxy http://127.0.0.1:7892
```

### 3. Configure SSL (Windows)

```bash
git config http.sslBackend schannel
git config http.sslVerify false
```

### 4. Verify Git Status

```bash
git status
git log --oneline -5
git tag -l
git remote -v
```

### 5. Stage & Commit Changes

```bash
# Check what will be committed
git status

# Stage all changes (exclude nested git repos)
git add -A -- ':!nested-git-dir'

# Or stage specific files
git add file1 file2

# Commit with descriptive message
git commit -m "feat(module): description of change"
```

### 6. Create Version Tag

```bash
git tag -a v1.1.0 -m "Version 1.1.0 - feature highlights"
```

### 7. Push to Remote

```bash
git push origin main --tags
```

## Commit Message Convention

Format: `<type>(<scope>): <description>`

| Type | Use Case |
|------|----------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `refactor` | Code refactoring |
| `style` | Formatting, no code change |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

Examples:
- `feat(content): add AI content generation for tourism scenarios`
- `fix(media): resolve image upload garbled text issue`
- `docs(readme): update project URL references`

## Project Structure Verification (Pre-commit Checklist)

Before pushing, verify:

| Check | Command |
|-------|---------|
| Missing type files | `ls frontend/src/types/` |
| Environment configs | `cat .env.example` |
| Version numbers | `grep version package.json */package.json` |
| .gitignore entries | `cat .gitignore` |
| README links | `grep github.com README.md` |
| No embedded git repos | `git ls-files | Select-String -Pattern ".git"` |
| No local uploads tracked | `git ls-files | Select-String -Pattern "uploads/"` |

### Common Fixes

**Missing type definitions:**
```bash
# Create missing .d.ts files
echo '/// <reference types="vite/client" />' > frontend/src/env.d.ts
```

**Remove accidentally tracked files:**
```bash
git rm --cached -r path/to/file
```

**Embedded git repo (nested .git folder):**
```bash
git rm --cached -f nested-repo-dir
Remove-Item -Recurse -Force nested-repo-dir
```

## Open Source Project Standards

### Required Files

- `README.md` - Project description, features, quick start
- `LICENSE` - MIT/Apache/etc.
- `.gitignore` - Exclude `node_modules/`, `dist/`, `*.log`, uploads, test results
- `package.json` - Name, version, scripts, dependencies
- `CONTRIBUTING.md` - How to contribute
- `CHANGELOG.md` - Version history

### .gitignore Template (Node.js/TypeScript)

```
# Dependencies
node_modules/

# Build
dist/
build/

# Environment
.env
*.env

# Logs
*.log
.npm-debug.log*

# OS
.DS_Store
Thumbs.db

# Uploads/media
uploads/*
!uploads/.gitkeep

# Test results
test-results/
coverage/
screenshots/

# IDE
.idea/
.vscode/

# TypeScript
*.tsbuildinfo

# Database
*.db
*.db-journal
```

### Version Numbering

- `1.0.0` - Initial release
- `1.1.0` - Feature additions (backward compatible)
- `1.0.1` - Bug fixes only
- `2.0.0` - Breaking changes

## Troubleshooting

### Symptom: `fatal: unable to access 'https://github.com/...': Recv failure: Connection was reset`

**Cause:** System proxy not configured for git (most common on Windows with Clash/V2Ray)

**Fix:**
```bash
# Step 1: Detect proxy
Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" | Select-Object ProxyServer

# Step 2: Set proxy
git config http.proxy http://<proxy-ip>:<port>
git config https.proxy http://<proxy-ip>:<port>

# Step 3: Retry push
git push origin main --tags
```

### Symptom: `fatal: unable to access 'https://github.com/...': Failed to connect after N ms`

**Cause:** Git not using proxy while browser can connect

**Fix:** Same as above - configure `http.proxy`

### Symptom: `schannel: failed to receive handshake`

**Cause:** SSL backend incompatibility

**Fix:**
```bash
git config --unset http.sslBackend
git config http.sslVerify false
git push origin main --tags
```

### Symptom: `warning: adding embedded git repository`

**Cause:** Nested directory contains `.git` folder

**Fix:**
```bash
git rm --cached -f nested-dir
Remove-Item -Recurse -Force nested-dir
```

## Repository Reference

### Current Project

- **Repository**: tourism-geo
- **Owner**: songweilovelj-cyber
- **URL**: https://github.com/songweilovelj-cyber/tourism-geo
- **Main Branch**: main
- **Node.js**: >=18.0.0

### Version History

| Tag | Commit | Description |
|-----|--------|-------------|
| v1.1.0 | e50e13c | Project cleanup: type files, version bump, gitignore |
| v1.0.0 | abe8ff6 | Initial release - TourismGEO platform |

### Project Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand
- **Backend**: Node.js + Express + Prisma + SQLite
- **AI**: 豆包大模型 (Doubao)
- **Maps**: 高德地图 (AMap)

## Open Source Maintenance Reminders

1. **Always verify before push** - Check git status, untracked files, embedded repos
2. **Version bump** - Update `package.json` version before creating release tag
3. **Descriptive commits** - Explain "why", not just "what"
4. **Proxy first** - When push fails but browser works, proxy is always the answer on Windows
5. **Clean working tree** - Commit only intended changes; use `.gitignore` for generated files
