// this file mainly handles the MegaMenu

var attemptCount = 0;
var menuhash = {};

// function loadjscssfile(filename, filetype) {
// 	if (filetype == "js") { //if filename is a external JavaScript file
// 		var fileref = document.createElement('script')
// 		fileref.setAttribute("type", "text/javascript")
// 		fileref.setAttribute("src", filename)
// 	} else if (filetype == "css") { //if filename is an external CSS file
// 		var fileref = document.createElement("link")
// 		fileref.setAttribute("rel", "stylesheet")
// 		fileref.setAttribute("type", "text/css")
// 		fileref.setAttribute("href", filename)
// 	}
// 	if (typeof fileref != "undefined")
// 		document.getElementsByTagName("head")[0].appendChild(fileref)
// }

function waitForJQuery() {
	attemptCount++;
	if (typeof jQuery != 'undefined') { // JQuery is loaded!
		initCode();
		return;
	}
	if (attemptCount < 100) {
		setTimeout(waitForJQuery, 100); // Check 10x a second
	}
	return;
}

waitForJQuery();

function initCode() {
	$(document).ready(function () {
		$(".ms-core-listMenu-item:contains('Recent')").parent().hide();
		PSData.Lib.setupTopNav();
		PSData.Lib.setupStockSymbol();
		PSData.Lib.setupFooter();
	});
}	