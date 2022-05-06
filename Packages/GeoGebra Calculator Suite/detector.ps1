$localprograms = winget list 
if ($localprograms -Like "*GeoGebra Calculator Suite*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}