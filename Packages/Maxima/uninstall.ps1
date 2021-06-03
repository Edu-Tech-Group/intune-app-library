$localprograms = choco list --localonly
if ($localprograms -like "*maxima*")
{
    choco uninstall maxima -y
}
