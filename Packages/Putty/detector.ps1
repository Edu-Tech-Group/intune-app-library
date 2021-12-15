if (Test-Path "${Env:ProgramData}\chocolatey\lib\putty.portable\tools\PUTTY.EXE") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}