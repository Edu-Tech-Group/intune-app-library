$localprograms = choco list --localonly
if ($localprograms -like "*hotpotato*")
{
    choco uninstall hotpotato -y
}
