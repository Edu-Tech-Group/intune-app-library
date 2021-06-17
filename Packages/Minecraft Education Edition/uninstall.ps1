$localprograms = choco list --localonly
if ($localprograms -like "*minecraft-education*")
{
    choco uninstall minecraft-education -y --ignore-checksums
}
