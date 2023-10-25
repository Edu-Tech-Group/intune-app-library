<#
.Synopsis
Created on:   01/12/2021
Created by:   Ben Whitmore
Filename:     Install-Printer.ps1

Simple script to install a network printer from an INF file. The INF and required CAB files should be in the same directory as the script when creating a Win32app

#### Win32App Commands ####

Install:
powershell.exe -executionpolicy bypass -file .\Install-Printer.ps1 -PortName "IP_192.168.10.185" -PrinterIP "192.168.10.185" -PrinterName "Konica bizhub c258" -DriverName "KONICA MINOLTA Universal V4 PCL" -INFFile "KOBxxK__01.inf"

Uninstall:
cmd /c

Detection:
HKEY_LOCAL_MACHINE\Software\Microsoft\Windows NT\CurrentVersion\Print\Printers\Canon Printer Upstairs
Name = "Canon Printer Upstairs"

.Example
Install-Printer.ps1 -PortName "IP_10.10.1.1" -PrinterIP = "10.1.1.1" -PrinterName = "Canon Printer Upstairs" -DriverName = "Canon Generic Plus UFR II" -INFFile = "CNLB0MA64.inf"
#>

# [CmdletBinding()]


$INFARGS = @(
    "-i"
    "-a"
    "KOBxxK__01.inf"
)

Try {
    #Add driver to driver store
    Start-Process pnputil.exe -ArgumentList $INFARGS -Wait -NoNewWindow

    #Install driver
    Add-PrinterDriver -Name "KONICA MINOLTA Universal V4 PCL" -Confirm:$false

    #Create Printer Port
    $PortExist = Get-Printerport -Name "IP_192.168.10.185" -ErrorAction SilentlyContinue
    if (-not $PortExist) {
        Add-PrinterPort -name "IP_192.168.10.185" -PrinterHostAddress "192.168.10.185" -Confirm:$false
    }

    #Add Printer
    Add-Printer -Name "Konica bizhub c258" -DriverName "KONICA MINOLTA Universal V4 PCL" -PortName "IP_192.168.10.185" -Confirm:$false
}
Catch {
    Write-Warning "Error Installing Printer"
}