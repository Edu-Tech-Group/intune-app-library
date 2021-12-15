if (Test-Path "C:\xampp\xampp_start.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}
