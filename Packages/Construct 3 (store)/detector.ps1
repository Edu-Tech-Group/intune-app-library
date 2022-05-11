$localprograms = winget list 
if ($localprograms -Like "*Construct 3*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}