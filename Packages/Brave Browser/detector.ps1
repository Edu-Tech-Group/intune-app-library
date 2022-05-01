$localprograms = winget list 
if ($localprograms -Like "*BraveSoftware.BraveBrowser*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}