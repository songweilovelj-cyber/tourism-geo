---
name: "github-maintainer"
description: "Maintains GitHub repositories: commits changes, creates branches, pushes to remote, and manages versions. Invoke when user wants to upload code to GitHub or manage repository versions."
---

# GitHub Maintainer

This skill provides a complete workflow for maintaining GitHub repositories, including committing changes, creating branches, and pushing to remote repositories.

## Usage

### 1. Configure GitHub Token

```bash
git remote set-url origin https://<token>@github.com/<username>/<repo>.git
```

### 2. Commit Changes

```bash
git add -A
git commit -m "commit message"
```

### 3. Create Version Branch

```bash
git checkout -b v1.0.0
```

### 4. Push to Remote

```bash
git push origin v1.0.0
```

## Success Configuration

| Setting | Value |
|---------|-------|
| Remote URL | `https://<token>@github.com/<username>/<repo>.git` |
| SSL Verify | `false` |
| Post Buffer | `524288000` |

## Repository Information

- **Repository**: tourism-geo
- **Owner**: songweilovelj-cyber
- **URL**: https://github.com/songweilovelj-cyber/tourism-geo

## Version Branches

- `v1.0.0` - Initial release with complete tourism GEO platform

## Troubleshooting

**Connection Issues**:
- Ensure HTTPS protocol is used (not HTTP)
- Verify token has `repo` permission
- Check network connectivity with `ping github.com`

**Push Failures**:
- Increase post buffer: `git config http.postBuffer 524288000`
- Disable SSL verification: `git config http.sslVerify=false`
