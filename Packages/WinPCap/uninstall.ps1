$localprograms = choco list --localonly
if ($localprograms -like "*winpcap*")
{
    choco uninstall winpcap
}
