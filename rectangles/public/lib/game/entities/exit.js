ig.module(
	'game.entities.exit'
	)
.requires(
	'impact.entity'
	)
.defines(function() {

	EntityExit = ig.Entity.extend({
		type: ig.Entity.TYPE.B,
    	checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.PASSIVE,

		size:{x:40, y:40},

		init: function(x, y, settings) {
			this.parent(x, y, settings);
		},

		update: function() {
			this.parent();
		},

		check: function(event) {
			console.log('you win');
		}
	});
})