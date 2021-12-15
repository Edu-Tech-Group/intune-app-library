if (Test-Path "${Env:ProgramFiles}\Google\Drive File Stream") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}