$localprograms = winget list 
if ($localprograms -Like "*Brave*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}