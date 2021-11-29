if (Test-Path "${Env:ProgramFiles}\Musescore 3\bin\MuseScore3.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}