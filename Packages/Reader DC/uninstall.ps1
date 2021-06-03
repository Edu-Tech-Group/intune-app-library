$localprograms = choco list --localonly
if ($localprograms -like "*adobereader*")
{
    choco uninstall adobereader -y
}
