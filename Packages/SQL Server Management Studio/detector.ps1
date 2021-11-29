if (Test-Path "${env:Program Files(x86)}\Microsoft SQL Server Management Studio 18\Common7\IDE\Ssms.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}