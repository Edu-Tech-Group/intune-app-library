$localprograms = winget list 
if ($localprograms -Like "*Java 8*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}