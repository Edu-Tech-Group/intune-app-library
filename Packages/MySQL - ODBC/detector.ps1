if (Test-Path "${env:ProgramFiles}\MySQL\Connector ODBC 5.3\myodbc-installer.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}