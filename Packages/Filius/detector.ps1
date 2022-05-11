$localprograms = winget list 
if ($localprograms -Like "*Filius*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}