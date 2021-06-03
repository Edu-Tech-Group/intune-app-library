$localprograms = choco list --localonly
if ($localprograms -like "*adobereader-update*")
{
    choco uninstall adobereader-update -y
}
