$localprograms = choco list --localonly
if ($localprograms -like "*adobeair*")
{
    choco uninstall adobeair -y
}
