;(function() {
	window.onload = function() {
		// Start the game with configuration
		// When we're done we're going to either find and match or wait for one
		// After a match has been made, display the game board
		window.game.init({
			username: jQuery('#username').text(),
			difficulty: jQuery('#difficulty').text()
		});

		
	}
})();
