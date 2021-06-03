# __VideoPad__
# 1. App information
Upload the included `.intunewin` file

|Field|Value|
|-----------|-----------|
|Name|VideoPad|
|Description|Designed to be intuitive, VideoPad is a fully featured video editor for creating professional quality videos in minutes.|
|Publisher|NCH Software|

# 2. Program
|Field|Value|
|-----------|-----------|
|Install command|`.\VideoPadVideoEditor.exe -LQUIET`|
|Uninstall command|`.\VideoPadVideoEditor.exe -Uninstall`|
|Install behavior|System|
|Device restart behavior|App install may force a device restart|

# 3. Requirements
|Field|Value|
|-----------|-----------|
|Operating system architecture|32-bit & 64-bit|
|Minimum operating system|Windows 10 1607|
|Disk space required (MB)||
|Physical memory required (MB)||
|Minimum number of logical processors required||
|Minimum CPU speed required (MHz)||


# 4. Detection rules

Manually configure detection rules


|Argument|Value|
|-----------|-----------|
|Rule type|File|
|Path|C:\Program Files (x86)\NCH Software\VideoPad|
|File or folder|videopad.exe|
|Detection method|File or folder exists|
|Associated with a 32-bit app on 64-bit clients|No|

# 5. Dependencies
none

# 6. Supersedence
none

# 7. Assignments
Determin how the app should be deployed

# 8. Revieuw + create
Validate your configuration and create