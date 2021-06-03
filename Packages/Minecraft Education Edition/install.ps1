$localprograms = choco list --localonly
if ($localprograms -like "*minecraft-education*")
{
    choco upgrade minecraft-education --ignore-checksums
}
Else
{
    choco install minecraft-education -y --ignore-checksums
}