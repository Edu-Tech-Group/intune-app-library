$localprograms = winget list 
if ($localprograms -Like "*Firefox*")
{
    Write-Output "Found it"
    exit 0
}
else
{
    exit 1
}