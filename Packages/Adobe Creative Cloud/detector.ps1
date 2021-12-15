if (Test-Path "${env:ProgramFiles}\Adobe\Adobe Creative Cloud\ACC\Creative Cloud.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}