# Turnin's Blog 局域网共享一键配置
# 用法：右键"开始"按钮 -> 终端(管理员) 或 Windows PowerShell(管理员)，然后执行：
#   powershell -ExecutionPolicy Bypass -File D:\project\blog\hans-blog-master\scripts\setup-lan-share.ps1
# 完成后，同一 Wi-Fi/局域网下的设备访问 http://<你的电脑IP>:3000 即可打开博客。

$ErrorActionPreference = "Stop"

# 1. 放行防火墙 3000 端口
if (-not (Get-NetFirewallRule -DisplayName "TurninBlog-3000" -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -DisplayName "TurninBlog-3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow | Out-Null
    Write-Host "[OK] 防火墙规则 TurninBlog-3000 已创建"
} else {
    Write-Host "[OK] 防火墙规则已存在"
}

# 2. 创建 SYSTEM 计划任务：每 5 分钟把 WSL 的 3000 端口代理到 127.0.0.1 和本机局域网 IP
$script = @'
$wslip = (wsl bash -c "hostname -I | awk '{print `$1}'").Trim()
if ($wslip) {
    $winip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
        $_.InterfaceAlias -notmatch "Loopback|vEthernet" -and $_.IPAddress -notlike "169.*"
    } | Select-Object -First 1).IPAddress
    foreach ($addr in @("127.0.0.1", $winip)) {
        netsh interface portproxy delete v4tov4 listenaddress=$addr listenport=3000 | Out-Null
        netsh interface portproxy add v4tov4 listenaddress=$addr listenport=3000 connectaddress=$wslip connectport=3000 | Out-Null
    }
}
'@
$taskScript = Join-Path $env:ProgramData "turnin-blog-portproxy.ps1"
Set-Content -Path $taskScript -Value $script -Encoding UTF8

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$taskScript`""
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5)
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "TurninBlog-PortProxy" -Action $action -Trigger $trigger -Principal $principal -Force | Out-Null
Write-Host "[OK] 计划任务 TurninBlog-PortProxy 已创建（每 5 分钟自动刷新端口代理）"

# 3. 立即执行一次
& powershell -NoProfile -ExecutionPolicy Bypass -File $taskScript

$winip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -notmatch "Loopback|vEthernet" -and $_.IPAddress -notlike "169.*"
} | Select-Object -First 1).IPAddress
Write-Host ""
Write-Host "完成！局域网内访问地址: http://${winip}:3000" -ForegroundColor Green
