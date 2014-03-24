/**
 * Game.js
 * Responsible for initializing connection
 *
 * @package Rectangles
 * @class Game
 * @author Thomas Lackemann <tommylackemann@gmail.com>
 * @copyright 2014
 */
;(function() {
	var Game = function() {

		/**
		 * Reference to self
		 */
		var self = this;

		/**
		 * Socket
		 */
		this.socket = null,

		/**
		 * Url
		 */
		this.url = 'http://localhost',

		/**
		 * Port
		 */
		this.port = '3200',

		/**
		 * Username
		 */ 
		this.username = null,

		/**
		 * Players online
		 */
		this.playersOnline = 0,

		/**
		 * Players waiting
		 */
		this.playersWaiting = 0,

		/**
		 * Game ID
		 */
		this.gameId = '',

		/**
		 * Start the game instance
		 * @return Game
		 */
		this.init = function(config) {

			// Wait for the connection to happen, then configure the settings
			jQuery.when(this.connect()).done(function() {
				
				// Set the user
				self.username = config.username;
				self.difficulty = config.difficulty;
				self.socket.emit('setUser', self.username, self.difficulty);

				// Try and find a match
				self.findMatch();

				// Listen for a match found event
				self.socket.on('matchFound', function(username, gameId) {
					console.log('Match found! You will play against: ' + username);
					self.gameId = gameId;

					self.startGame();
				})
			});

			return this;
		},

		/**
		 * Initialize Socket.io connection
		 * @return Game
		 */
		this.connect = function() {
			// Connect to socket.io
			if (this.url && this.port) {
				this.socket = io.connect(this.url + ':' + this.port);
			} else {
				console.error('Url not configured');
			}

			return this;
		}

		this.generateGameId = function(length) {
			if (this.gameId === '') {
				var string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
				for (var i = 0; i < string.length; i++) {
					var random = Math.floor(Math.random() * string.length);
					this.gameId += string.charAt(random);
					if (length - 1 == i) {
						return this.gameId;
					}
				}
			} else {
				return this.gameId;
			}
		},

		this.getOnlinePlayers = function() {
			this.socket.emit('getOnlinePlayers', function(online) {
				self.playersOnline = online;
			});

			return this.playersOnline;
		},

		this.getWaitingPlayers = function() {
			this.socket.emit('getWaitingPlayers', function(online) {
				self.playersWaiting = online;
			});

			return this.playersWaiting;
		}

		this.findMatch = function() {
			var gameId = this.generateGameId(8);
			this.socket.emit('findMatch', gameId, function(opponent) {
				console.log('Match found! You will play against: ' + opponent);
				self.startGame();
			});
		},

		this.refreshPlayersOnline = function(elem) {
			if (elem !== undefined) {
				jQuery(elem).text(this.getOnlinePlayers());
			}
			return this;
		},

		this.refreshPlayersWaiting = function(elem) {
			if (elem !== undefined) {
				jQuery(elem).text(this.getWaitingPlayers());
			}
			return this;
		},

		/**
		 * Starts the game
		 * @return Game
		 */
		this.startGame = function() {
			// Update the URL
			// window.history.replaceState({}, null, '/game/' + this.gameId);

			// Set the cookie 
			jQuery.cookie("rect-gameid", this.gameId, { expires : 1 });
			jQuery.cookie("rect-options", JSON.stringify({
				username: this.username
			}), { expires : 1 });

			window.location = 'game/' + this.gameId;
		}

	};

	if (window.game === undefined) {
		window.game = new Game();
	}

})();