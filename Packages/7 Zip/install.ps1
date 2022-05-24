param($app)

#Install Winget if not yet installed

$hasPackageManager = Get-AppPackage -name "Microsoft.DesktopAppInstaller"

if(!$hasPackageManager)
{
	Add-AppxPackage -Path ./Microsoft.UI.Xaml.2.7_7.2203.17001.0_x64__8wekyb3d8bbwe.Appx
	Add-AppxPackage -Path ./Microsoft.VCLibs.140.00.UWPDesktop_14.0.30704.0_x64__8wekyb3d8bbwe.Appx
	Add-AppxPackage -Path ./Microsoft.DesktopAppInstaller_2021.1207.203.0_neutral___8wekyb3d8bbwe.AppxBundle
}

#Install the Requested App
winget install $app --accept-source-agreements --force