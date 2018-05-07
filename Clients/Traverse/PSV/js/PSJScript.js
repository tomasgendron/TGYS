// this file mainly handles the MegaMenu

var attemptCount = 0;
var menuhash = {};

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