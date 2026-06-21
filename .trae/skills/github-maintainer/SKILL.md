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

### 3. Create Version Branch & Tag

```bash
git checkout -b v1.1.0
git tag -a v1.1.0 -m "Version 1.1.0"
```

### 4. Configure System Proxy (CRITICAL for Windows)

Check Windows system proxy:
```powershell
Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" | Select-Object ProxyServer
```

If a proxy exists (e.g., `127.0.0.1:7892`), configure git to use it:
```bash
git config http.proxy http://127.0.0.1:7892
git config https.proxy http://127.0.0.1:7892
```

### 5. Configure SSL & Push

```bash
git config http.sslBackend schannel
git config http.sslVerify false
git push origin main --tags
```

## Success Configuration

| Setting | Value |
|---------|-------|
| Remote URL | `https://<token>@github.com/<username>/<repo>.git` |
| HTTP/HTTPS Proxy | `http://127.0.0.1:7892` (detect from Windows) |
| SSL Backend | `schannel` (Windows native) |
| SSL Verify | `false` |
| Post Buffer | `524288000` |

## Repository Information

- **Repository**: tourism-geo
- **Owner**: songweilovelj-cyber
- **URL**: https://github.com/songweilovelj-cyber/tourism-geo

## Version Branches & Tags

- `v1.0.0` - Initial release with complete tourism GEO platform
- `v1.1.0` - Image upload fix, AI content generation, publish to landing page

## Troubleshooting

**Connection Issues (浏览器能连上但git连不上)**:
- **Check Windows system proxy**: Browser auto-detects proxy but git doesn't
- Get proxy address: `Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" | Select-Object ProxyServer`
- Set git proxy: `git config http.proxy http://<proxy-ip>:<port>`

**Push Failures**:
- Use Windows SSL stack: `git config http.sslBackend schannel`
- Disable SSL verification: `git config http.sslVerify false`
- Increase post buffer: `git config http.postBuffer 524288000`
