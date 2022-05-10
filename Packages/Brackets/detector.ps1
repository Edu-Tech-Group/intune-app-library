$localprograms = winget list 
if ($localprograms -Like "*Brackets*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}