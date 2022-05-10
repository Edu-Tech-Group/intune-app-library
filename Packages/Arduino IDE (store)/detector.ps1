$localprograms = winget list 
if ($localprograms -Like "*Arduino IDE*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}