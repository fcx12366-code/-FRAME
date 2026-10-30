param(
  [string]$InstallerPath = (Join-Path $env:USERPROFILE '.codex\skills\.system\skill-installer\scripts\install-skill-from-github.py')
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$destination = Join-Path $projectRoot '.agents\skills'
if (-not (Test-Path -LiteralPath $InstallerPath)) { throw '请提供 Codex 内置 install-skill-from-github.py 的路径。' }
$configPath = Join-Path $env:USERPROFILE '.codex\config.toml'
if (Test-Path -LiteralPath $configPath) {
  $backupDirectory = Join-Path $projectRoot 'work\backups'
  New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
  $backupPath = Join-Path $backupDirectory ('codex-config.before-skills.' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.toml')
  if (Test-Path -LiteralPath $backupPath) { throw '备份路径已存在，停止以避免覆盖。' }
  Copy-Item -LiteralPath $configPath -Destination $backupPath
}
$skills = @(
  @{ Repo='educlopez/ui-craft'; Ref='49b751742b013ebb3e0495eb7992423185f04be0'; Path='skills/ui-craft'; Name='ui-craft' },
  @{ Repo='nextlevelbuilder/ui-ux-pro-max-skill'; Ref='28b3b8dee8c976df4fa3e94aed4e092ad43fcb03'; Path='.claude/skills/ui-ux-pro-max'; Name='ui-ux-pro-max' },
  @{ Repo='vercel-labs/agent-skills'; Ref='1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62'; Path='skills/web-design-guidelines'; Name='web-design-guidelines' }
)
foreach ($skill in $skills) {
  $skillPath = Join-Path $destination $skill.Name
  if (Test-Path -LiteralPath $skillPath) {
    if (-not (Test-Path -LiteralPath (Join-Path $skillPath 'SKILL.md'))) { throw "已有目录缺少 SKILL.md，请人工检查：$skillPath" }
    Write-Output "保留已有 Skill：$($skill.Name)"
    continue
  }
  python $InstallerPath --repo $skill.Repo --ref $skill.Ref --path $skill.Path --dest $destination --method download
  if ($LASTEXITCODE -ne 0) { throw "安装失败：$($skill.Name)" }
  if (-not (Test-Path -LiteralPath (Join-Path $skillPath 'SKILL.md'))) { throw '安装后验证失败。' }
}
Write-Output '项目级 Skill 已验证。全局配置未修改；下一轮可自动发现。'
