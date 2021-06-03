$localprograms = choco list --localonly
if ($localprograms -like "*wireshark*")
{
    choco uninstall wireshark -y
}
