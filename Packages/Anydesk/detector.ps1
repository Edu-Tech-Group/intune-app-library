$localprograms = winget list 
if ($localprograms -Like "*Advanced IP Scanner*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}