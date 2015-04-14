var fs = require('fs');

var csvFile = fs.readFileSync("friend_list.csv", "utf8");
var emailTemp = fs.readFileSync("email_template.html", "utf8");
var ejs = require('ejs');
var latestPosts = [];
var mail = require('./email.js');

// Authenticate via OAuth
var tumblr = require('tumblr.js'); // communicates with tumblr API
var client = tumblr.createClient({
  consumer_key: 'OMtRLqmjndVjzTX8DbOWWonQ8Qs1Ijo066pUYVN3yOEUWRsP6T',
  consumer_secret: 'AlRYoDFqzRJC9YoXPZ48VOBSm2ES5eWLU75pWwpGDaMrV93IsU',
  token: 'v8p5l8DX39St7xkv7x1oZo7VdErVNmcvJItGp95pv2Io6Uv5Oi',
  token_secret: '9HgAIIKrYUMUkTEVFclrn7o3wY8IeQgkBQ97vBxx5cpiJXEbj4'
});


client.posts('yay4yae.tumblr.com', function(err, blog){
  var currentTime = (new Date).getTime();
  var sevenDays = 60 * 60 * 24 * 7;
  blog.posts.forEach(function(post){
  	if (currentTime/1000 - post.timestamp <= sevenDays) latestPosts.push(post);
  });
  
  var friendList = csvParse(csvFile);

  // need to put this inside client.posts or else can't access the values of latestPost (discuss with Scott)
  friendList.forEach(function(row){
  	var firstName = row["firstName"];
	var numMonthsSinceContact = row["numMonthsSinceContact"];
  	var emailAddress = row["emailAddress"];
	var customizedTemplate = ejs.render(emailTemp, { 
		firstName: firstName,
		numMonthsSinceContact: numMonthsSinceContact,
		latestPosts: latestPosts
	});	
	var subject = "Hey " + firstName + ", I started a blog!";
	mail(firstName, emailAddress, "Joanne", "yae.joanne@gmail.com", subject, customizedTemplate)
	console.log(customizedTemplate);
	});
});


function csvParse(csvFile){
	var output = [];
	var lines = csvFile.split("\n");
	var headerRow = lines[0].split(",");

	for (var i = 1; i < lines.length-1; i++){
		var currentLine = lines[i].split(",");
		var obj = {};
		for (var k = 0; k < currentLine.length; k++){
			obj[headerRow[k]] = currentLine[k]; 
		}
		output.push(obj)
	}
	return output;

}
