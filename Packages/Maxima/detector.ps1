if (Test-Path "C:\maxima-5.44.0\bin\wxmaxima.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}