$localprograms = winget list 
if ($localprograms -Like "*BlueStacks*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}