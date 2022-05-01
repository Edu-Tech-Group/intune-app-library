$localprograms = winget list 
if ($localprograms -Like "*Adobe Creative Cloud Express*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}