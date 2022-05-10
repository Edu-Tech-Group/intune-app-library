$localprograms = winget list 
if ($localprograms -Like "*CDBurnerXP*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}