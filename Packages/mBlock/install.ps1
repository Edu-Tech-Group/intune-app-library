Start-Process "V5.3.5.exe"
While (!(Get-Process DRVSETUP64 -ea SilentlyContinue))
{
  Start-Sleep -Seconds 1
}
netsh advfirewall firewall add rule name="mblock" protocol=udp dir=in action=allow program="C:\Users\Public\Programs\mblock\mblock.exe" enable=yes profile=domain
netsh advfirewall firewall add rule name="mblock" protocol=tcp dir=in action=allow program="C:\Users\Public\Programs\mblock\mblock.exe" enable=yes profile=domain
taskkill /IM DRVSETUP64.exe /F
taskkill /IM V5.3.5.exe /F