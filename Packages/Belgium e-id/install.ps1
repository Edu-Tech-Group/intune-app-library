$localprograms = choco list --localonly
if ($localprograms -like "*eid-belgium*")
{
    choco upgrade eid-belgium
}
Else
{
    choco install eid-belgium -y
}