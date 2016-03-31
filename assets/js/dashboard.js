function processUserDataAJAX() {
	var xmlhttp;
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			responseJson = xmlhttp.responseText;
			var responseArray = JSON.parse(responseJson);
			$("#dummy_id").html(responseJson);
			$("#welcome_username").html(responseArray["username"]);
			
		}
	};
	xmlhttp.open("GET","/api/getUserData",true);
	xmlhttp.send();
}

processUserDataAJAX();
