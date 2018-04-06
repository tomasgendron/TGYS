/*
this code runs against this html from your page

<table id="mainWebPartTable">
	<tr>
		<td>
			<div id="PSRotator" class='PSRotator'>
				<table>
					<tr>
						<td valign='top' id="rotLeft">
							<div id="rotLeftImage" style='float:left;'>
							</div>
						</td>
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
					</tr>
				</table>
			</div>
		</td>
		<td>
		</td>
		<td>
			<div id="PSRightNav">
				<div class='homePageCategory'>CATEGORY 1</div>
				<div linkcat="Category 1"></div>
				<div class='homePageCategory'>CATEGORY 2</div>
				<div linkcat="Category 2"></div>
				<div class='homePageCategory'>CATEGORY 3</div>
				<div linkcat="Category 3"></div>
			</div>
		</td>
	</tr>
</table>

<script>
function runWhenJQueryLoaded()
{
    $.getScript( _spPageContextInfo.siteAbsoluteUrl + "/SiteAssets/PSV/js/PSRotator.js" );
     
}
</script>

*/

var PSRotator = window.PSRotator ||
  {};

  PSRotator.Lib = function()
  {
	  _rdata=null;
	  _rotIdx = 1;
	  _maxItems = 2; // this will control how many items are shown in the rotator. make sure the list has at least this many items!
	  
	  // this func will stop the timer from fliping news items
	  function SetRotatorMemStop(idx)
	  {
		  //clearInterval(myTimerId);
		  //SetRotatorMem(idx)
		  
	  }
	  
	  function SetRotatorMem(idx)
	  {
				rdata=_rdata;

				// we have 2 and only 2 items
				$("a.hpnLink1").attr('href', rdata.d.results[0].MoreLink);
				$("a.hpnLink2").attr('href', rdata.d.results[1].MoreLink);

				$("img.hpnImg1").attr('src', rdata.d.results[0].NewsImage.Url);
				$("img.hpnImg2").attr('src', rdata.d.results[1].NewsImage.Url);

				$("span.hpnTitle1").html(rdata.d.results[0].Title);
				$("span.hpnTitle2").html(rdata.d.results[1].Title);

				$("p.hpnText1").html(rdata.d.results[0].NewsText.replace(/\n/g,"<br>"));
				$("p.hpnText2").html(rdata.d.results[1].NewsText.replace(/\n/g,"<br>"));


// 				$("#rotLeftImage").html("<img class='rotImage' src='"+ rdata.d.results[idx].LeftImage.Url +"' />" );
// 				$("#rotLeftContent").html(rdata.d.results[idx].Content + "<br><br><a href='" + rdata.d.results[idx].ReadMoreURL.Url + "'>" + rdata.d.results[idx].ReadMoreURL.Description +"</a>");
// 				$("#rotLeftTitle").html(rdata.d.results[idx].Title);
// 				$("#rotLeftSubTitle").html(rdata.d.results[idx].Sub_x0020_Title);
				
// 				// set right sidebar
// 				$("#rotRightTable").empty();
// ;	

// 				$(rdata.d.results).each(function(i){
// 					if(i==idx)
// 						$("#rotRightTable").append("<tr><td><img src='"+  _spPageContextInfo.siteAbsoluteUrl  +"/SiteAssets/images/arrow.gif' /></td><td class='PSRotSelected' >" + this.Title + "<br>" + this.Sub_x0020_Title  +"</td></tr>");
// 					else
// 						$("#rotRightTable").append("<tr><td> </td><td class='PSRotNotSelected'><a href='javascript:PSRotator.Lib.SetRotatorMemStop("+ i +")'>" + this.Title + "</a><br>" + this.Sub_x0020_Title  +"</td></tr>");
// 				});			  
		  
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

		// limit is set by the $top only
		function LoadRotatorData()
		{
			var p = RunAjax(_spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/GetByTitle('HomePageNews')/items?$orderby=Order0&$top=" + _maxItems);
			p.done(function(rdata){
				console.log(rdata);
				_rdata = rdata;
			});
			return p;
			
		}

		// var myTimerId = setInterval(myTimer, 60000);

		// function myTimer() {

		// 	SetRotator(_rotIdx);
		// 	_rotIdx+=1;
		// 	if(_rotIdx>= _maxItems)
		// 		_rotIdx=0;
		// 	//
		// }	

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