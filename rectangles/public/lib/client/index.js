var socket = io.connect('http://localhost:3200');
var user = JSON.parse(jQuery.cookie('rect-options'));
var gameId = jQuery.cookie('rect-gameid');

socket.emit('initializeGame', gameId, user, function(data) {
	console.log(data);
	if (data.opponent.username == user.username) {
		// put the player in the right spot
		console.log('i am an opponent');
		var player = ig.game.getEntitiesByType( EntityOpponent )[0];
		console.log(player.username);
	} else if (data.user.username == user.username) {
		// put the player in the right spot
		console.log('i am a player');
		var player = ig.game.getEntitiesByType( EntityPlayer )[0];
		console.log(player.username);
	} else {
		// add to spectator list
		console.log('i am a watcher');
	}
});