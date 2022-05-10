$localprograms = winget list 
if ($localprograms -Like "*Picto-Selector*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}