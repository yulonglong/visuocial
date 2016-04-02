processUserDataAJAX();

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
			processData(xmlhttp.responseText, $('input:radio[name=range]:checked').val());
		}
	};
	xmlhttp.open("GET","/api/getUserData",true);
	xmlhttp.send();
}

$("#radio-range-div input[name=range]").click(function(){
    var m = ($('input:radio[name=range]:checked').val());
    processData(cachedRawData, m);
    $('input[name=mode][value=stacked]').attr('checked', true);
});

var cachedRawData;

function processData(rawData, m) {
	cachedRawData = rawData;
	var responseArray = JSON.parse(rawData);
	$("#welcome_username").html(responseArray["username"]);

	var fbValid = false;
	var twitterValid = false;
	var instaValid = false;
	var parsedData = [];

	if (jQuery.isEmptyObject(responseArray["facebook"])) {
		$("#link_fb").html("<i class=\"fa fa-minus-square\"></i> Not Linked");
	}
	else {
		$("#link_fb").html("<i class=\"fa fa-check-square\"></i> Linked");
		$("#link_fb_button").removeAttr("href");
		$("#link_fb_button").addClass("button-disabled");
		fbValid = true;
	}

	if (jQuery.isEmptyObject(responseArray["twitter"])) {
		$("#link_twitter").html("<i class=\"fa fa-minus-square\"></i> Not Linked");
	}
	else {
		$("#link_twitter").html("<i class=\"fa fa-check-square\"></i> Linked");
		$("#link_twitter_button").removeAttr("href");
		$("#link_twitter_button").addClass("button-disabled");
		twitterValid = true;
	}

	if (jQuery.isEmptyObject(responseArray["instagram"])) {
		$("#link_insta").html("<i class=\"fa fa-minus-square\"></i> Not Linked");
	}
	else {
		$("#link_insta").html("<i class=\"fa fa-check-square\"></i> Linked");
		$("#link_insta_button").removeAttr("href");
		$("#link_insta_button").addClass("button-disabled");
		instaValid = true;
	}

	
	parsedData["date"] = [];
	var mInt = parseInt(m);
	var today = new Date();
	var currDateGlobal = new Date(today.getTime());
	currDateGlobal.setDate(currDateGlobal.getDate()-mInt+1);
	for(var i=0;i<mInt;i++){
		var dd = currDateGlobal.getDate();
		var mm = currDateGlobal.getMonth(); //January is 0!
		var ddmm = dd+'-'+monthNames[mm];

		parsedData["date"][i] = ddmm;
		currDateGlobal.setDate(currDateGlobal.getDate() + 1);
	}
	var earliestDate = new Date(today.getTime());
	earliestDate.setDate(earliestDate.getDate()-mInt);

	if (fbValid) {
		var fbUserLikes = JSON.parse(responseArray["facebook"]["userLikes"]);
		var fbRecentPosts = JSON.parse(responseArray["facebook"]["recentPosts"]);

		$("#fb_likes_tbody").html("");
		for (var i=0;i<fbUserLikes["data"].length;i++) {
			var createdTime = parseDate(fbUserLikes["data"][i]["created_time"]);
			// Check whether the created date is in the selected range, if not dont show
			var createdDate = new Date(parseDate(fbUserLikes["data"][i]["created_time"]));
			if (createdDate < earliestDate) break;

			$("#fb_likes_tbody").append("<tr><td>"+fbUserLikes["data"][i]["name"]+"</td><td>"+createdTime+"</td></tr>");
		}

		$("#fb_posts_tbody").html("");
		for (var i=0;i<fbRecentPosts["data"].length;i++) {
			var createdTime = parseDate(fbRecentPosts["data"][i]["created_time"]);
			// Check whether the created date is in the selected range, if not dont show
			var createdDate = new Date(parseDate(fbRecentPosts["data"][i]["created_time"]));
			if (createdDate < earliestDate) break;

			$("#fb_posts_tbody").append("<tr><td>"+fbRecentPosts["data"][i]["message"]+"</td><td>"+fbRecentPosts["data"][i]["story"]+"</td><td>"+createdTime+"</td></tr>");
		}

		// $("#raw_content").append(JSON.stringify(fbUserLikes)+"<br>");
		// $("#raw_content").append(JSON.stringify(fbRecentPosts)+"<br>");

		// Process Data - Begin

		var fbParsedData =[];
		var currDate = new Date(today.getTime());
		currDate.setDate(currDate.getDate()-mInt+1);

		for(var i=0;i<mInt;i++){
			var dd = currDate.getDate();
			var mm = currDate.getMonth()+1; //January is 0!
			var yy = currDate.getFullYear();
			var ddmm = dd+'/'+mm;
			var fullDate = dd+'/'+mm+'/'+yy;

			fbParsedData[i] = {"date": fullDate, "freq": 0, "x": i, "y": 0}
			currDate.setDate(currDate.getDate() + 1);
		}

		for (var i=0;i<fbRecentPosts["data"].length;i++) {
			var fbCurrDate = new Date(fbRecentPosts["data"][i]["created_time"]);
			var dd = fbCurrDate.getDate();
			var mm = fbCurrDate.getMonth()+1; //January is 0!
			var yy = fbCurrDate.getFullYear();
			var formattedFbCurrDate = dd+'/'+mm+'/'+yy;
			for(var j=0;j<mInt;j++){
				if (fbParsedData[j]["date"] == formattedFbCurrDate) {
					fbParsedData[j]["freq"] += 1;
					fbParsedData[j]["y"] += 1;
				}
			}
		}
		for (var i=0;i<fbUserLikes["data"].length;i++) {
			var fbCurrDate = new Date(fbUserLikes["data"][i]["created_time"]);
			var dd = fbCurrDate.getDate();
			var mm = fbCurrDate.getMonth()+1; //January is 0!
			var yy = fbCurrDate.getFullYear();
			var formattedFbCurrDate = dd+'/'+mm+'/'+yy;
			for(var j=0;j<mInt;j++){
				if (fbParsedData[j]["date"] == formattedFbCurrDate) {
					fbParsedData[j]["freq"] += 1;
					fbParsedData[j]["y"] += 1;
				}
			}
		}

		parsedData["facebook"] = fbParsedData;

		// $("#raw_content").append("FB<br>" + JSON.stringify(fbParsedData)+"<br>");
		// Process Data - End
	}

	if (twitterValid) {
		var twitterRecentWeets = responseArray["twitter"];

		$("#twitter_posts_tbody").html("");
		for (var i=0;i<twitterRecentWeets["recentTweets"].length;i++) {
			var createdTime = parseDate(twitterRecentWeets["recentTweets"][i]["created_at"]);
			// Check whether the created date is in the selected range, if not dont show
			var createdDate = new Date(parseDate(twitterRecentWeets["recentTweets"][i]["created_at"]));
			if (createdDate < earliestDate) break;

			$("#twitter_posts_tbody").append("<tr><td>"+twitterRecentWeets["recentTweets"][i]["text"]+"</td><td>"+createdTime+"</td></tr>");
		}
		// $("#raw_content").append(JSON.stringify(twitterRecentWeets)+"<br>");

		// Process Data - Begin

		var twitterParsedData =[];
		var currDate = new Date(today.getTime());
		currDate.setDate(currDate.getDate()-mInt+1);

		for(var i=0;i<mInt;i++){
			var dd = currDate.getDate();
			var mm = currDate.getMonth()+1; //January is 0!
			var yy = currDate.getFullYear();
			var ddmm = dd+'/'+mm;
			var fullDate = dd+'/'+mm+'/'+yy;

			twitterParsedData[i] = {"date": fullDate, "freq": 0, "x": i, "y": 0}
			currDate.setDate(currDate.getDate() + 1);
		}

		for (var i=0;i<twitterRecentWeets["recentTweets"].length;i++) {
			var twitterCurrDate = new Date(twitterRecentWeets["recentTweets"][i]["created_at"]);
			var dd = twitterCurrDate.getDate();
			var mm = twitterCurrDate.getMonth()+1; //January is 0!
			var yy = twitterCurrDate.getFullYear();
			var formattedTwitterCurrDate = dd+'/'+mm+'/'+yy;
			for(var j=0;j<mInt;j++){
				if (twitterParsedData[j]["date"] == formattedTwitterCurrDate) {
					twitterParsedData[j]["freq"] += 1;
					twitterParsedData[j]["y"] += 1;
				}
			}
		}

		parsedData["twitter"] = twitterParsedData;

		// $("#raw_content").append("Twitter<br>" + JSON.stringify(twitterParsedData)+"<br>");
		// Process Data - End
	}
	
	if (instaValid) {
		var instaRecentPublish = JSON.parse(responseArray["instagram"]["recentPublish"]);
		var instaRecentLiked = JSON.parse(responseArray["instagram"]["recentLiked"]);
		
		$("#instagram_posts_tbody").html("");
		for (var i=0;i<instaRecentPublish["data"].length;i++) {
			var currCaption = instaRecentPublish["data"][i]["caption"];
			if (currCaption == null) currCaption = "N.A.";
			else currCaption = currCaption["text"];
			var createdTime = parseDate(parseInt(instaRecentPublish["data"][i]["created_time"])*1000);

			// Check whether the created date is in the selected range, if not dont show
			var createdDate = new Date(parseDate(parseInt(instaRecentPublish["data"][i]["created_time"])*1000));
			if (createdDate < earliestDate) break;

			$("#instagram_posts_tbody").append("<tr><td>"+currCaption+"</td><td>"+createdTime+"</td></tr>");
		}

		$("#instagram_likes_tbody").html("");
		for (var i=0;i<instaRecentLiked["data"].length;i++) {
			var currCaption = instaRecentLiked["data"][i]["caption"];
			if (currCaption == null) currCaption = "N.A.";
			else currCaption = currCaption["text"];
			var createdTime = parseDate(parseInt(instaRecentLiked["data"][i]["created_time"])*1000);

			// Check whether the created date is in the selected range, if not dont show
			var createdDate = new Date(parseDate(parseInt(instaRecentLiked["data"][i]["created_time"])*1000));
			if (createdDate < earliestDate) break;

			$("#instagram_likes_tbody").append("<tr><td>"+currCaption+"</td><td>"+createdTime+"</td></tr>");
		}
		// $("#raw_content").append(JSON.stringify(instaRecentPublish)+"<br>");
		// $("#raw_content").append(JSON.stringify(instaRecentLiked)+"<br>");


		// Process Data - Begin

		var instaParsedData =[];
		var currDate = new Date(today.getTime());
		currDate.setDate(currDate.getDate()-mInt+1);

		for(var i=0;i<mInt;i++){
			var dd = currDate.getDate();
			var mm = currDate.getMonth()+1; //January is 0!
			var yy = currDate.getFullYear();
			var ddmm = dd+'/'+mm;
			var fullDate = dd+'/'+mm+'/'+yy;

			instaParsedData[i] = {"date": fullDate, "freq": 0, "x": i, "y": 0}
			currDate.setDate(currDate.getDate() + 1);
		}

		for (var i=0;i<instaRecentPublish["data"].length;i++) {
			var instaCurrDate = new Date(parseInt(instaRecentPublish["data"][i]["created_time"])*1000);
			var dd = instaCurrDate.getDate();
			var mm = instaCurrDate.getMonth()+1; //January is 0!
			var yy = instaCurrDate.getFullYear();
			var formattedInstaCurrDate = dd+'/'+mm+'/'+yy;
			for(var j=0;j<mInt;j++){
				if (instaParsedData[j]["date"] == formattedInstaCurrDate) {
					instaParsedData[j]["freq"] += 1;
					instaParsedData[j]["y"] += 1;
				}
			}
		}
		for (var i=0;i<instaRecentLiked["data"].length;i++) {
			var instaCurrDate = new Date(parseInt(instaRecentLiked["data"][i]["created_time"])*1000);
			var dd = instaCurrDate.getDate();
			var mm = instaCurrDate.getMonth()+1; //January is 0!
			var yy = instaCurrDate.getFullYear();
			var formattedInstaCurrDate = dd+'/'+mm+'/'+yy;
			for(var j=0;j<mInt;j++){
				if (instaParsedData[j]["date"] == formattedInstaCurrDate) {
					instaParsedData[j]["freq"] += 1;
					instaParsedData[j]["y"] += 1;
				}
			}
		}

		parsedData["instagram"] = instaParsedData;

		// $("#raw_content").append("Insta<br>" + JSON.stringify(instaParsedData)+"<br>");
		// Process Data - End
	}


	$(".d3canvas").html("");
	stackedToGroupedBars(m, parsedData);
}


function toggleShowFacebookActivities() {
	if ($('#fb_table').css('display') == 'none') $('#fb_toggle_button').html("Hide");
	else  $('#fb_toggle_button').html("Show");

	$("#fb_table").toggle();
}

function toggleShowTwitterActivities() {
	if ($('#twitter_table').css('display') == 'none') $('#twitter_toggle_button').html("Hide");
	else  $('#twitter_toggle_button').html("Show");
	$("#twitter_table").toggle();
}

function toggleShowInstagramActivities() {
	if ($('#instagram_table').css('display') == 'none') $('#instagram_toggle_button').html("Hide");
	else  $('#instagram_toggle_button').html("Show");

	$("#instagram_table").toggle();
}

var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function parseDate(uglyDate) {
	var currentdate = new Date(uglyDate);
	var hours = currentdate.getHours();
	if (hours < 10) hours = '0'+hours;
	var minutes = currentdate.getMinutes();
	if (minutes < 10) minutes = '0'+minutes;

	var datetime = currentdate.getDate() + "-"
                + (monthNames[currentdate.getMonth()])  + "-" 
                + currentdate.getFullYear() + " @ "  
                + hours + ":"  
                + minutes;
    return datetime;
}
