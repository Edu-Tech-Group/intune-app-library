$localprograms = choco list --localonly
if ($localprograms -like "*javaruntime*")
{
    choco uninstall minecraft-education -y --ignore-checksums
}
