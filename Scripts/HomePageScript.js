<script>


var PS = window.PS ||
  {};

  PS.Lib = function()
  {
	var attemptCount = 0;
    var subhash = {}; // by vendor
	
	var RunAjax = function(restUrl) {
  		//var nocache = new Date().getTime();
  		return $.ajax({
  			url: restUrl,
  			dataType: 'json',
  			type: 'GET',
  			headers: {
  				"accept": "application/json;odata=verbose"
  			}
  		})
  	}
	

	var waitForJQuery = function() {
		attemptCount++;
		if (typeof jQuery != 'undefined') { // JQuery is loaded!
			PS.Lib.initCode();
			return;
		}
		if (attemptCount < 100) {
			setTimeout(waitForJQuery, 100); // Check 10x a second
		}
		return;
	}

	var loadLeftNav = function()
	{
		//$("div#PSLeftNav").html("loaded");
		$("div#PSLeftNav").empty();
		var p = RunAjax(_spPageContextInfo.siteServerRelativeUrl + "/_api/web/lists/getByTitle('HomepageMenu')/items?$filter=Location eq 'Left'");
		p.done(function(data){
		
			console.log(data);
			$.each(data.d.results,function(){
				$("div#PSLeftNav").append("<div style='color:#"+ this.TextColor +";background-color:#"+ this.BgdColor +"'><a href='"+ this.Url +"'>"+ this.Title+"</a></div>")
				
			});
		
		});
		
	}
	var loadRightNav = function()
	{
		//_api/web/lists/getByTitle('UpcomingEvents')/items?$orderby=Event%5Fx0020%5FDate


		//$("div#PSRightNav").empty();
		var p = RunAjax(_spPageContextInfo.siteAbsoluteUrl  + "/_api/web/lists/getByTitle('HomepageMenu')/items?$filter=Location eq 'Right'&$orderby=LinkOrder");
		p.done(function(data){
		
			console.log(data);
			$.each(data.d.results,function(){
				//$("div#PSRightNav").append("<div style='color:#"+ this.TextColor +";background-color:#"+ this.BgdColor +"'><a href='"+ this.Url +"'>"+ this.Title+"</a></div>")
				$("div[linkcat='" + this.LinkCategory + "'").append("<div style='color:#"+ this.TextColor +";background-color:#"+ this.BgdColor +"'><a href='"+ this.Url +"'>"+ this.Title+"</a></div>");
			});
		
		});
		
	}	
	
	var initCode = function()
	{
	
	
	$( document ).ready(function() {
		//$("#pageTitle").before("Our World: The CBV Intranet Portal");
		loadLeftNav();
		loadRightNav();


// check if in edit mode
var inDesignMode = document.forms[MSOWebPartPageFormName].MSOLayout_InDesignMode.value;

if (inDesignMode == "1")
{

$("#s4-ribbonrow").attr("height","35px");
$("#s4-ribboncont").show();
}

		
		if (typeof runWhenJQueryLoaded== 'function') { 
              runWhenJQueryLoaded(); 
        }
	})
	

		
	}
	
    
      	// public interface
  	return {
        subhash: subhash,
		initCode: initCode,
		waitForJQuery: waitForJQuery
  	};

  }();


 PS.Lib.waitForJQuery(); 
  
</script>