$testchoco = powershell choco -v
if(-not($testchoco)){
    Write-Output "Seems Chocolatey is not installed, installing now"
    Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
}

$localprograms = choco list --localonly
if ($localprograms -like "*microsoft-teams.install*")
{
    choco upgrade microsoft-teams.install --params "'/AllUsers'"
}
Else
{
    choco install microsoft-teams.install -y --params "'/AllUsers"
}