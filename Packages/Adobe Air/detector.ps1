if (Test-Path "${env:ProgramFiles(x86)}\Adobe\Flash Player\AddIns\airappinstaller\airappinstaller.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}