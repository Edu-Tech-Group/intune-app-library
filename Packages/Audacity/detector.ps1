$localprograms = winget list 
if ($localprograms -Like "*Audacity.Audacity*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}