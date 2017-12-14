Add-PSSnapin Microsoft.SharePoint.Powershell -ErrorAction SilentlyContinue

function Cancel-SPWorkflow(){
 PARAM 
 (
 [Parameter(ValueFromPipeline=$true)] [Microsoft.SharePoint.Workflow.SPWorkflow] $SPWorkflow
 )

 BEGIN {
  }

 END {
 }

 PROCESS {
        [Microsoft.SharePoint.Workflow.SPWorkflowManager]::CancelWorkflow($SPworkflow)
    }

}

function Get-SPWorkflow(){
 PARAM 
(
 [Parameter(ValueFromPipeline=$true)] [Microsoft.SharePoint.SPListItem] $SPListItem
 )

 BEGIN {
  }

 END {
 }

 PROCESS {
        $SPListItem.Workflows
    }

}

$(Get-SPWeb https://go.conaresources.com/Sites/dms).Lists["Drawings"].Items|Get-SPWorkflow | where {[String]$_.StatusText -match [String]"Error" -or [String]$_.StatusText -match [String]"In Progress" -or [String]$_.StatusText -match [String]"Starting"} | Cancel-SPWorkflow
