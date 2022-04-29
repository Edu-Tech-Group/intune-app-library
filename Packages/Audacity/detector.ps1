$localprograms = winget list 
if ($localprograms -like "*audacity*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}