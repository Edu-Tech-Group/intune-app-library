<#
.Synopsis
Created on:   01/12/2021
Created by:   Ben Whitmore
Filename:     Install-Printer.ps1

Simple script to install a network printer from an INF file. The INF and required CAB files should be in the same directory as the script when creating a Win32app

#### Win32App Commands ####

Install:
powershell.exe -executionpolicy bypass -file .\Install-Printer.ps1

Uninstall:
cmd /c

Detection:
HKEY_LOCAL_MACHINE\Software\Microsoft\Windows NT\CurrentVersion\Print\Printers\PROFESSEUR
Name = "PROFESSEUR"

#>

# [CmdletBinding()]


$INFARGS = @(
    "-i"
    "-a"
    "E_JFB0DE.INF"
)

Try {
    #Add driver to driver store
    Start-Process pnputil.exe -ArgumentList $INFARGS -Wait -NoNewWindow

    #Install driver
    Add-PrinterDriver -Name "Epson Universal Print Driver" -Confirm:$false -ErrorAction SilentlyContinue

    #Create Printer Port
    $PortExist = Get-Printerport -Name "IP_10.0.142.32" -ErrorAction SilentlyContinue
    if (-not $PortExist) {
        Add-PrinterPort -name "IP_10.0.250.1" -PrinterHostAddress "10.0.250.1" -Confirm:$false -ErrorAction SilentlyContinue
    }

    #Add Printer
    Add-Printer -Name "BIBLIOTHEQUE" -DriverName "Epson Universal Print Driver" -PortName "IP_10.0.250.1" -Confirm:$false
}
Catch {
    Write-Warning "Error Installing Printer"
}