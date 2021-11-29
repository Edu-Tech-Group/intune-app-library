if (Test-Path "${Env:ProgramFiles}\Notepad++\notepad++.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}