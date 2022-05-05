$localprograms = winget list 
if ($localprograms -Like "*GeoGebra Classic*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}