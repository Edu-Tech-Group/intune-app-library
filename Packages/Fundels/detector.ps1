$localprograms = winget list 
if ($localprograms -Like "*Fundels*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}