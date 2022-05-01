$localprograms = winget list 
if ($localprograms -Like "*Adobe Acrobat DC (64-bit)*")
{
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}