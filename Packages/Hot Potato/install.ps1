$testchoco = powershell choco -v
if(-not($testchoco)){
    Write-Output "Seems Chocolatey is not installed, installing now"
    Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
}

$localprograms = choco list --localonly
if ($localprograms -like "*hotpotato*")
{
    choco upgrade hotpotato
}
Else
{
    choco install hotpotato -y
}