$localprograms = winget list 
if ($localprograms -Like "*BlueJ*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}