var isStarted = false;
var observerMessages;
var ignoredUsers = [];

function startListener()
{
	var users = window.prompt("Entrer le nom des utilisateurs à ignorer (séparés par une virgule)","");
	if(users == null){return;}
	if(users == ''){return;}
	
	ignoredUsers = users.split(',');
	console.log(ignoredUsers);
	
	if(!isStarted)
	{
		isStarted = true;
		if(observerMessages == null)
		{
			console.log("Setting up the observer");

			observerMessages = new MutationObserver(MutationsMessages);
			observerMessages.observe(document.getElementById('messages'), {
				childList: true, // report added/removed nodes
				subtree: true,   // observe any descendant elements
			});
		}
	}
}

function MutationsMessages(mutations)
{
	setTimeout(function(){
		mutations.forEach(function(mutation) {
		  if (mutation.type === 'childList') {
			//console.log(mutation.addedNodes);
			if(mutation.addedNodes.length > 0){ProcessMessage(mutation.addedNodes);}

		  }
		});
	});
}

//Main process function
function ProcessMessage(addedNodes)
{
	//Stores the current DOM element
	var elem;

	//Used for the main for loop
	var i = 0;

	//For each message
	for(;i<addedNodes.length;i++)
	{
		//Gets the user who sent the message
		elem = addedNodes[i];
		var u = elem.children[0].innerText.replace(":","").split("à")[0].trim();
		
		//For each ignored user
		for(var j=0;j<ignoredUsers.length;j++)
		{
			//If the current user is in the list
			if(u == ignoredUsers[j])
			{
				//We delete the outer HTML
				console.log('Ignored message from ' + u);
				elem.outerHTML = '';
			}
		}
	}
}

chrome.runtime.sendMessage({
    action: "getSource",
    source: startListener()
});