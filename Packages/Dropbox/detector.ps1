$localprograms = winget list 
if ($localprograms -Like "*Dropbox*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}