./AdobeAIRInstaller.exe -silent -eulaAccepted./Wireshark-win64-3.4.6.exe /S
while (!(Test-Path "${env:ProgramFiles(x86)}\Adobe\Flash Player\AddIns\airappinstaller\airappinstaller.exe")) {
    Start-Sleep -Seconds 10
}