$localprograms = winget list 
if ($localprograms -Like "*Crescendo Music Notation Free*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}