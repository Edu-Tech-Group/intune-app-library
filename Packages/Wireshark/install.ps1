./Wireshark-win64-3.4.6.exe /S
$installedSoftware = Get-WmiObject -Class Win32_Product

while (!(Test-Path "${env:ProgramFiles}\Wireshark\Wireshark.exe")) {
    Start-Sleep -Seconds 10
}
./nmap-7.12-setup /S

while (!(Test-Path "${env:ProgramFiles}\WinPcap\rpcapd.exe")) {
    Start-Sleep -Seconds 10
}