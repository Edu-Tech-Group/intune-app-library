$localprograms = winget list 
if ($localprograms -Like "*Android Studio*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}