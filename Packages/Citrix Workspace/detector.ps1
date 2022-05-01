$localprograms = winget list 
if ($localprograms -Like "*Citrix.Workspace*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}