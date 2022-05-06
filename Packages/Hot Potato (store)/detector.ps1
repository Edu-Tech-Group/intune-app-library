$localprograms = winget list 
if ($localprograms -Like "*Hot Potato*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}