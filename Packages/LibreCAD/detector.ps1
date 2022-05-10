$localprograms = winget list 
if ($localprograms -Like "*LibreCAD*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}