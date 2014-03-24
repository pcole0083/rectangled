ig.module(
	'game.entities.player'
	)
.requires(
	'game.entities.piece'    
	)
.defines(function() {

	EntityPlayer = EntityPiece.extend({
		size: {x: 80, y: 40},
		username: null,
		animSheet: new ig.AnimationSheet('media/sprite.player.png', 80, 40),
		type: ig.Entity.TYPE.A,
    	checkAgainst: ig.Entity.TYPE.BOTH,
		collides: ig.Entity.COLLIDES.ACTIVE,
		blockMovement: 'horizontal',
		blockType: '2-horizontal',

		init: function(x, y, settings) {

			this.parent(x, y, settings);
			this.addAnim('idle', 1, [0] );

			// set username
			var params = JSON.parse(jQuery.cookie('rect-options'));

			this.username = params.username;
		},

		update: function() {
			this.parent();


		},


	});
})