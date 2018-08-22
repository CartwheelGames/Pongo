import * as Phaser from "phaser-ce";

export class Paddle extends Phaser.Sprite
{
	/**
	 * @type {number} speedFactor Determines how fast the paddle will move on player input.
	 */
	private static readonly speedFactor = 0.4;
	private readonly downKey: Phaser.Key;
	private readonly upKey: Phaser.Key;
	private readonly worldHeight: number;
	private readonly startY: number;
	private readonly halfHeight: number;

	/**
	 * This is the player's actor, used for diverting the ball's trajectory.,
	 * @param {Phaser.Game} game A reference to the currently running game.
	 * @param {number} x The paddle's (fixed) x coordinate.
	 * @param {number} y The paddle's constrained y coordinate.
	 * @param {number} width
	 * @param {number} height
	 * @param {string} image The name of the image used by the Sprite during rendering.
	 * @param {Phaser.Key} upKey The keyboard key that causes this paddle to move upwards on the screen.
	 * @param {Phaser.Key} downKey The keyboard key that causes this paddle to move downwards on the screen.
	 */
	constructor(game: Phaser.Game, x: number, y: number, width: number, height: number, image: string, upKey: Phaser.Key, downKey: Phaser.Key)
	{
		super(game, x, y, image);
		this.startY = y;
		this.upKey = upKey;
		this.downKey = downKey;
		this.anchor.setTo(0.5, 0.5);
		this.width = width;
		this.height = height;
		this.halfHeight = height * 0.5;
		this.worldHeight = game.world.height;
		game.physics.arcade.enable(this);
		this.body.kinematic = true;
		this.body.immovable = true;
	}

	/**
	 * Called every frame to capture and apply player input.
	 */
	public update(): void
	{
		const elapsedTime: number = this.game.time.elapsed;
		if (this.upKey.isDown)
		{
			this.y = Math.max(this.halfHeight, this.y - elapsedTime * Paddle.speedFactor);
		}
		else if (this.downKey.isDown)
		{
			this.y = Math.min(this.worldHeight - this.halfHeight, this.y + elapsedTime * Paddle.speedFactor);
		}
	}
}
