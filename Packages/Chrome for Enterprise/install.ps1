﻿$testchoco = powershell choco -v
if(-not($testchoco)){
    Write-Output "Seems Chocolatey is not installed, installing now"
    Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
}

$localprograms = choco list --localonly
if ($localprograms -like "*google-chrome-for-enterprise*")
{
    choco upgrade google-chrome-for-enterprise
}
Else
{
    choco install google-chrome-for-enterprise -y
}