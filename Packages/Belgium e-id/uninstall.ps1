$localprograms = choco list --localonly
if ($localprograms -like "*eid-belgium*")
{
    choco uninstall eid-belgium -y
}
