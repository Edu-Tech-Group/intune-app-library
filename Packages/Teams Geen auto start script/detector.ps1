$TeamsConfig = "$env:APPDATA\Microsoft\Teams\desktop-config.json"
$TeamsConfigData = Get-Content $TeamsConfig -Raw -ea SilentlyContinue | ConvertFrom-Json
# If Teams already doesn't have the autorun config, exit
If ($TeamsConfigData)
{
 If ($TeamsConfigData.appPreferenceSettings.openAtLogin -eq $false)
 {
    Write-Host "Found it!"
 }
}
