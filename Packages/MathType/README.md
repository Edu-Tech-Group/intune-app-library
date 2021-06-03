# __MathType__

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
|Install command|`.\MathType-win-en.exe /S /p XXXXX-YOURK-EYGOE-SHERE-XXXXX /n {school name} /e {email} /a`|
|Uninstall command|`.\MathType-win-en.exe.exe -Uninstall`|
|Install behavior|System|
|Device restart behavior|App install may force a device restart|

## Install arguments
|Option & argument|Description|
|-----------|-----------|
|`/S`|___Required___ if you want to register MathType with a product key or enter a trial for all users. Tells the installer to run in silent mode. This option is case-sensitive; __/s__ is not the same, and will be ineffective. The installation will continue without the /S option, but it will neither register MathType nor enter into trial mode. Users will be given that option upon first running MathType.|
|`/p [PRODUCT_KEY]`|Activate MathType with a product key.|
|`/n [NAME]`|Associate the product key with a specific user or organization.|
|`/e [EMAIL]`|Associate the product key with an email address.|
|`/l [LANGUAGE]	`|Associate the product key with a language ('en', 'fr', 'de', 'jp'). If not present, __en__ is the default value.|
|`/x`|Do not receive information about MathType. In other words, don't add the email address specified with __/e__ to our mailing list.|
|`/a`|Registers the product key for all users, provided it is run as administrator.|

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
|Path|`C:\Program Files (x86)\MathType`|
|File or folder|`MathType.exe`|
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