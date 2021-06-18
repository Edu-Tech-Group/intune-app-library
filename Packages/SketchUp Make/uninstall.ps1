$localprograms = choco list --localonly
if ($localprograms -like "*sketchup*")
{
    choco uninstall sketchup -y
}
