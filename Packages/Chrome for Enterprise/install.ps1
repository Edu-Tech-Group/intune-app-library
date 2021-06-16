$localprograms = choco list --localonly
if ($localprograms -like "*google-chrome-for-enterprise*")
{
    choco upgrade google-chrome-for-enterprise
}
Else
{
    choco install google-chrome-for-enterprise -y
}