$localprograms = winget list 
if ($localprograms -Like "*FileZilla Client*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}