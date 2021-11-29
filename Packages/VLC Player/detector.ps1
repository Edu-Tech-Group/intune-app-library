if (Test-Path "${Env:ProgramFiles}\VideoLAN\VLC\vlc.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}