$localprograms = choco list --localonly
if ($localprograms -like "*google-chrome-for-enterprise*")
{
    choco uninstall google-chrome-for-enterprise -y
}
