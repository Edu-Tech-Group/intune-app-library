# instalatie
./OpenBoard_Installer_1.5.4.exe /VERYSILENT

while (!(Test-Path "${env:ProgramFiles(x86)}\OpenBoard\OpenBoard.exe")) {
    Start-Sleep -Seconds 10
}