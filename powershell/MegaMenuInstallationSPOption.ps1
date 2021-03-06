﻿ if ((Get-PSSnapin | Where-Object {$_.Name -eq 'Microsoft.SharePoint.Powershell'})-eq $null) 
    {
    	Add-PSSnapin "Microsoft.SharePoint.Powershell"
    }

<# This script copies all contents from SiteAssets Library of Root Site collection to Target Site collection.
It is expected from admin to open RegisterScript.aspx after running this script from 
Target Site Collection's SiteAssets library\Scripts folder and click on "Auto Install All Needed Actions" button.
#>

# Varaibles definitions and user inputs
Write-Host "If Target Site Collection is not a clean/new site collection, then please delete branding files from 'Site Assets' library of Target Site Collection. This Utility will not override any file or folder and will display an error if file already exists."

[void](Read-Host 'Press Enter to continue…')

$targetSiteCollection= Read-Host "Please enter Target Site Collection URL, where you want mega menu and branding to be applied (Example: https://go.conaresources.com/teams/Projects)"
if($targetSiteCollection){
    $sourceSiteCollection = "https://go.conaresources.com"
    $sourceAssetLibraryTitle = "Site Assets"
    #$targetSiteCollection = "https://go.conaresources.com/teams/Projects"
    $targetAssetLibraryTitle = "Site Assets"

    # Get Site Collections here
    $sourceWeb = Get-SPWeb $sourceSiteCollection

    #To dectivate MDS feature 
    If($destinationWeb.EnableMinimalDownload -eq 1)
    {
        Write-Host "Minimal Download Strategy is Enabled for this site!";
        Write-Host "Disabling....";
        Disable-SPFeature –identity "MDSFeature" -URL $destinationWeb.URL -confirm:$false
    }   

    # Get list objects here
    $sourceList = $sourceWeb.Lists | ? {$_.Title -eq $sourceAssetLibraryTitle}
    # Get Site Collections here
    $destinationWeb = Get-SPWeb $targetSiteCollection
    # Get list objects here
    $destinationList = $destinationWeb.Lists | ? {$_.title -like $targetAssetLibraryTitle}
    $allFolders = $sourceList.Folders
    $rootFolder = $sourceList.rootFolder
    $rootItems = $rootFolder.files
    #Loop
    foreach($rootItem in $rootItems)
    {
        $sourceStream = $rootItem.OpenBinary()
        $destinationFileItem = $destinationList.rootFolder.Files.Add($rootItem.Name, $sourceStream, $true)
        $destinationFileItem.Update()
    }

    #Loop for rest of the folders

    foreach($folder in $allFolders)
    {
        Remove-Variable ParentFolderURL
        $cnt = 0
        $folderURL = $folder.url.Split("/")
        while($cnt -lt ($folderURL.count-1))
        {
        $ParentFolderURL = "$ParentFolderURL/" + $folderURL[$cnt]
        $cnt++
        }
        
        $currFolder = $destinationList.Folders | ? {$_.url -eq $ParentFolderURL.substring(1)}
        if(!($currFolder.Folders | ? {$_.name -eq $folder.Name}))
        {
            $tmpFolder = $destinationList.Folders.Add(("$targetSiteCollection" + $ParentFolderURL), [Microsoft.SharePoint.SPFileSystemObjectType]::Folder, $folder.name)
            $tmpFolder.update()
        }
        else
        {
            $tmpFolder = $destinationList.Folders | ? {$_.name -eq $folder.Name}
        }
        
        $allFiles = $sourceList.Items
        $sourceItems = $folder.folder.Files
        
        if($folder.Folder.Files.count -gt 0)
        {
            foreach($item in $sourceItems)
            {
                $Relative = ($Item.ServerRelativeUrl).substring(1)
                $TargetItem = $allFiles | ? {$_.URL -eq $Relative}
                $sourceStream = $TargetItem.File.OpenBinary()
                $destinationFileItem = $tmpFolder.Folder.Files.Add($TargetItem.Name, $sourceStream, $true)
                $destinationFileItem.Update()
            }
        }
    }
    Write-Host "Deployement is successful!"
}
else{
    Write-Host "Please make sure that Target Site Collection Url is valid, exiting...!"
}