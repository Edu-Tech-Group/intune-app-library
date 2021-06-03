$localprograms = choco list --localonly
if ($localprograms -like "*javaruntime*")
{
    choco uninstall javaruntime -y
}
