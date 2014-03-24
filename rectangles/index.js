Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

var express = require('express')
	, app = express()
	, server = require('http').createServer(app)
	, io = require('socket.io').listen(server)
	, port = 3200
	, ECT = require('ect');

server.listen(port);

// Socket.io stuff
var sockets = {};
var games = {};

io.sockets.on('connection', function(socket){

	socket.on('setUser', function (username, difficulty) {
		sockets[username] = socket;
		// Set username
		var settings = {
			'username': username,
			'opponent': false,
			'difficulty': difficulty,
			'game': false
		};
		socket.set('user', settings);
	});

	socket.on('getOnlinePlayers', function(fn) {
		fn(Object.size(sockets));
	});

	socket.on('getSockets', function(fn) {
		console.log(sockets);
	});

	socket.on('playerTurn', function(gameId, player, fn) {

		if (games[gameId].player.username == player) {
			games[gameId].player.turn = false;
			games[gameId].opponent.turn = true;
		} else if (games[gameId].opponent.username == player) {
			games[gameId].player.turn = true;
			games[gameId].opponent.turn = false;
		}
		games[gameId].turnCount++;

		sockets[games[gameId].player.username].emit('newTurn', games[gameId]);
		sockets[games[gameId].opponent.username].emit('newTurn', games[gameId]);
	});

	socket.on('getWaitingPlayers', function(fn) {
		var opponents = 0;
		for(var s in sockets) {
			var _tmpSocket = sockets[s];
			_tmpSocket.get('user', function(err, user) {
				if (user.opponent === false) {
					opponents++;
				}
			})
			
		}
		fn(opponents);
	});

	socket.on('findMatch', function(gameId, fn) {
		socket.get('user', function(err, user) {
			var difficulty = user.difficulty;
			var username = user.username;
			for(var s in sockets) {
				var opponentSocket = sockets[s];
				if (opponentSocket !== socket && opponentSocket != null) {
					opponentSocket.get('user', function(err, opponentUser) {
						if (!opponentUser.opponent) {
							if (opponentUser.difficulty == difficulty) {
								var opponentUsername = opponentUser.username;
								// Set the socket data for each usernam
								user.game = gameId;
								user.opponent = opponentUser.username;
								opponentUser.game = gameId;
								opponentUser.opponent = user.username;

								socket.set('user', user);
								opponentSocket.set('user', user);

								console.log("Game ID: " + gameId);

								// set the game for later lookup
								games[gameId] = {
									player: {
										username: user.username,
										connected: false,
										turn: false
									},
									opponent: {
										username: opponentUser.username,
										connected: false,
										turn: false
									},
									turnCount: 0
								};

								// Tell the opponent we found someone for them
								opponentSocket.emit('matchFound', username, gameId);

								// Let the user know on their end
								fn(opponentUsername);
							}
						}
					});	
				}
			}
		});
	});

	socket.on('initializeGame', function(gameId, user, fn) {
		// set the user
		sockets[user.username] = socket;

		for (var g in games) {
			if (g == gameId) {
				
				fn(games[g]);

				if (user && games[g].player.username == user.username) {
					games[g].player.connected = true;
				}
				if (user && games[g].opponent.username == user.username) {
					games[g].player.connected = true;
				}
			}
		}
	});

	socket.on('disconnect', function() {
		for(var s in sockets) {
			if (sockets[s] == socket) {
				sockets[s] = null;
			}
		}
	});

});

// Express stuff
var ectRenderer = ECT({ watch: true, root: __dirname + '/views' });
app.engine('.ect', ectRenderer.render);
app.use(express.bodyParser());
app.use('/public', express.static(__dirname + '/public'));
app.use('/lib', express.static(__dirname + '/public/lib'));
app.use('/media', express.static(__dirname + '/public/media'));

// Index page
app.get("/", function(req, res){
	res.render("index.ect", {
		title: 'A 2-player traffic game',
		id: 'index',
		upperHelper : function (string) {
			return string.toUpperCase();
		}
	});
});

// Find game page
app.post("/find", function(req, res){
	// Send a node request to find a game
	res.render("find.ect", {
		title: 'A 2-player traffic game',
		params: req.body,
		upperHelper : function (string) {
			return string.toUpperCase();
		}
	});
});

// Find game page
app.get("/game/:id", function(req, res){
	var gameId = req.params.id;
	
	// Send a node request to find a game
	res.render("game/index.ect", {
		title: 'Playing',
	});
});

// Game page
app.get("/game/:id", function(req, res){
	res.render("game");
});

console.log("Listening on port " + port);
