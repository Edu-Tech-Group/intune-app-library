$localprograms = choco list --localonly
if ($localprograms -like "*db-visualizer*")
{
    choco uninstall db-visualizer -y
}
