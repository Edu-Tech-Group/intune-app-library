$localprograms = winget list 
if ($localprograms -Like "*7-Zip*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}