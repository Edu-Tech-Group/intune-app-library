<#
.Synopsis
Created on:   01/12/2021
Created by:   Ben Whitmore
Filename:     Install-Printer.ps1

Simple script to install a network printer from an INF file. The INF and required CAB files should be in the same directory as the script when creating a Win32app

#### Win32App Commands ####

Install:
powershell.exe -executionpolicy bypass -file .\Install-Printer.ps1 -PortName "IP_192.168.1.45" -PrinterIP "192.168.1.45" -PrinterName "Kopieermachine Molenstraat" -DriverName "Canon Generic Plus PCL6" -INFFile "Cnp60MA64.INF"

Uninstall:
cmd /c

Detection:
HKEY_LOCAL_MACHINE\Software\Microsoft\Windows NT\CurrentVersion\Print\Printers\Kopieermachine Molenstraat
Name = "Canon Printer Upstairs"

#>

# [CmdletBinding()]


$INFARGS = @(
    "-i"
    "-a"
    "Cnp60MA64.INF"
)

Try {
    #Add driver to driver store
    Start-Process pnputil.exe -ArgumentList $INFARGS -Wait -NoNewWindow

    #Install driver
    Add-PrinterDriver -Name "Canon Generic Plus PCL6" -Confirm:$false

    #Create Printer Port
    $PortExist = Get-Printerport -Name "IP_192.168.1.45" -ErrorAction SilentlyContinue
    if (-not $PortExist) {
        Add-PrinterPort -name "IP_192.168.1.45" -PrinterHostAddress "192.168.1.45" -Confirm:$false
    }

    #Add Printer
    Add-Printer -Name "Kopieermachine Molenstraat" -DriverName "Canon Generic Plus PCL6" -PortName "IP_192.168.1.45" -Confirm:$false
}
Catch {
    Write-Warning "Error Installing Printer"
}