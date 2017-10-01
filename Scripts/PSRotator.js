/*

this code runs against this html from your page

<div id="PSRotator" class='PSRotator'>
<table><tr><td valign='top' id="rotLeft"><div id="rotLeftImage" style='float:left;'> </div></td>
<td valign='top' id="rotCentre">

<div style='float:right;'>
<h2 id='rotLeftTitle'></h2>
<h3 id='rotLeftSubTitle'></h3>
<p id='rotLeftContent'></p>
</div>
  
</td>

<td valign='top' id="rotRight">
<table id="rotRightTable" cellspacing="0" cellpadding="0">

</table>
</td>

</tr></table>
</div>


*/

var PSRotator = window.PSRotator ||
  {};

  PSRotator.Lib = function()
  {
	  _rdata=null;
	  _rotIdx = 1;
	  
	  // this func will stop the timer from fliping news items
	  function SetRotatorMemStop(idx)
	  {
		  clearInterval(myTimerId);
		  SetRotatorMem(idx)
		  
	  }
	  
	  function SetRotatorMem(idx)
	  {
				rdata=_rdata;

				$("#rotLeftImage").html("<img class='rotImage' src='"+ rdata.d.results[idx].LeftImage.Url +"' />" );
				$("#rotLeftContent").html(rdata.d.results[idx].Content + "<br><br><a href='" + rdata.d.results[idx].ReadMoreURL.Url + "'>" + rdata.d.results[idx].ReadMoreURL.Description +"</a>");
				$("#rotLeftTitle").html(rdata.d.results[idx].Title);
				$("#rotLeftSubTitle").html(rdata.d.results[idx].Sub_x0020_Title);
				
				// set right sidebar
				$("#rotRightTable").empty();
;	

				$(rdata.d.results).each(function(i){
					if(i==idx)
						$("#rotRightTable").append("<tr><td><img src='"+  _spPageContextInfo.siteAbsoluteUrl  +"/SiteAssets/images/arrow.gif' /></td><td class='PSRotSelected' >" + this.Title + "<br>" + this.Sub_x0020_Title  +"</td></tr>");
					else
						$("#rotRightTable").append("<tr><td> </td><td class='PSRotNotSelected'><a href='javascript:PSRotator.Lib.SetRotatorMemStop("+ i +")'>" + this.Title + "</a><br>" + this.Sub_x0020_Title  +"</td></tr>");
				});			  
		  
	  }
	  
	   function SetRotator(idx)
	   {
			if(_rdata==null)
			{
				var pload = LoadRotatorData();
				pload.done(function(rdata){
					_rdata = rdata;
					SetRotatorMem(idx);
				});
				
			}	
			else
			{
				SetRotatorMem(idx);
				
			}
  
	   }
	  
		SetRotator(0);
		function LoadRotatorData()
		{
			var p = RunAjax(_spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/GetByTitle('NewsRotator')/items?$orderby=Order0&$top=5");
			p.done(function(rdata){
				console.log(rdata);
				_rdata = rdata;
			});
			return p;
			
		}

		var myTimerId = setInterval(myTimer, 20000);

		function myTimer() {

			SetRotator(_rotIdx);
			_rotIdx+=1;
			if(_rotIdx>=5)
				_rotIdx=0;
			//
		}	

		// ================================================
		//  DataAccess library
		// ================================================
		function RunAjax(restUrl) {
		    var nocache = new Date().getTime();
		    return $.ajax({
		        url: restUrl,
		        dataType: 'json',
		        type: 'GET',
		        headers: {
		            "accept": "application/json;odata=verbose"
		        }
		    })
		}
      	// public interface
  	return {
        SetRotator: SetRotator,
		SetRotatorMemStop: SetRotatorMemStop
  	};
		
}();