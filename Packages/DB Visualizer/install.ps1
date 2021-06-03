$localprograms = choco list --localonly
if ($localprograms -like "*db-visualizer*")
{
    choco upgrade db-visualizer
}
Else
{
    choco install db-visualizer -y
}