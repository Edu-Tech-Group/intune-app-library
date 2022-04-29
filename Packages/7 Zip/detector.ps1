$localprograms = winget list 
if ($localprograms -like "*7zip*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}