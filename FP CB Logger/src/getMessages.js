/**
 * tableau des mois en abrégé
 */
var aShortMonth = [
	'Jan.',
	'Fév.',
	'Mars',
	'Avril',
	'Mai',
	'Juin',
	'Juil.',
	'Août',
	'Sept.',
	'Oct.',
	'Nov.',
	'Déc.'
];

/**
 * tableau des nom complet des mois
 */
var aFullMonth = [
	'Janvier',
	'Février',
	'Mars',
	'Avril',
	'Mai',
	'Juin',
	'Juillet',
	'Août',
	'Septembre',
	'Octobre',
	'Novembre',
	'Décembre'
];

var aFullMonthEn = [
	'January',
	'Febuary',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

var last_ids = [];

//The url where the logs will be sent
var url = "";

/*Transforme le format de date interne à la CB en un format lisible en JS */
function FixDate(input){
	//SDeletes "Admin" and "Staff" from the string
	input = input.replace('Admin','').replace('Staff','').replace('à','');

	//Used to add the current year to the string
	var y = new Date().getFullYear();

	//Remplacement (mois courts -> mois en anglais)
	for (i = 0; i < aShortMonth.length; i++) {
		input = input.replace(aShortMonth[i], aFullMonthEn[i] + " " + y);
	}
	return input;
}

/*Converts an array of messages to a Json string */
function messagesToJson(messages, users)
{
	var json = '{';
	var i;

	var cb_id;
	var expediteur;
	var destinataire;
	var message;
	var heure;
	var channel;

	if(users.length > 0)
	{
		json += "\"users\":[";

		for(i=0;i<users.length;i++)
		{
			json += '{"name" : "' + users[i].name + '","active" : ' + users[i].active + ',"heure" : ' + encodeURIComponent( users[i].date) + '},';
		}

		json = json.substring(0, json.length - 1);
		json += "],";
	}

	if(messages.length > 0)
	{
		json += "\"messages\":[";

		for(i=0;i<messages.length;i++)
		{
			//Encodingto prevent script/code injection
			cb_id = encodeURIComponent(messages[i]['cb_id']);
			expediteur = encodeURIComponent(messages[i]['expediteur']);
			destinataire = encodeURIComponent(messages[i]['destinataire']);
			message = encodeURIComponent(messages[i]['message']);
			heure = encodeURIComponent(messages[i]['heure']);
			channel = encodeURIComponent(messages[i]['channel']);

			//Creates the json sub-object
			json += "{";
			json += "\"cb_id\":" + cb_id + ",";
			json += "\"expediteur\":\"" + expediteur + "\",";
			json += "\"destinataire\":\"" + destinataire + "\",";
			json += "\"message\":\"" + message + "\",";
			json += "\"heure\":" + heure + ",";
			json += "\"channel\":\"" + channel + "\"";
			json += "},";
		}
		//Deletes the last comma
		json = json.substring(0, json.length - 1);
		json += "]";
	}
	else
	{
		//Deletes the last comma
		json = json.substring(0, json.length - 1);
	}

	json += "}";

	return json;
}

//Sends a POST request, takes an URL and the JSON string for the messages
function post_async(path, messages)
{
	var paramstring = "req=log&json=" + messages;
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {//Call a function when the state changes.
		if(xhr.readyState == 4 && xhr.status == 200) {
			//console.log(xhr.responseText);
		}
	}

	xhr.open("POST", path, true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send(paramstring);
}

var isStarted = false;
var observerMessages;
var observerUsers;

function startListener()
{
	console.log("Starting listener");
	processMessages();
	//TestUserLog();
	if(!isStarted)
	{
		isStarted = true;
		if(observerMessages == null && observerUsers == null)
		{
			console.log("Setting up the observer");

			observerMessages = new MutationObserver(MutationsMessages);
			observerMessages.observe(document.getElementById('messages'), {
				childList: true, // report added/removed nodes
				subtree: true,   // observe any descendant elements
			});

			/*
			observerUsers = new MutationObserver(MutationsUsers);
			observerUsers.observe(document.getElementById('user-list'), {
				childList: true, // report added/removed nodes
				subtree: true,   // observe any descendant elements
			});
			*/
		}
	}
}

function MutationsMessages(mutations)
{
	setTimeout(function(){
		mutations.forEach(function(mutation) {
		  if (mutation.type === 'childList') {
			//console.log(mutation.addedNodes);
			if(mutation.addedNodes.length > 0){LogMessages(mutation.addedNodes);}

		  }
		});
	},1000);
}

function MutationsUsers(mutations)
{
	setTimeout(function(){
		mutations.forEach(function(mutation) {
		  if (mutation.type === 'childList') {
			//console.log(mutation.addedNodes);
			if(mutation.addedNodes.length > 0){LogUsers(mutation.addedNodes);}

		  }
		});
	},1000);
}

var started = false;
var users_last = [];

function TestUserLog()
{
	var users = document.getElementById('user-list').getElementsByClassName('pseudo');
	LogUsers(users);
}

function LogUsers(addedNodes)
{
	console.log(addedNodes);
	console.log("Logging " + addedNodes.length + " users");

	var currentdate = new Date();
	var datetime =    currentdate.getDate() + "/"
					+ (currentdate.getMonth()+1)  + "/"
					+ currentdate.getFullYear() + " @ "
					+ currentdate.getHours() + ":"
					+ currentdate.getMinutes() + ":"
					+ currentdate.getSeconds();

	var count = addedNodes.length;

	var i = 0;

	var users = [];

	for(;i<count;i++)
	{
		var elem = addedNodes[i];
		var user = {};
		var list = elem.parentNode.parentNode.id;
		user.date = currentdate.getTime();
		user.name = elem.innerText;

		//inactive-list
		user.active = (list != 'inactive-list');
		users.push(user);
	}
	var s = messagesToJson([],users);
	console.log(s);
	console.log(JSON.parse(s));
}

function LogMessages(addedNodes)
{
	var currentdate = new Date();
	var datetime =    currentdate.getDate() + "/"
					+ (currentdate.getMonth()+1)  + "/"
					+ currentdate.getFullYear() + " @ "
					+ currentdate.getHours() + ":"
					+ currentdate.getMinutes() + ":"
					+ currentdate.getSeconds();

	var count = addedNodes.length;

	var input = '';
	var s = '';
	var d;

	//Regex used to extract the number from a string : "id=message-97674" returns 97674
	var pattern = "id=\"message-([0-9]*)";
	var reg = new RegExp(pattern);

	//Stores the messages
	var messages = [];

	//Stores the current DOM element
	var elem;

	//Used for the main for loop
	var i = 0;

	if(started)
		i = count-1;
	else
		i = 0;

	//For each message
	for(;i<count;i++)
	{
		//Creates a new message
		var message = [];

		//Looks for the i "<div class="message"></div>" in the HTML source
		elem = addedNodes[i];

		//Fixes the date (present on the 2nd HTML child)
		d = FixDate(elem.getElementsByClassName('date')[0].innerText);
		message['heure'] = Date.parse(d) / 1000; //ms to s

		//Gets the text before "à" in the first HTML child ("Nightmane à JudgeTheDude :")
		message['expediteur'] = elem.children[0].innerText.replace(":","").split("à")[0].trim();
		message['destinataire'] = '';

		//Gets the text after "à" in the first HTML child ("Nightmane à JudgeTheDude :")
		var sender_buf = elem.children[0].innerText.replace(":", "")
		if (sender_buf.split('à').length > 1)
		{
			if (sender_buf.split('à')[1].trim() != "")
			{
				message['destinataire'] = sender_buf.split('à')[1].trim();
			}
		}

		//Gets the message from the 3rd HTML child
		message['message'] = elem.children[2].innerHTML.replace(String.fromCharCode(92),String.fromCharCode(92,92)).replace(/\"/g,"\\\"");

		//Applies the Regex to th outer HTML to extract the chatbox ID
		input = addedNodes[i].outerHTML;
		var corresp = reg.exec(input);
		message['cb_id'] = corresp[1];
		
		message['channel'] = document.getElementById('channels-list').getElementsByClassName('active')[0].innerText;

		//Adds the message to the messages array
		messages.push(message);
	}

	post_async(url, messagesToJson(messages,[]));
	console.log("CB Updated " + addedNodes.length + " Sent");
}

//Main process function
function processMessages(){

	var currentdate = new Date();
	var datetime =    currentdate.getDate() + "/"
					+ (currentdate.getMonth()+1)  + "/"
					+ currentdate.getFullYear() + " @ "
					+ currentdate.getHours() + ":"
					+ currentdate.getMinutes() + ":"
					+ currentdate.getSeconds();


	var document_root = document;
	var count = document_root.getElementsByClassName('message').length;

	var input = '';
	var s = '';
	var d;

	//Regex used to extract the number from a string : "id=message-97674" returns 97674
	var pattern = "id=\"message-([0-9]*)";
	var reg = new RegExp(pattern);

	//Stores the messages
	var messages = [];

	//Stores the current DOM element
	var elem;

	//Used for the main for loop
	var i = 0;

	if(started)
		i = count-1;
	else
		i = 0;

	//For each message
	for(;i<count;i++)
	{
		//Creates a new message
		var message = [];

		//Looks for the i "<div class="message"></div>" in the HTML source
		elem = document_root.getElementsByClassName('message')[i];

		//Fixes the date (present on the 2nd HTML child)
		d = FixDate(elem.getElementsByClassName('date')[0].innerText);
		message['heure'] = Date.parse(d) / 1000; //ms to s

		//Gets the text before "à" in the first HTML child ("Nightmane à JudgeTheDude :")
		message['expediteur'] = elem.children[0].innerText.replace(":","").split("à")[0].trim();
		message['destinataire'] = '';

		//Gets the text after "à" in the first HTML child ("Nightmane à JudgeTheDude :")
		var sender_buf = elem.children[0].innerText.replace(":", "")
		if (sender_buf.split('à').length > 1)
		{
			if (sender_buf.split('à')[1].trim() != "")
			{
				message['destinataire'] = sender_buf.split('à')[1].trim();
			}
		}

		//Gets the message from the 3rd HTML child
		message['message'] = elem.children[2].innerHTML.replace(String.fromCharCode(92),String.fromCharCode(92,92)).replace(/\"/g,"\\\"");

		//Applies the Regex to th outer HTML to extract the chatbox ID
		input = document_root.getElementsByClassName('message')[i].outerHTML;
		var corresp = reg.exec(input);
		message['cb_id'] = corresp[1];
		
		message['channel'] = document_root.getElementById('channels-list').getElementsByClassName('active')[0].innerText;

		//Adds the message to the messages array
		messages.push(message);
	}
	var users = [];
	
	var output = messagesToJson(messages,users);
	post_async(url, messagesToJson(messages,users));
	//console.log(output);
	console.log("Request sent");
	//console.log(messagesToJson(messages, users));
}

chrome.runtime.sendMessage({
    action: "getSource",
    source: startListener()
});
