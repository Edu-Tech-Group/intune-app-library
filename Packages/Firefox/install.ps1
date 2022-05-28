param($app)

Add-AppxPackage -Path ./Microsoft.UI.Xaml.2.7_7.2203.17001.0_x64__8wekyb3d8bbwe.Appx
Add-AppxPackage -Path ./Microsoft.VCLibs.140.00.UWPDesktop_14.0.30704.0_x64__8wekyb3d8bbwe.Appx
Add-AppxPackage -Path ./Microsoft.DesktopAppInstaller_2022.127.2322.0_neutral___8wekyb3d8bbwe.Msixbundle

#Install the Requested App
winget install $app --accept-source-agreements --force

New-Item -Path "C:\Program Files\Mozilla Firefox" -ItemType "file" -Name "installed.txt" -Value "This is a install validation file for Microsoft intune. Please do not delete." -force