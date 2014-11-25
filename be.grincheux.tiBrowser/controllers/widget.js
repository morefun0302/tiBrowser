var args = arguments[0] || {};

var history = [];
var history_position = -1;
var browsing_direction = "";
var loadedTimeout;
if (OS_ANDROID) {
	var menu;
	var backMenu;
	var forwardMenu;
	var refreshMenu;
}

if (typeof args.url != "undefined" && args.url != "") setUrl(args.url);
if (OS_IOS) {
	if (typeof args.color != "undefined" && args.color != "") {
		$.navWin.applyProperties({
			backgroundColor: args.color,
			barColor: args.color
		});
		$.toolbar.tintColor = args.color;
		$.win.barColor = args.color;
	}
	if (typeof args.tintColor != "undefined" && args.tintColor != "") {
		$.navWin.tintColor = args.tintColor;
	}
}

if (OS_IOS) $.navWin.open({modal: true});
if (OS_ANDROID) $.win.open({modal: true});

function setUrl(url) {
	$.webView.url = url;
}
exports.setUrl = setUrl;

function pageLoaded() {
	if (typeof loadedTimeout == "number") clearTimeout(loadedTimeout);
	loadedTimeout = setTimeout(doLoaded, 500); // Set a timeout so redirects are not taken into account.
}
function doLoaded() {
	if (browsing_direction == ""
	&& $.webView.url != history[history_position]
	&& $.webView.evalJS("document.querySelector('body').innerHTML").length) { // Update history only if a link has been clicked, not on back, previous or refresh action.
		history_position++;
		history.length = history_position; // Trim the array because a new link cancels all following history.
		history.push($.webView.url);
	}
	var pageTitle = $.webView.evalJS("document.title");
	if (pageTitle != '') $.win.title = pageTitle; // Set the window title according to the html <title> tag.
	checkPrevPage();
	checkNextPage();
	setRefresh(true);
	browsing_direction = "";
}

function prevPage() {
	browsing_direction = "prev";
	setRefresh(false);
	history_position--;
	if (history_position < 0) history_position = 0;
	checkPrevPage();
	$.webView.url = history[history_position];
}
function nextPage() {
	browsing_direction = "prev";
	setRefresh(false);
	history_position++;
	if (1 + history_position >= history.length) history_position = history.length - 1;
	checkNextPage();
	$.webView.url = history[history_position];
}
function refreshPage() {
	browsing_direction = "refresh";
	setRefresh(false);
	$.webView.reload();
}

function showDialog() {
	$.dialog.show();
}
function actions(e) {
	switch(e.index) {
		case 0:
			openBrowser();
			break;
		case 1:
			copyLink();
			break;
	}
}
function openBrowser() {
	Ti.Platform.openURL($.webView.url);
}
function copyLink() {
	Ti.UI.Clipboard.setText($.webView.url);
}

function checkPrevPage() {
	if (history_position > 0) {
		if (OS_IOS) $.prevPage.enabled = true;
		if (OS_ANDROID) {
			backMenu.enabled = true;
			backMenu.icon = WPATH("images/ic_arrow_back_grey600_36dp.png");
		}
	} else {
		if (OS_IOS) $.prevPage.enabled = false;
		if (OS_ANDROID) {
			backMenu.enabled = false;
			backMenu.icon = WPATH("images/ic_arrow_back_black_36dp.png");
		}
	}
}

function checkNextPage() {
	if (1 + history_position < history.length) {
		if (OS_IOS) $.nextPage.enabled = true;
		if (OS_ANDROID) {
			forwardMenu.enabled = true;
			forwardMenu.icon = WPATH("images/ic_arrow_forward_grey600_36dp.png");
		}
	} else {
		if (OS_IOS) $.nextPage.enabled = false;
		if (OS_ANDROID) {
			forwardMenu.enabled = false;
			forwardMenu.icon = WPATH("images/ic_arrow_forward_black_36dp.png");
		}
	}
}

function setRefresh(enabled) {
	if (OS_IOS) $.refreshPage.enabled = enabled;
	if (OS_ANDROID) {
		refreshMenu.enabled = enabled;
		if (enabled) {
			refreshMenu.icon = WPATH("images/ic_refresh_grey600_36dp.png");
		} else {
			refreshMenu.icon = WPATH("images/ic_refresh_black_36dp.png");
		}
	}
}

function openWin() {
	$.win.activity.invalidateOptionsMenu();
	$.win.activity.onPrepareOptionsMenu = function(e) {
		menu = e.menu;
		backMenu = menu.findItem("1");
		forwardMenu = menu.findItem("2");
		refreshMenu = menu.findItem("3");
	};
}

function closeWin() {
	if (OS_IOS) $.navWin.close();
	if (OS_ANDROID) $.win.close();
}
if (OS_IOS) $.navWin.addEventListener("close", function() { $.destroy();});
if (OS_ANDROID) $.win.addEventListener("close", function() { $.destroy();});