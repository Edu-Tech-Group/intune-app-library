if (Test-Path "${Env:ProgramFiles(x86)}\Java\jre1.8.0_261\bin\java.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}