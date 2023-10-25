<#
#### Win32App Commands ####

Install:
powershell.exe -executionpolicy bypass -file .\Install-Printer.ps1

Uninstall:
cmd /c

Detection:
HKEY_LOCAL_MACHINE\Software\Microsoft\Windows NT\CurrentVersion\Print\Printers\Kopieermachine Molenstraat
Name = "Canon Printer Upstairs"

#>

$INFARGS = @(
    "-i"
    "-a"
    "oemsetup.inf"
)

Try {
    #Add driver to driver store
    Start-Process pnputil.exe -ArgumentList $INFARGS -Wait -NoNewWindow

    #Install driver
    Add-PrinterDriver -Name "PCL6 Driver for Universal Print" -Confirm:$false
}
Catch {
    Write-Warning "Error Installing Printer driver"
}