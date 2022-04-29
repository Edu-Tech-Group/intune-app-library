param($app)

#Install Winget if not yet installed
#Installing winget Dependencies"
Add-AppxPackage -Path 'https://aka.ms/Microsoft.VCLibs.x64.14.00.Desktop.appx'

#Getting newest winget Release
$releases_url = 'https://api.github.com/repos/microsoft/winget-cli/releases/latest'

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$releases = Invoke-RestMethod -uri $releases_url
$latestRelease = $releases.assets | Where { $_.browser_download_url.EndsWith('msixbundle') } | Select -First 1

 # Installing winget
 Add-AppxPackage -Path $latestRelease.browser_download_url

#Uninstall the Requested App

winget uninstall $app