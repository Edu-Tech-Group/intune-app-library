$localprograms = winget list 
if ($localprograms -Like "*Tux Paint*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}