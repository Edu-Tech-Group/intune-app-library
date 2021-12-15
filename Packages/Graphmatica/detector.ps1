if (Test-Path "${Env:ProgramFiles(x86)}\Graphmatica\Graphmatica.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}