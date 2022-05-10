$localprograms = winget list 
if ($localprograms -Like "*CutePDF Writer*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}