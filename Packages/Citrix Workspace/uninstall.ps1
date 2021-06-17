$localprograms = choco list --localonly
if ($localprograms -like "*citrix-workspace*")
{
    choco uninstall citrix-workspace -y
}
