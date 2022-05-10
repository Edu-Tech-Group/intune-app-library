$localprograms = winget list 
if ($localprograms -Like "*VLC media player*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}