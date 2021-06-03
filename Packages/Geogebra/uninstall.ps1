$localprograms = choco list --localonly
if ($localprograms -like "*geogebra*")
{
    choco uninstall geogebra -y
}
