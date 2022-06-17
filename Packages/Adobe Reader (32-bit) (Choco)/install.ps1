param($app)
$filter = "*" + $app + "*"
Set-ExecutionPolicy Bypass

$Transcript_Path = "$env:TEMP\" + $app + ".log"
Start-Transcript $Transcript_Path
$PackageName = "chocolatey"

try{
    if(!(test-path "C:\ProgramData\chocolatey\choco.exe")){
        Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
    }

    C:\ProgramData\chocolatey\choco.exe list -lo

    choco feature enable -n=useRememberedArgumentsForUpgrades

$localprograms = choco list --localonly
if ($localprograms -like $filter)
{
    choco upgrade $app -y
}
Else
{
    choco install $app -y
}

Stop-Transcript 
    
    exit 0
}catch{

Stop-Transcript 

    exit 1618
}