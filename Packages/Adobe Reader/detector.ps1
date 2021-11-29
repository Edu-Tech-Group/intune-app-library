if (Test-Path "${env:ProgramFiles(x86)}\Adobe\Acrobat Reader DC\Reader\AcroRd32.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}