$localprograms = winget list 
if ($localprograms -Like "*GeoGebra 5*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}