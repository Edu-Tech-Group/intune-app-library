$localprograms = winget list 
if ($localprograms -Like "*Google Drive*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}