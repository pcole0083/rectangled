ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	'game.levels.levela',
	'game.entities.piece',
	'game.entities.player',
	'game.entities.opponent',
	'game.entities.exit'
)
.defines(function(){

MyGame = ig.Game.extend({
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	socket: null,
	timer: new ig.Timer( 5 ),
	gameId: null,
	activeUsername: null,

	init: function() {
		var self = this;
		// Get the game and players
		// Initialize level (random)
		var LoadLevel = LevelLevela;
		this.loadLevel(LoadLevel);

		this.socket = io.connect('http://localhost:3200');

		// Spawn the pieces
		ig.game.spawnEntity( EntityPlayer, 40, 80 );
		ig.game.spawnEntity( EntityOpponent, 280, 80 );
		ig.game.spawnEntity( EntityPiece, 120, 40, { blockType: "3-vertical" } );
		ig.game.spawnEntity( EntityPiece, 160, 120, { blockType: "3-vertical" } );
		ig.game.spawnEntity( EntityPiece, 240, 180, { blockType: "2-horizontal" } );

		// Bind keys
		ig.input.bind(ig.KEY.MOUSE1, 'click');
		ig.input.bind(ig.KEY.UP_ARROW, 'up');
        ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
        ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
        ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
        ig.input.bind(ig.KEY.W, 'up');
        ig.input.bind(ig.KEY.S, 'down');
        ig.input.bind(ig.KEY.A, 'left');
        ig.input.bind(ig.KEY.D, 'right');

		var user = JSON.parse(jQuery.cookie('rect-options'));
		this.gameId = jQuery.cookie('rect-gameid');

		var player = ig.game.getEntitiesByType( EntityPlayer )[0];
		var opponent = ig.game.getEntitiesByType( EntityOpponent )[0];

		this.socket.emit('initializeGame', this.gameId, user, function(data) {
			//console.log(data);

			if (data.opponent.username == user.username) {
				opponent.username = data.opponent.username;
				player.username = data.player.username;
				// put the player in the right spot
				console.log('i am an opponent');
				opponent.setTurn(true, opponent.username);
				//console.log(player.username + ' (me) vs. ' + opponent.username);

			} else if (data.player.username == user.username) {
				self.activeUsername = user.username;
				player.username = data.player.username
				opponent.username = data.opponent.username;
				var pieces = ig.game.getEntitiesByType( EntityPiece );
				// put the player in the right spot
				console.log('i am a player');
				for(var i = 0; i < pieces.length; i++) {
					// console.log(pieces[i]);
					pieces[i].setTurn(true, player.username);
				}
				
				//console.log(player.username + ' (me) vs. ' + opponent.username);


			} else {
				// add to spectator list
				//console.log('i am a watcher');
			}
		});

		this.socket.on('newTurn', function(game) {
			console.log("Player: " + player.username);
			console.log("Opponent: " + opponent.username);
			console.log(game);
			if (game.player.turn) {
				self.activeUsername = user.username;
				console.log('player turn');
				player.setTurn(true, player.username);
				opponent.setTurn(false, opponent.username);
				// set all pieces
				var pieces = ig.game.getEntitiesByType( EntityPiece );
				for(var i = 0; i < pieces.length; i++) {
					pieces[i].setTurn(true, player.username);
				}
			} else if (game.opponent.turn) {
				self.activeUsername = opponent.username;
				console.log('opponent turn');
				player.setTurn(false, player.username);
				opponent.setTurn(true, opponent.username);
				// set all pieces
				var pieces = ig.game.getEntitiesByType( EntityPiece );
				for(var i = 0; i < pieces.length; i++) {
					pieces[i].setTurn(true, opponent.username);
				}
			}
		});

	},
	
	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		
		
		// Add your own, additional update code here
		var player = this.getEntitiesByType(EntityPlayer)[0];
		if (player.turn) {
			if (this.timer.delta() >= 0) {
				console.log('my turn ' + player.username);
				this.timer.reset();
			}
		}

		var opponent = this.getEntitiesByType(EntityOpponent)[0];
		if (opponent.turn) {
			if (this.timer.delta() >= 0) {
				console.log('waiting on player ' + player.username);
				this.timer.reset();
			}
		}
	},
	
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
		
		// Add your own drawing code here
		var x = ig.system.width/2,
			y = ig.system.height/2;
		
		var player = this.getEntitiesByType(EntityPlayer)[0];

		var opponent = this.getEntitiesByType(EntityOpponent)[0];
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 400, 400, 1 );

});
