$localprograms = choco list --localonly
if ($localprograms -like "*notepadplusplus*")
{
    choco upgrade notepadplusplus
}
Else
{
    choco install notepadplusplus -y
}