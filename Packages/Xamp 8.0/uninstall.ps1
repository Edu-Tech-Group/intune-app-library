$localprograms = choco list --localonly
if ($localprograms -like "*xampp-80*")
{
    choco uninstall xampp-80 -y
}
