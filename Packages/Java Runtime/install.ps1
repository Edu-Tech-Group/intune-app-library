$localprograms = choco list --localonly
if ($localprograms -like "*javaruntime*")
{
    choco upgrade javaruntime
}
Else
{
    choco install javaruntime -y
}