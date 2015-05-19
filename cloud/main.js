var _ = require('underscore');

Parse.Cloud.job("matches", function(request, status) {
    var prom = Parse.Cloud.httpRequest({
        method: 'GET',
        url: 'https://www.kimonolabs.com/api/eglrarws?apikey=su9xLKb53Fi64dCAeQ7j7WEJ4DF20Fof'
    }).then(function(httpResponse) {
    	var query = new Parse.Query('IDKMessage');
        var getData = JSON.parse(httpResponse.text);
        var lastText = _.last(getData.results.idkpong);
        var cleanedText = lastText.message;
        var color = 'green';

        if (/\(\d-\d\)/.test(lastText.message)) {
        	cleanedText = lastText.message.match(/\(\d-\d\).*/).join('');
    	}

    	if (cleanedText.search('tournament') !== -1) {
    		console.log(cleanedText);
    		console.log(getData.results.titleRow[0].title);
    		cleanedText = cleanedText.replace(/This tournament/ig, getData.results.titleRow[0].title);
    	}

    	if (lastText.icon.alt === 'New') {
			color = 'red';
    	} else if (lastText.icon.alt === 'Play') {
			color = 'yellow';
    	} else if (lastText.icon.alt === 'Star black') {
			color = 'green';
    	} else if (lastText.icon.alt === 'Stop') {
			color = 'purple';
    	}

        query.notEqualTo('lastMessage', cleanedText)
        return query.first().then(function(founded) {

        	if (founded) {
	            if (founded.get('lastMessage') !== cleanedText) {

	                founded.set('lastMessage', cleanedText);

	                Parse.Cloud.httpRequest({
	                    method: 'POST',
	                    url: 'https://api.hipchat.com/v2/room/1459269/notification?auth_token=qYkQRlbdMfxGQIeUmQRa6NmX0TCjParC4xt7X9bj',
	                    body: {
	                        "color": color,
	                        "message": cleanedText,
	                        "notify": true,
	                        "message_format": "text"
	                    }
	                });
	                founded.save();
	            }
	        } else {
	            	console.log('No changes');
	            }
	        });

    }, function(httpResponse) {
        console.error('Request failed with response code ' + httpResponse.status);
        status.error("Uh oh, something went wrong.");
    });
    Parse.Promise.when(prom).then(function() {
        status.success('success');
    });
});