$localprograms = winget list 
if ($localprograms -Like "*Atom*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}