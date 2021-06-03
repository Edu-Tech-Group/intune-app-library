$localprograms = choco list --localonly
if ($localprograms -like "*wireshark*")
{
    choco upgrade wireshark
}
Else
{
    choco install wireshark -y
}