processUserDataAJAX();

// ================ AJAX FUNCTIONS BEGIN ================

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
			$('#loading-text').html("Processing data...");
			processRawData(xmlhttp.responseText);
			processData(cachedDefaultData);
			showVisualization(cachedParsedData, cachedNumAccount);
			// Scroll down to dashboard
		    $('html, body').animate({ scrollTop: 500 }, 300);
		}
	};
	xmlhttp.open("GET","/api/getUserData",true);
	xmlhttp.send();
}

function getTopicAJAX(text) {
	$('option[value="topics"]').prop('disabled', true);
	$('option[value="keywords"]').prop('disabled', true);

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
			var responseArray = JSON.parse(xmlhttp.responseText);
			cachedOverallKeyword = responseArray["keyword"];
			cachedOverallTopic = responseArray["topic"];

			$('option[value="topics"]').prop('disabled', false);
			$('option[value="keywords"]').prop('disabled', false);
		}
	};
	xmlhttp.open("POST","/api/getTopic",true);
	xmlhttp.setRequestHeader("Content-type", "application/json");
	var textObject = { "text": text };
	xmlhttp.send(JSON.stringify(textObject));
}

function getSentimentAJAX(id, text) {
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
			var responseArray = JSON.parse(xmlhttp.responseText);
			var sentiment = responseArray["type"];

			var posKeywords = [];
			var negKeywords = [];

			for(var i=0;i<responseArray["keywords"].length;i++) {
				if (responseArray["keywords"][i]["score"] > 0) {
					posKeywords.push(responseArray["keywords"][i]["word"]);
				}
				else {
					negKeywords.push(responseArray["keywords"][i]["word"]);
				}
			}

			var tooltipString = "";
			if (posKeywords.length > 0) {
				tooltipString = tooltipString + "Positive Keywords:\n" + posKeywords.join(", ") + "\n";
			}
			if (negKeywords.length > 0) {
				if (tooltipString.length > 0) tooltipString = tooltipString + "\n";
				tooltipString = tooltipString + "Negative Keywords:\n" + negKeywords.join(", ") + "\n";
			}
			if (tooltipString.length == 0) tooltipString = "N.A.";

			if (sentiment == "positive") {
				$('#'+id).html("<a class=\"fa fa-plus sentiment\" style='color:green;' data-toggle='tooltip' data-placement='auto left' "+
					"title=\""+tooltipString+"\""+
					"></a>")
			}
			else if (sentiment == "negative") {
				$('#'+id).html("<a class=\"fa fa-minus sentiment\" style='color:red;' data-toggle='tooltip' data-placement='auto left' "+
					"title=\""+tooltipString+"\""+
					"></a>")
			}
			else {
				$('#'+id).html("<a class=\"fa fa-circle-o sentiment\" style='color: #8c8c8c;' data-toggle='tooltip' data-placement='auto left' "+
					"title=\""+tooltipString+"\""+
					"></a>")
			}

    		$('[data-toggle=tooltip]').tooltip();

		}
	};
	xmlhttp.open("GET","/api/getSentiment?text=\""+text+"\"",true);
	xmlhttp.send();
}

// ================ AJAX FUNCTIONS END ================


// ================ SELECTOR ON CHANGE BEGIN ================
$("#time-range-selector").change(function() {
	$('#bar-type-div option[value="stacked"]').prop('selected', true);
	$('#wordcloud-type-div option[value="default"]').prop('selected', true);
	processData(cachedDefaultData);
	showVisualization(cachedParsedData, cachedNumAccount);
});
$("#visualization-type-selector").change(function() {
	$('#bar-type-div option[value="stacked"]').prop('selected', true);
	$('#wordcloud-type-div option[value="default"]').prop('selected', true);
	showVisualization(cachedParsedData, cachedNumAccount);
});
$("#wordcloud-type-selector").change(function() {
	showVisualization(cachedParsedData, cachedNumAccount);
});

// ================ SELECTOR ON CHANGE END ================


// ================ GLOBAL VAR BEGIN ================
var cachedRawData;

var cachedDefaultData;
var cachedParsedData;
var cachedTimeRange;
var cachedNumAccount;

var cachedOverallKeyword;
var cachedOverallTopic;

var fbValid = false;
var twitterValid = false;
var instaValid = false;

// ================ GLOBAL VAR END ==================


function processRawData(rawData) {
	cachedRawData = rawData;
	var responseArray = JSON.parse(rawData);
	$("#welcome_username").html(responseArray["username"]);

	var n = 0;

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

	cachedNumAccount = n;
	cachedDefaultData = responseArray;
}

function processData(data) {
	var parsedData = [];
	parsedData["date"] = [];
	var mInt = parseInt($('#time-range-selector').val());
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
		var fbUserLikes = JSON.parse(data["facebook"]["userLikes"]);
		var fbRecentPosts = JSON.parse(data["facebook"]["recentPosts"]);

		$("#fb_posts_tbody").html("");
		for (var i=0;i<fbRecentPosts["data"].length;i++) {
			var createdTime = parseDate(fbRecentPosts["data"][i]["created_time"]);
			// Check whether the created date is in the selected range, if not dont show
			var createdDate = new Date(parseDate(fbRecentPosts["data"][i]["created_time"]));
			if (createdDate < earliestDate) break;

			var currMessage = fbRecentPosts["data"][i]["message"];
			var sentiment = "neutral";
			if (currMessage !== undefined)	{
				parsedData["words"].push(currMessage);
				getSentimentAJAX("fb_sentiment_"+i.toString(),currMessage);
			}
			else currMessage = "-";

			var currStory = fbRecentPosts["data"][i]["story"];
			if (currStory !== undefined) {
				currMessage = currMessage + "<br>" + "<i>"+currStory+"</i>";
			}
			// Story is not important, message is the content
			// if (currStory !== undefined) parsedData["words"].push(currStory);

			var pageId = fbRecentPosts["data"][i]["id"];

			$("#fb_posts_tbody").append("<tr><td id='fb_sentiment_"+i+"'></td>"+
				"<td>"+
				"<a class=\"fa fa-facebook\" target=\"_blank\" href=\"http://facebook.com/"+pageId+"\">&nbsp</a>"
				+currMessage+"</td><td>"+createdTime+"</td></tr>");
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

		parsedData.push(fbParsedData);
		parsedData["cumulativeFreq"].push(cumulativeFreq);
		parsedData["indexMapping"].push("Facebook");

		// $("#raw_content").append("FB<br>" + JSON.stringify(fbParsedData)+"<br>");
		// Process Data - End
	}

	if (twitterValid) {
		var twitterRecentWeets = data["twitter"];

		$("#twitter_posts_tbody").html("");
		for (var i=0;i<twitterRecentWeets["recentTweets"].length;i++) {
			var createdTime = parseDate(twitterRecentWeets["recentTweets"][i]["created_at"]);
			// Check whether the created date is in the selected range, if not dont show
			var createdDate = new Date(parseDate(twitterRecentWeets["recentTweets"][i]["created_at"]));
			if (createdDate < earliestDate) break;

			var currTweet = twitterRecentWeets["recentTweets"][i]["text"];
			if (currTweet !== undefined) {
				parsedData["words"].push(currTweet);
				getSentimentAJAX("twitter_sentiment_"+i.toString(),currTweet);
			}

			var id = twitterRecentWeets["recentTweets"][i]["id_str"];
			var username = twitterRecentWeets["recentTweets"][i]["user"]["screen_name"];

			$("#twitter_posts_tbody").append("<tr><td id='twitter_sentiment_"+i+"'></td>"+
				"<td>"+
				"<a class=\"fa fa-twitter\" target=\"_blank\" href=\"http://twitter.com/"+username+"/status/"+id+"\">&nbsp</a>"
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

		parsedData.push(twitterParsedData);
		parsedData["cumulativeFreq"].push(cumulativeFreq);
		parsedData["indexMapping"].push("Twitter");

		// $("#raw_content").append("Twitter<br>" + JSON.stringify(twitterParsedData)+"<br>");
		// Process Data - End
	}
	
	if (instaValid) {
		var instaRecentPublish = JSON.parse(data["instagram"]["recentPublish"]);
		var instaRecentLiked = JSON.parse(data["instagram"]["recentLiked"]);
		
		$("#instagram_posts_tbody").html("");
		for (var i=0;i<instaRecentPublish["data"].length;i++) {
			var currCaption = instaRecentPublish["data"][i]["caption"];
			if (currCaption == null) {
				currCaption = "-";
			}
			else {
				currCaption = currCaption["text"];
				parsedData["words"].push(currCaption);
				getSentimentAJAX("insta_sentiment_"+i.toString(),currCaption);
			}
			var createdTime = parseDate(parseInt(instaRecentPublish["data"][i]["created_time"])*1000);


			// Check whether the created date is in the selected range, if not dont show
			var createdDate = new Date(parseDate(parseInt(instaRecentPublish["data"][i]["created_time"])*1000));
			if (createdDate < earliestDate) break;

			var link = instaRecentPublish["data"][i]["link"];

			$("#instagram_posts_tbody").append("<tr><td id='insta_sentiment_"+i+"'></td>"+
				"<td>"+
				"<a class=\"fa fa-instagram\" target=\"_blank\" href=\""+link+"\">&nbsp</a>"
				+currCaption+"</td><td>"+createdTime+"</td></tr>");
		}

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

		parsedData.push(instaParsedData);
		parsedData["cumulativeFreq"].push(cumulativeFreq);
		parsedData["indexMapping"].push("Instagram");

		// $("#raw_content").append("Insta<br>" + JSON.stringify(instaParsedData)+"<br>");
		// Process Data - End
	}

	$('#process').hide();
	$('#process').empty();
	$('#process').detach();

	$('#overview').show();
	$('#mood-analysis').show();

	cachedParsedData = parsedData;

	var longWord = parsedData["words"].join(". ");
	getTopicAJAX(longWord);
}

function showVisualization(data, n, m) {
	var visualizationType = $('#visualization-type-selector').val();
	var m = $('#time-range-selector').val();

	$(".d3canvas").html("");
	$('#bar-type-div').hide();
	$('#wordcloud-type-div').hide();

	if (visualizationType == "stackedBars") {
		stackedToGroupedBars(n, m, data);
		$('#bar-type-div').show();
	}
	else if (visualizationType == "wordCloud") {
		var wordCloudType = $('#wordcloud-type-selector').val();
		if (wordCloudType == "default") {
			wordCloud(data);
		}
		else if (wordCloudType == "keywords") {
			wordCloudTopic(cachedOverallKeyword);
		}
		else if (wordCloudType == "topics") {
			wordCloudTopic(cachedOverallTopic);
		}
		$('#wordcloud-type-div').show();
	}
	else if (visualizationType == "graph")
		graph(n, m, data);
	else if (visualizationType == "donut")
		donut(n, data);

	// to highlight the top nav bar
	navBarHighlighter();
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
