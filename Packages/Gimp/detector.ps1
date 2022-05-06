$localprograms = winget list 
if ($localprograms -Like "*Gimp*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}