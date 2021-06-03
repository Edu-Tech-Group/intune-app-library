$localprograms = choco list --localonly
if ($localprograms -like "*firefox*")
{
    choco upgrade firefox
}
Else
{
    choco install firefox -y
}