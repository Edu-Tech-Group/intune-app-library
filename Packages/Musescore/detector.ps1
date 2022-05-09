$localprograms = winget list 
if ($localprograms -Like "*MuseScore*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}