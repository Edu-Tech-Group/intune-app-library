if (Test-Path "${env:ProgramFiles(x86)}\Citrix\Citrix WorkSpace 2105") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}