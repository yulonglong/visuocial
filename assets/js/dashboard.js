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
			processData(xmlhttp.responseText);
		}
	};
	xmlhttp.open("GET","/api/getUserData",true);
	xmlhttp.send();
}


function processData(rawData) {
	var responseArray = JSON.parse(rawData);
	$("#welcome_username").html(responseArray["username"]);

	var fbValid = false;
	var twitterValid = false;
	var instaValid = false;

	if (jQuery.isEmptyObject(responseArray["facebook"])) {
		$("#link_fb").html("<i class=\"fa fa-minus-square\"></i> Not Linked");
	}
	else {
		$("#link_fb").html("<i class=\"fa fa-check-square\"></i> Linked");
		fbValid = true;
	}

	if (jQuery.isEmptyObject(responseArray["twitter"])) {
		$("#link_twitter").html("<i class=\"fa fa-minus-square\"></i> Not Linked");
	}
	else {
		$("#link_twitter").html("<i class=\"fa fa-check-square\"></i> Linked");
		twitterValid = true;
	}

	if (jQuery.isEmptyObject(responseArray["instagram"])) {
		$("#link_insta").html("<i class=\"fa fa-minus-square\"></i> Not Linked");
	}
	else {
		$("#link_insta").html("<i class=\"fa fa-check-square\"></i> Linked");
		instaValid = true;
	}


	if (fbValid) {
		var fbUserLikes = JSON.parse(responseArray["facebook"]["userLikes"]);
		var fbRecentPosts = JSON.parse(responseArray["facebook"]["recentPosts"]);

		$("#fb_content").html("");

		for (var i=0;i<fbUserLikes["data"].length;i++) {
			$("#fb_content").append("<li>"+fbUserLikes["data"][i]["name"]+"<br>"+fbUserLikes["data"][i]["created_time"]+"</li>");
		}
		for (var i=0;i<fbRecentPosts["data"].length;i++) {
			$("#fb_content").append("<li>"+fbRecentPosts["data"][i]["message"]+"<br>"+fbRecentPosts["data"][i]["story"]+"<br>"+fbRecentPosts["data"][i]["created_time"]+"</li>");
		}
		// $("#raw_content").append(JSON.stringify(fbUserLikes)+"<br>");
		// $("#raw_content").append(JSON.stringify(fbRecentPosts)+"<br>");
	}

	if (twitterValid) {
		var twitterRecentWeets = responseArray["twitter"];
		$("#twitter_content").html("");

		for (var i=0;i<twitterRecentWeets["recentTweets"].length;i++) {
			$("#twitter_content").append("<li>"+twitterRecentWeets["recentTweets"][i]["text"]+"<br>"+twitterRecentWeets["recentTweets"][i]["created_at"]+"</li>");
		}
		// $("#raw_content").append(JSON.stringify(twitterRecentWeets)+"<br>");
	}
	
	if (instaValid) {
		var instaRecentPublish = JSON.parse(responseArray["instagram"]["recentPublish"]);
		var instaRecentLiked = JSON.parse(responseArray["instagram"]["recentLiked"]);
		
		$("#instagram_content").html("");

		for (var i=0;i<instaRecentPublish["data"].length;i++) {
			$("#instagram_content").append("<li>"+instaRecentPublish["data"][i]["link"]+"<br>"+instaRecentPublish["data"][i]["created_time"]+"</li>");
		}
		for (var i=0;i<instaRecentLiked["data"].length;i++) {
			$("#instagram_content").append("<li>"+instaRecentLiked["data"][i]["link"]+"<br>"+instaRecentLiked["data"][i]["created_time"]+"</li>");
		}
		// $("#raw_content").append(JSON.stringify(instaRecentPublish)+"<br>");
		// $("#raw_content").append(JSON.stringify(instaRecentLiked)+"<br>");
	}

}


stackedToGroupedBars();
processUserDataAJAX();
