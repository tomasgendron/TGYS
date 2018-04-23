var PSData = window.PSData || {};

PSData.Lib = function () {
	// ================================================
	//  DataAccess library
	// ================================================
	menuhash = {};
	menuHTMLhash = {};
	menuarr = [];

	var setupFooter = function () {
		//$("#contentBox").after("<div id='cbvFooter'><SPAN class=itgfooterCopyright>© CBV Ltd.</SPAN></div>");
	}

	var setupStockSymbol = function () {
		// if($("div.stockcontainer").length == 0)
		// 	$("#DeltaPlaceHolderSearchArea").append("<div class='stockcontainer'><DIV style='POSITION: relative; FLOAT: left; TOP: -7px; PADDING-RIGHT: 10px'><A class=stockttext href='http://web.tmxmoney.com/charting.php?qm_symbol=CONA' target=_blank><IMG src='https://go.conaresources.com/SiteAssets/PSV/images/tsx.png' border=0></A></DIV><A class=stockttext href='http://web.tmxmoney.com/charting.php?qm_symbol=CONA' target=_blank><STRONG>CONA</STRONG></A></div>");
	}

	var setupTopNav = function () {
		var p = getMenuConfig();
		p.done(function (data) {
			//console.log("MENU ITEMS LIB");
			//console.log(data);

			var totalHtml = "";
			$(data.d.results).each(function (i) {
				var secondLevel = "";
				if (this.SecondLevelText != null && this.SecondLevelText != "")
					secondLevel = this.SecondLevelText
				AddtoHash(menuhash, this.Title, secondLevel + "|" + this.SecondLevelUrl + "|" + this.TopLevelUrl)
			});
			$(data.d.results).each(function (i) {
				if (this.HTMLHeading != "" && this.HTMLHeading != null) {
					AddtoHash(menuHTMLhash, this.Title, this.HTMLImageUrl + "|" + this.HTMLHeading + "|" + this.HTMLContent)
				}
			});

			//menuarr will have the correct order of things
			$(menuarr).each(function (ii) {
				//console.log(menuhash[this]);
				var allitems = menuhash[this];
				totalHtml += "<li class='mtop'> <a href='" + allitems[0].split("|")[2] + "'>" + this + "</a>";
				//console.log("Check " + this);
				//console.log(allitems.length);
				if (allitems.length > 1 || allitems[0].split("|")[0] != "") // START check for 1 item
				{
					totalHtml += "<div> <table class='PSoutertable' > <tr> <td class='linkContainer'> <ul>";

					$(allitems).each(function (iii) {
						var menuitem = allitems[iii];
						totalHtml += "<li> <a href='" + menuitem.split("|")[1] + "'>" + menuitem.split("|")[0] + "</a> </li>"
					});

					var itemHTML = "";

					if (menuHTMLhash[this] != undefined) {
						itemHTML = "<div class='menuHtmlImage' style='float:left;display:block'><img style='height:125px' src='" + menuHTMLhash[this][0].split("|")[0] + "' /></div><div class='menuHtmlHeading' style='float:right;display:block'>" + menuHTMLhash[this][0].split("|")[1] + "</div><div class='menuHtmlContent' style='float:right;display:block'>" + menuHTMLhash[this][0].split("|")[2] + "</div>";
						itemHTML = "<div><table class='PSinsidetable'><tr><td><img style='height:125px' src='" + menuHTMLhash[this][0].split("|")[0] + "' /></td><td class='menuHtmlRight'><div class='menuHtmlHeading' style='float:right;display:block'>" + menuHTMLhash[this][0].split("|")[1] + "</div><div class='menuHtmlContent' style='float:right;display:block'>" + menuHTMLhash[this][0].split("|")[2] + "</div></td></tr></table></div>";
					}

					//== undefined
					totalHtml += "</ul> </td> <td valign='top'>" + itemHTML + "</td> </tr></table> </div>";

				} // END check for 1

				totalHtml += "</li>"; // close off main LI of top menu

			});
			if ($("#s4-titlerow").children().length < 2)
				$("#s4-titlerow").append("<nav><ul class='nav'>" + totalHtml + "</ul></nav>");
		});

	}

	function AddtoHash(menuhash, toplevel, secondLevel) {
		var k = toplevel;
		if (menuhash.hasOwnProperty(k)) {
			// already array in this hash, just add value to it
			var arr = menuhash[k];
			arr.push(secondLevel);
			menuhash[k] = arr;
		} else {
			var arr = [];
			arr.push(secondLevel)
			menuhash[k] = arr;
			if (menuarr.indexOf(k) == -1)
				menuarr.push(k);
		}
	}

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

	function getMenuConfig() {
		var requestUri = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getByTitle('MenuConfig')/items?$filter=Lang%20eq%20%27en%27&$orderby=Order0";
		return RunAjax(requestUri);
	}

	return {
		AddtoHash: AddtoHash,
		RunAjax: RunAjax,
		getMenuConfig: getMenuConfig,
		setupTopNav: setupTopNav,
		setupStockSymbol: setupStockSymbol,
		setupFooter: setupFooter,
		menuhash: menuhash
	};

}();