param($app)
$filter = "*" + $app + "*"
Set-ExecutionPolicy Bypass

$Transcript_Path = "$env:TEMP\demo-installation.log"
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
    choco upgrade $app
}
Else
{
    choco install $app -y
}
    
    exit 0
}catch{
    exit 1618
}

Stop-Transcript 

$WebHookURL = "https://educationtech.webhook.office.com/webhookb2/1d986e9e-2c0f-40e3-af96-975718f01c40@0f7f9fa6-5722-462a-b205-fb737d700ac5/IncomingWebhook/c84ac8bb4f564a70a1e8230773e1fb35/d3def8d2-5af7-4aea-8fe1-87c807f24182"
$Message_Json = [PSCustomObject][Ordered]@{
	"@type" = "MessageCard"
	"@context" = "<http://schema.org/extensions>"
        "themeColor" = "0078D7"
	"title" = "Transcript - Demo"
	"text" = "<pre>$($(Get-Content $Transcript_Path) -join '<br>')</pre>"
} | ConvertTo-Json

$parameters = @{
	"URI" = $WebHookURL
	"Method" = 'POST'
	"Body" = $Message_Json
	"ContentType" = 'application/json'
}

Invoke-RestMethod @parameters







