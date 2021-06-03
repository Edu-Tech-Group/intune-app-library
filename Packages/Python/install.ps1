$localprograms = choco list --localonly
if ($localprograms -like "*python*")
{
    choco upgrade python
}
Else
{
    choco install python -y
}