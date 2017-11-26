
if ((Get-PSSnapin | Where-Object {$_.Name -eq 'Microsoft.SharePoint.Powershell'}) -eq $null) {
    Add-PSSnapin "Microsoft.SharePoint.Powershell"
}
function Write-SPLog {
    <#
    .SYNOPSIS
    This function writes log information to a SharePoint List
    .DESCRIPTION
    This function writes log information to a SharePoint List
    .EXAMPLE
    Give an example of how to use it
    .EXAMPLE
    Give another example of how to use it
    .PARAMETER web
    The SharePoint Web Object. Just one.
    .PARAMETER listName
    The SharePoint List Name. Just one.
    .PARAMETER stepNumber
    The Step Number such as 1, 2,3. Just one.
    .PARAMETER logTitle
    The Log Title to query. Just one.
    .PARAMETER logDescription
    The description to log, it can be multiple lines.
    #>
    [CmdletBinding(SupportsShouldProcess=$True, ConfirmImpact='Low')]
    param
    (
      [Parameter(Mandatory=$True,
      ValueFromPipeline=$True)]
      [Microsoft.SharePoint.SPWeb]$web,  
      [string]$listName,   
      [string]$stepNumber,          
      [string]$logTitle,
      [string]$logDescription
    )
  
    begin {
    write-verbose "Writing into SharePoint List $listName"      
    }
  
    process {
        $list = $web.Lists[$listName]
        #Create a new item
        $newItem = $list.Items.Add()
         
        #Add properties to this list item
        $newItem["Title"] = $logTitle
        $newItem["Description"] = $logDescription
        $newItem["StepNumber"] = $stepNumber         
        #Update the object so it gets saved to the list
        $newItem.Update()
    }
  }

#Call the Web Service here
$SPWeb = Get-SPWeb "https://go.conaresources.com/sites/pa"

$configList = $SPWeb.Lists["Config"]
if ($configList) {

    $configListItem = $configList.Items | Where-Object {$_["Title"] -eq "localUnProcessedDrawingFilesFolderPath"}
    #Write-Host $configListItem["Value"]
    $localUnProcessedDrawingFilesFolderPath = $configListItem["Value"]
    if(!$localUnProcessedDrawingFilesFolderPath){
        Write-SPLog $SPWeb $auditLogListName "1" "Missing Variable::localUnProcessedDrawingFilesFolderPath" "Missing Variable::localUnProcessedDrawingFilesFolderPath in Config List!"
    }

    $configListItem = $configList.Items | Where-Object {$_["Title"] -eq "localProcessedDrawingFilesFolderPath"}
    #Write-Host $configListItem["Value"]
    $localProcessedDrawingFilesFolderPath = $configListItem["Value"]

    if(!$localProcessedDrawingFilesFolderPath){
        Write-SPLog $SPWeb $auditLogListName "2" "Missing Variable::localProcessedDrawingFilesFolderPath" "Missing Variable::localProcessedDrawingFilesFolderPath in Config List!"
            }
    $configListItem = $configList.Items | Where-Object {$_["Title"] -eq "DPExePath"}
    #Write-Host $configListItem["Value"]
    $block = $configListItem["Value"]
    if(!$block){
        Write-SPLog $SPWeb $auditLogListName "3" "Missing Variable::DPExePath" "Missing Variable::DPExePath in Config List!"
            }
    #Write-Host $localUnProcessedDrawingFilesFolderPath, $localProcessedDrawingFilesFolderPath, $block
    $configListItem = $configList.Items | Where-Object {$_["Title"] -eq "DropOffLibraryTitle"}
    $docLibraryName = $configListItem["Value"]
    if(!$docLibraryName){
        Write-SPLog $SPWeb $auditLogListName "4" "Missing Variable::DropOffLibraryTitle" "Missing Variable::DropOffLibraryTitle in Config List!"
            }
    $configListItem = $configList.Items | Where-Object {$_["Title"] -eq "ProcessedFilesLibaryTitle"}
    $targetdocLibraryName = $configListItem["Value"]
    if(!$targetdocLibraryName){
        Write-SPLog $SPWeb $auditLogListName "5" "Missing Variable::ProcessedFilesLibaryTitle" "Missing Variable::ProcessedFilesLibaryTitle in Config List!"
            }
    $configListItem = $configList.Items | Where-Object {$_["Title"] -eq "AuditLogListName"}
    $auditLogListName = $configListItem["Value"]
    if(!$auditLogListName){
        Write-SPLog $SPWeb $auditLogListName "6" "Missing Variable::AuditLogListName" "Missing Variable::AuditLogListName in Config List!"
            }
    #$docLibraryName = "Drawing Files Drop Off Library"
    $list = $SPWeb.Lists[$docLibraryName]

    $docfiles = $list.Items | Where-Object {$_["Processed"] -like "False"}

    foreach ($docfile in $docfiles) {

        #Download each file here
        #Powershell identifies any drawing files in DMS to be converted (via metadata) and copies them to the Temp Input folder on the server
        $bin = $SPWeb.GetFile($docfile.Url).OpenBinary()
        #Write-Host $docfile["Processed"]

        $opendoc = New-Object System.IO.FileStream($localUnProcessedDrawingFilesFolderPath + $docfile.Name), create
        $docgen = New-Object System.IO.BinaryWriter($opendoc)
        $docgen.Write($bin)
        $docgen.Close() 
        $fileName=$docfile.Name
        Write-SPLog $SPWeb $auditLogListName "7" "File ($fileName) is downloaded::$localUnProcessedDrawingFilesFolderPath" "The File ($fileName) is successfully downloaded to $localUnProcessedDrawingFilesFolderPath!"
        Write-host "Download Completed for" $docfile.Name

        #Powershell updates meta data for copied drwaning file so that they are not processed again
        $docfile.Properties["Processed"] = "True"
        $docfile.Update()
        Write-SPLog $SPWeb $auditLogListName "8" "File ($fileName)'s metadata is updated" "The File ($fileName)'s metadata is updated successfully in SharePoint Library: $docLibraryName"
        Write-host "File's metadata is updated successfully: " $docfile.Name
    }

    $sourceCount = (Get-ChildItem $localUnProcessedDrawingFilesFolderPath | Measure-Object ).Count


    write-host "Sharepoint Count:" $docfiles.Count "Copied items: " $sourceCount

    if ($docfiles.Count -eq $sourceCount -and $sourceCount -gt 0) {
        #Powershell initiates the DWG to PDF converter via command line with the appropriate parameters and DWG to PDF converts all files in the Temp Input folder and copies them to the Temp Output folder

        $myarg = '/InFolder' + $localUnProcessedDrawingFilesFolderPath + ' /OutFolder' + $localProcessedDrawingFilesFolderPath + ' /ConvertType DWG2PDF' + ' /IncSubFolder'

        Start-Process -FilePath $block -ArgumentList $myarg -Wait -NoNewWindow

        Write-SPLog $SPWeb $auditLogListName "9" "Folder ($localUnProcessedDrawingFilesFolderPath)'s files are converted" "Folder ($localUnProcessedDrawingFilesFolderPath)'s files are converted!"
        # Move processed files back to SharePoint and a backup on drive

        #Open web and library
        #$subFolderName = "ProcessedDesignFiles" 
        $targetdocLibrary = $SPWeb.Lists[$targetdocLibraryName] 
        #Attach to local folder and enumerate through all files
        $files = ([System.IO.DirectoryInfo] (Get-Item $localProcessedDrawingFilesFolderPath)).GetFiles() | ForEach-Object { 

            #Create file stream object from file
            $conFileName=$_.Name
            $fileStream = ([System.IO.FileInfo] (Get-Item $_.FullName)).OpenRead()
            $contents = new-object byte[] $fileStream.Length
            $fileStream.Read($contents, 0, [int]$fileStream.Length);
            $fileStream.Close(); 
            
            
            write-host "Copying" $conFileName "to" $targetdocLibrary.Title "in" $SPWeb.Title "..." 

            #Add file
            #$folder = $SPWeb.getfolder($docLibrary.RootFolder.Name + "/" + $subFolderName) ##Changed code here to get subfolder
            $folder = $SPWeb.getfolder($targetdocLibrary.RootFolder.Name) ##Changed code here to get subfolder
            $folder.Files.Add($folder.Url + "/" + $_.Name, $contents, $true)
            #$spFile = $folder.Files.Add($folder.Url + "/" + $_.Name, $contents, $true)
            #$spItem = $spFile.Item
            Write-SPLog $SPWeb $auditLogListName "10" "The converted File ($conFileName) is uploaded to SharePoint document library: $targetdocLibrary" "The converted File ($conFileName) is uploaded to SharePoint document library: $targetdocLibrary!"
            Write-Host -f Green "Uploaded processed drwaing file" $_.FullName " to library !!!"
        }
         # Powershell deletes all files from the Temp Output folder
        Remove-Item $localUnProcessedDrawingFilesFolderPath\* -recurse
        Write-SPLog $SPWeb $auditLogListName "11" "Deleted files from : $localUnProcessedDrawingFilesFolderPath" "All files are deleted files from : $localUnProcessedDrawingFilesFolderPath!"
        Remove-Item $localProcessedDrawingFilesFolderPath\* -recurse
        Write-SPLog $SPWeb $auditLogListName "12" "Deleted files from : $localProcessedDrawingFilesFolderPath" "All files are deleted files from : $localProcessedDrawingFilesFolderPath!"
        Write-Host -f yellow "The folders [" $localUnProcessedDrawingFilesFolderPath "," $localProcessedDrawingFilesFolderPath "] are reset !!!"
    }
    else{
        $count=$docfiles.Count
        $mesg="Either $docLibraryName does not have any new records to process or SharePoint file counts does not match with Downloaded file counts ( Sharepoint File Count:$count, Copied items in [$localUnProcessedDrawingFilesFolderPath] : $sourceCount )!"
        # Write-SPLog $SPWeb $auditLogListName "13" "No records to process" $mesg
        Write-Host -f yellow "No records to process" $mesg
    }
    $SPWeb.Dispose()
   
}
else {    
    Write-Host "Either config list does not exist and configuration data is not configured!"
}

