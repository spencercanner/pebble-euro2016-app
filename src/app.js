/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var matchdays;
var ajax = require('ajax');


var main = new UI.Menu({
    sections: [{
      items: [{
        title: 'View Teams'
      }, {
        title: 'View Fixtures'
      }, {
        title: 'View Standings',
      }]
    }]
});

main.on('select', function(e) {
	var index = e.itemIndex;
	switch(index){
		case (0):
			showTeams();
			break;
		case (1):
			showFixtures();
			break;
		case (2):
			showStandings();
			break;
	}
});

main.show();

function showTeams(){
	ajax({ headers: { 'X-Auth-Token': '8076b8d896bf45c1b1721371cf82b976' }, url: 'http://api.football-data.org/v1/soccerseasons/424/teams', type: 'json' },
		function(data) {
			console.log("hey");
			console.log(data);
			var response = data;
			var teams = response.teams;
			var teamNames = [];
			var teamPlayers = [];
			var teamFixtures = [];
			for (var i = 0; i < teams.length; i++){
				teamNames.push({title: teams[i].name, subtitle: teams[i].code});
				teamPlayers.push(teams[i]._links.players.href);
				teamFixtures.push(teams[i]._links.fixtures.href);
			}
			console.log(teamNames);
			teams = new UI.Menu({
				sections: [{
					items: teamNames
				}]
			});
			teams.show();
// 			teams.on('select', function (e) {
// 				var teamIndex = e.itemIndex;
// 				var teamMenu = new UI.Menu({
// 					sections: [{
// 						items: [{
// 							title: 'View Players'
// 						}, {
// 							title: 'View Fixtures'
// 						}]
// 					}]
// 				});
// 				teamMenu.show();
// 				teamMenu.on('select', function(e) {
// 					var index = e.itemIndex;
// 					switch(index){
// 						case (0):
// 							showPlayers(teamPlayers[teamIndex]);
// 							break;
// 						case (1):
// 							break;
// 					}
// 				});

// 			});
		}, function (error) {
			var card = new UI.Card({
  			body: 'Please try again in a minute'
			});
			card.show();
		});
	
}

// function showPlayers(playersURL){
	
// }

function showFixtures(){
	var teamName = [];
	ajax({ headers: { 'X-Auth-Token': '8076b8d896bf45c1b1721371cf82b976' }, url: 'http://api.football-data.org/v1/soccerseasons/424', type: 'json' },
	 function(data) {
		matchdays = data.numberOfMatchdays.toString();
		}, function (error) {
			var card = new UI.Card({
  			body: 'Please try again in a minute'
			});
			card.show();
		});
		ajax({headers: { 'X-Auth-Token': '8076b8d896bf45c1b1721371cf82b976' }, url: 'http://api.football-data.org/v1/soccerseasons/424/teams', type: 'json' },
			function(data) {
				var response = data;
				var teams = response.teams;
				for (var i = 0; i < teams.length; i++){
// 					teamName.push({long: teams[i].name}, {short: teams[i].code});
					teamName[teams[i].name] = teams[i].code;
				}
		}, function (error) {
			var card = new UI.Card({
  			body: 'Please try again in a minute'
			});
			card.show();
		});
	ajax({headers: { 'X-Auth-Token': '8076b8d896bf45c1b1721371cf82b976' }, url: 'http://api.football-data.org/v1/soccerseasons/424/fixtures', type: 'json' },
		function(data) {
			var response = data;
			var fixtures = response.fixtures;
			var fixtureArray = [];
			var fixtureItems = [];
			for (var i = 0; i < matchdays; i++){
				fixtureArray[i] = [];
				fixtureItems.push({title: "Match Day " + (i + 1)});
			}
			for (i = 0; i < fixtures.length; i++){
				var fixture = fixtures[i];
				if (fixture.status == "FINISHED"){
					var subtitle;
					var title;
					if (fixture.result.penaltyShootout){
						title = teamName[fixture.homeTeamName] + "(" + fixture.result.goalsHomeTeam + ") vs " + teamName[fixture.awayTeamName] + "(" + fixture.result.goalsAwayTeam + ")";
						subtitle = "Pen: " + teamName[fixture.homeTeamName] + "(" + fixture.result.penaltyShootout.goalsHomeTeam + ") - " + teamName[fixture.awayTeamName] + "(" + fixture.result.penaltyShootout.goalsAwayTeam + ")";
					}
					else if (fixture.result.extraTime) {
						title = teamName[fixture.homeTeamName] + "(" + fixture.result.extraTime.goalsHomeTeam + ") vs " + teamName[fixture.awayTeamName] + "(" + fixture.result.extraTime.goalsAwayTeam + ")";
						subtitle = "Extra Time";
					}
					else {
						title = teamName[fixture.homeTeamName] + "(" + fixture.result.goalsHomeTeam + ") vs " + teamName[fixture.awayTeamName] + "(" + fixture.result.goalsAwayTeam + ")";
						subtitle = "Full Time";
					}
							
					fixtureArray[fixture.matchday-1].push({title: title, subtitle: subtitle});
				}
				else if (fixture.status == "TIMED"){
					var d = new Date(fixture.date);
					var days = ["Sun","Mon","Tues","Wed","Thur","Fri","Sat"];
					var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
					var dateStr = days[d.getDay()] + " " + months[d.getMonth()] + " " + d.getDate() + " - " + d.getHours() + ":" + (d.getMinutes()<10?'0':'') + d.getMinutes();
					fixtureArray[fixture.matchday-1].push({title: teamName[fixture.homeTeamName] + " vs " + teamName[fixture.awayTeamName], subtitle: dateStr});
				}
				else if (fixture.status == "IN_PLAY"){
					fixtureArray[fixture.matchday-1].push({title: teamName[fixture.homeTeamName] + "(" + fixture.result.goalsHomeTeam + ") vs " + teamName[fixture.awayTeamName] + "(" + fixture.result.goalsAwayTeam + ")", subtitle: "In Progress"});
				}
			}
			var matchdaysMenu = new UI.Menu({
				sections: [{
					items: fixtureItems
				}]
			});
			matchdaysMenu.show();
			matchdaysMenu.on('select', function(e){
				var matchday = e.itemIndex;
				if (fixtureArray[matchday].length === 0){
					var bodyText;
					switch(matchday){
						case 3:
							bodyText = "Round of 16";
							break;
						case 4:
							bodyText = "Quarter Finals";
							break;
						case 5:
							bodyText = "Semi Finals";
							break;
						case 6:
							bodyText = "Finals";
							break;
						default:
							break;
					}
					var noGames = new UI.Card({
						title: bodyText
					});
					noGames.show();
				}
				else {
					var matchdayMenu = new UI.Menu({
						sections: [{
							items: fixtureArray[matchday]
						}]
					});
					matchdayMenu.show();
				}
				
			});
	
	}, function (error) {
			var card = new UI.Card({
  			body: 'Please try again in a minute'
			});
			card.show();
		});
}

function showStandings(){
	ajax({ headers: { 'X-Auth-Token': '8076b8d896bf45c1b1721371cf82b976' }, url: 'http://api.football-data.org/v1/soccerseasons/424/leagueTable', type: 'json' },
	 function(data) {
		 var response = data;
		 var standings = response.standings;
		 var keys = Object.keys(response.standings);
		 var groups = [];
		 var groupTeams = [];
		 for (var i = 0; i < keys.length; i++){
			 groups.push({title: "Group " + keys[i]});
			 groupTeams[i] = [];
			 var teams = standings[keys[i]];
			 for (var j = 0; j < teams.length; j++){
				 groupTeams[i].push({title: teams[j].rank + ". " + teams[j].team,
														subtitle: "P:" + teams[j].playedGames + ", " + "Pts:" + teams[j].points + ", " + "F:" + teams[j].goals + ", " + "A:" + teams[j].goalsAgainst});
			 }
		 }
		 var groupsMenu = new UI.Menu({
					sections: [{
						items: groups
					}]
			});
		 groupsMenu.show();
		 groupsMenu.on('select', function(e){
			 var index = e.itemIndex;
			 var groupList = new UI.Menu({
					sections: [{
						items: groupTeams[index]
					}]
			});
			 groupList.show();
		 });
		}, function (error) {
			var card = new UI.Card({
  			body: 'Please try again in a minute'
			});
			card.show();
		});
}
