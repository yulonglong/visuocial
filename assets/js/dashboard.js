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
			processData(xmlhttp.responseText, $('#time-range-selector').val());
		}
	};
	xmlhttp.open("GET","/api/getUserData",true);
	xmlhttp.send();
}

$("#time-range-selector").change(function() {
	$('#bar-type-div option[value="stacked"]').prop('selected', true);
	processData(cachedRawData, $('#time-range-selector').val());
});
$("#visualization-type-selector").change(function() {
	$('#bar-type-div option[value="stacked"]').prop('selected', true);
	processData(cachedRawData, $('#time-range-selector').val());
});

var cachedRawData;

function processData(rawData, m) {
	cachedRawData = rawData;
	var responseArray = JSON.parse(rawData);
	$("#welcome_username").html(responseArray["username"]);

	var fbValid = false;
	var twitterValid = false;
	var instaValid = false;
	var n = 0;
	var nIndex=0;
	var parsedData = [];

	if (jQuery.isEmptyObject(responseArray["facebook"])) {
		$("#link_fb").html("<i class=\"fa fa-minus-square\"></i> Not Linked");
		$("#link_fb_button").removeClass("button-disabled");
		$("#link_fb_button").attr("href","/auth/facebook");
	}
	else {
		$("#link_fb").html("<i class=\"fa fa-check-square\"></i> Linked");
		fbValid = true;
		n++;
	}

	if (jQuery.isEmptyObject(responseArray["twitter"])) {
		$("#link_twitter").html("<i class=\"fa fa-minus-square\"></i> Not Linked");
		$("#link_twitter_button").removeClass("button-disabled");
		$("#link_twitter_button").attr("href","/auth/twitter");
	}
	else {
		$("#link_twitter").html("<i class=\"fa fa-check-square\"></i> Linked");
		twitterValid = true;
		n++;
	}

	if (jQuery.isEmptyObject(responseArray["instagram"])) {
		$("#link_insta").html("<i class=\"fa fa-minus-square\"></i> Not Linked");
		$("#link_insta_button").removeClass("button-disabled");
		$("#link_insta_button").attr("href","/auth/instagram");
	}
	else {
		$("#link_insta").html("<i class=\"fa fa-check-square\"></i> Linked");
		instaValid = true;
		n++;
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
	earliestDate.setDate(earliestDate.getDate()-mInt+1);
	earliestDate.setHours(0,0,0,0);

	parsedData["indexMapping"] = [];

	// For word Cloud
	parsedData["words"] = [];

	// For Donut
	parsedData["cumulativeFreq"] = [];

	if (fbValid) {
		var fbUserLikes = JSON.parse(responseArray["facebook"]["userLikes"]);
		var fbRecentPosts = JSON.parse(responseArray["facebook"]["recentPosts"]);

		$("#fb_likes_tbody").html("");
		for (var i=0;i<fbUserLikes["data"].length;i++) {
			var createdTime = parseDate(fbUserLikes["data"][i]["created_time"]);
			// Check whether the created date is in the selected range, if not dont show
			var createdDate = new Date(parseDate(fbUserLikes["data"][i]["created_time"]));
			if (createdDate < earliestDate) break;

			var pageName = fbUserLikes["data"][i]["name"];
			parsedData["words"].push(pageName);

			var pageId = fbUserLikes["data"][i]["id"];

			$("#fb_likes_tbody").append("<tr><td><a class=\"fa fa-facebook\" href=\"http://facebook.com/"+pageId+"\">&nbsp</a>"+pageName+"</td><td>"+createdTime+"</td></tr>");
		}

		$("#fb_posts_tbody").html("");
		for (var i=0;i<fbRecentPosts["data"].length;i++) {
			var createdTime = parseDate(fbRecentPosts["data"][i]["created_time"]);
			// Check whether the created date is in the selected range, if not dont show
			var createdDate = new Date(parseDate(fbRecentPosts["data"][i]["created_time"]));
			if (createdDate < earliestDate) break;

			var currMessage = fbRecentPosts["data"][i]["message"];
			if (currMessage !== undefined)	parsedData["words"].push(currMessage);

			var currStory = fbRecentPosts["data"][i]["story"];
			// Story is not important, message is the content
			// if (currStory !== undefined) parsedData["words"].push(currStory);

			var pageId = fbRecentPosts["data"][i]["id"];

			$("#fb_posts_tbody").append("<tr><td><a class=\"fa fa-facebook\" href=\"http://facebook.com/"+pageId+"\">&nbsp</a>"+currMessage+"</td><td>"+currStory+"</td><td>"+createdTime+"</td></tr>");
		}

		// $("#raw_content").append(JSON.stringify(fbUserLikes)+"<br>");
		// $("#raw_content").append(JSON.stringify(fbRecentPosts)+"<br>");

		// Process Data - Begin

		var cumulativeFreq = 0;
		var fbParsedData =[];
		var currDate = new Date(today.getTime());
		currDate.setDate(currDate.getDate()-mInt+1);

		for(var i=0;i<mInt;i++){
			var dd = currDate.getDate();
			var mm = currDate.getMonth()+1; //January is 0!
			var yy = currDate.getFullYear();
			var ddmm = dd+'/'+mm;
			var fullDate = dd+'/'+mm+'/'+yy;

			fbParsedData[i] = {"date": fullDate, "dateObject": new Date(currDate), "freq": 0, "x": i, "y": 0}
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
					cumulativeFreq += 1
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
					cumulativeFreq += 1
				}
			}
		}

		parsedData[nIndex] = fbParsedData;
		parsedData["cumulativeFreq"][nIndex] = cumulativeFreq;
		parsedData["indexMapping"][nIndex] = "Facebook";
		nIndex++;

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

			var currTweet = twitterRecentWeets["recentTweets"][i]["text"];
			if (currTweet !== undefined) parsedData["words"].push(currTweet);

			var id = twitterRecentWeets["recentTweets"][i]["id_str"];
			var username = twitterRecentWeets["recentTweets"][i]["user"]["screen_name"];

			$("#twitter_posts_tbody").append("<tr><td>"+
				"<a class=\"fa fa-twitter\" href=\"http://twitter.com/"+username+"/status/"+id+"\">&nbsp</a>"
				+currTweet+"</td><td>"+createdTime+"</td></tr>");
		}
		// $("#raw_content").append(JSON.stringify(twitterRecentWeets)+"<br>");

		// Process Data - Begin

		var cumulativeFreq = 0;
		var twitterParsedData =[];
		var currDate = new Date(today.getTime());
		currDate.setDate(currDate.getDate()-mInt+1);

		for(var i=0;i<mInt;i++){
			var dd = currDate.getDate();
			var mm = currDate.getMonth()+1; //January is 0!
			var yy = currDate.getFullYear();
			var ddmm = dd+'/'+mm;
			var fullDate = dd+'/'+mm+'/'+yy;

			twitterParsedData[i] = {"date": fullDate, "dateObject": new Date(currDate), "freq": 0, "x": i, "y": 0}
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
					cumulativeFreq += 1;
				}
			}
		}

		parsedData[nIndex] = twitterParsedData;
		parsedData["cumulativeFreq"][nIndex] = cumulativeFreq;
		parsedData["indexMapping"][nIndex] = "Twitter";
		nIndex++;

		// $("#raw_content").append("Twitter<br>" + JSON.stringify(twitterParsedData)+"<br>");
		// Process Data - End
	}
	
	if (instaValid) {
		var instaRecentPublish = JSON.parse(responseArray["instagram"]["recentPublish"]);
		var instaRecentLiked = JSON.parse(responseArray["instagram"]["recentLiked"]);
		
		$("#instagram_posts_tbody").html("");
		for (var i=0;i<instaRecentPublish["data"].length;i++) {
			var currCaption = instaRecentPublish["data"][i]["caption"];
			if (currCaption == null) {
				currCaption = "N.A.";
			}
			else {
				currCaption = currCaption["text"];
				parsedData["words"].push(currCaption);
			}
			var createdTime = parseDate(parseInt(instaRecentPublish["data"][i]["created_time"])*1000);


			// Check whether the created date is in the selected range, if not dont show
			var createdDate = new Date(parseDate(parseInt(instaRecentPublish["data"][i]["created_time"])*1000));
			if (createdDate < earliestDate) break;

			var link = instaRecentPublish["data"][i]["link"];

			$("#instagram_posts_tbody").append("<tr><td>"+
				"<a class=\"fa fa-instagram\" href=\""+link+"\">&nbsp</a>"
				+currCaption+"</td><td>"+createdTime+"</td></tr>");
		}

		// The instagram liked database doesnt give what we want,
		// unable to see other people's post that user has liked

		// $("#instagram_likes_tbody").html("");
		// for (var i=0;i<instaRecentLiked["data"].length;i++) {
		// 	var currCaption = instaRecentLiked["data"][i]["caption"];
		// 	if (currCaption == null) {
		// 		currCaption = "N.A.";
		// 	}
		// 	else {
		// 		currCaption = currCaption["text"];
		// 		parsedData["words"].push(currCaption);
		// 	}
		// 	var createdTime = parseDate(parseInt(instaRecentLiked["data"][i]["created_time"])*1000);

		// 	// Check whether the created date is in the selected range, if not dont show
		// 	var createdDate = new Date(parseDate(parseInt(instaRecentLiked["data"][i]["created_time"])*1000));
		// 	if (createdDate < earliestDate) break;

		// 	var link = instaRecentLiked["data"][i]["link"];

		// 	$("#instagram_likes_tbody").append("<tr><td>"+
		// 		"<a class=\"fa fa-instagram\" href=\""+link+"\">&nbsp</a>"
		// 		+currCaption+"</td><td>"+createdTime+"</td></tr>");
		// }

		// $("#raw_content").append(JSON.stringify(instaRecentPublish)+"<br>");
		// $("#raw_content").append(JSON.stringify(instaRecentLiked)+"<br>");


		// Process Data - Begin

		var cumulativeFreq = 0;
		var instaParsedData =[];
		var currDate = new Date(today.getTime());
		currDate.setDate(currDate.getDate()-mInt+1);

		for(var i=0;i<mInt;i++){
			var dd = currDate.getDate();
			var mm = currDate.getMonth()+1; //January is 0!
			var yy = currDate.getFullYear();
			var ddmm = dd+'/'+mm;
			var fullDate = dd+'/'+mm+'/'+yy;

			instaParsedData[i] = {"date": fullDate, "dateObject": new Date(currDate), "freq": 0, "x": i, "y": 0}
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
					cumulativeFreq += 1;
				}
			}
		}
		
		// The instagram liked database doesnt give what we want,
		// unable to see other people's post that user has liked

		// for (var i=0;i<instaRecentLiked["data"].length;i++) {
		// 	var instaCurrDate = new Date(parseInt(instaRecentLiked["data"][i]["created_time"])*1000);
		// 	var dd = instaCurrDate.getDate();
		// 	var mm = instaCurrDate.getMonth()+1; //January is 0!
		// 	var yy = instaCurrDate.getFullYear();
		// 	var formattedInstaCurrDate = dd+'/'+mm+'/'+yy;
		// 	for(var j=0;j<mInt;j++){
		// 		if (instaParsedData[j]["date"] == formattedInstaCurrDate) {
		// 			instaParsedData[j]["freq"] += 1;
		// 			instaParsedData[j]["y"] += 1;
		// 			cumulativeFreq += 1;
		// 		}
		// 	}
		// }

		parsedData[nIndex] = instaParsedData;
		parsedData["cumulativeFreq"][nIndex] = cumulativeFreq;
		parsedData["indexMapping"][nIndex] = "Instagram";
		nIndex++;

		// $("#raw_content").append("Insta<br>" + JSON.stringify(instaParsedData)+"<br>");
		// Process Data - End
	}

	$('#process').hide();
	$('#styles').show();

	var visualizationType = $('#visualization-type-selector').val();

	$(".d3canvas").html("");
	$('#bar-type-div').hide();

	if (visualizationType == "stackedBars") {
		stackedToGroupedBars(n, m, parsedData);
		$('#bar-type-div').show();
	}
	else if (visualizationType == "wordCloud")
		wordCloud(parsedData);
	else if (visualizationType == "graph")
		graph(n, m, parsedData);
	else if (visualizationType == "donut")
		donut(n, parsedData);


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
