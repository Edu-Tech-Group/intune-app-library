$localprograms = choco list --localonly
if ($localprograms -like "*notepadplusplus*")
{
    choco uninstall notepadplusplus -y
}
