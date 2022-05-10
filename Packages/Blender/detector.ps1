$localprograms = winget list 
if ($localprograms -Like "*Blender*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}