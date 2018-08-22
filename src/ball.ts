import * as Phaser from "phaser-ce";

/**
 * The ball is the focal point of the game. If it hits the world bounds, it either bounces or a point is scored.
 * If it hits a paddle, it changes its velocity relative to the hit paddle.
 */
export class Ball extends Phaser.Sprite
{
	private static readonly beginDelay = 1;
	private static readonly resetDelay = 1.5;
	private static readonly speed = 400;
	private readonly worldWidth: number;
	private readonly worldHeight: number;
	private readonly initialX: number;
	private readonly initialY: number;
	private hitRightBoundsLast: boolean = false;
	public onHitHorizontalBounds: Phaser.Signal = new Phaser.Signal();

	/**
	 * @param {Phaser.Game} game A reference to the currently running game.
	 * @param {number} x The starting x coordinate of the ball.
	 * @param {number} y The starting y coordinate of the ball.
	 * @param {number} diameter Determines the ball's dimensions.
	 * @param {string} image The name of the image used by the Sprite during rendering.
	 */
	constructor(game: Phaser.Game, x: number, y: number, diameter: number, image: string)
	{
		super(game, x, y, image);
		this.initialX = x;
		this.initialY = y;
		this.width = this.height = diameter;
		this.worldWidth = this.game.world.width;
		this.worldHeight = this.game.world.height;
		this.game.physics.arcade.enable(this);
		this.body.isCircle = true;
		this.body.collideWorldBounds = true;
		this.body.allowGravity = true;
		this.body.stopVelocityOnCollide = false;
		this.body.bounce.y = 1;
		this.body.onCollide = new Phaser.Signal();
		this.body.onCollide.add(this.hitSprite, this);
		this.body.onWorldBounds = new Phaser.Signal();
		this.body.onWorldBounds.add(this.hitBounds, this);
		this.anchor.setTo(0.5, 0.5);
		this.beginMovementWithDelay();
	}

	/**
	 * Phaser executes this once per frame. Only used to determine if a wall bounce has occurred.
	 */
	public update()
	{
		if (this.y < 0 || this.y > this.worldHeight)
		{
			this.wallBounce();
		}
	}

	/**
	 * Change flip the vertical velocity value when the top or bottom world boundary hs been hit.
	 */
	private wallBounce(): void
	{
		const currentDirection: Phaser.Point = this.body.velocity.normalize();
		this.body.velocity.setTo(currentDirection.x, -currentDirection.y);
	}

	/**
	 * Tees up the ball's initial movement, after a delay;
	 */
	private beginMovementWithDelay()
	{
		this.game.time.events.add(Phaser.Timer.SECOND * Ball.beginDelay, this.beginMovement, this);
	}

	/**
	 * Forces the ball in one direction, from it's idle position at the center.
	 * It will always push itself horizontally towards the edge that was just scored on.
	 * This should theoretically give the player who lost the last point the first hit on the next ball.
	 */
	private beginMovement()
	{
		const speed: number = this.hitRightBoundsLast ? Ball.speed : -Ball.speed;
		this.body.velocity.setTo(speed, 0);
	}

	/**
	 * Handles collisions with this ball and other sprite-based objects.
	 * @param {Phaser.Sprite} thisSprite This object, in the collision.
	 * @param {Phaser.Sprite} otherSprite The other collided object. Should be a paddle.
	 */
	private hitSprite(thisSprite: Phaser.Sprite, otherSprite: Phaser.Sprite)
	{
		const newXSpeed: number = this.x < this.worldWidth * 0.5 ? Ball.speed : -Ball.speed;
		// Get the paddle's position...
		let newPosition: Phaser.Point = new Phaser.Point(otherSprite.x, otherSprite.y);
		// ..and get the direction from its center to the ball's center...
		newPosition.subtract(thisSprite.position.x, thisSprite.y);
		newPosition.normalize();
		// ...the new Y speed is based on this direction and the constant Ball.speed variable.
		const newYSpeed : number = -newPosition.y *  Ball.speed;
		this.body.velocity.setTo(newXSpeed, newYSpeed);
		// The x value will always have an absolute value of Ball.speed.
		// The y value will have an absolute value that approaches Ball.speed at higher angles.
		// As a result, the magnitude of the velocity vector increases at higher angles.
		// This is how you get that classic Pong effect of spiking the ball while using the ends of the paddle.
	}

	/**
	 * This is used to determine if a left or right world edge has been collided with.
	 * An event is fired if the right or left boundary is touched.
	 * Not used for top/bottom edge checking, since velocity is 0 at this point, so we can't flip the velocity.y value.
	 * @param {Phaser.Sprite} thisSprite The ball's sprite.
	 * @param {boolean} up If true, the top edge has been hit. Ignored.
	 * @param {boolean} down If true, the bottom edge has been hit. Ignored.
	 * @param {boolean} left If true, the left edge has been hit.
	 * @param {boolean} right If true, the right edge has been hit.
	 */
	private hitBounds(thisSprite: Phaser.Sprite, up: boolean, down: boolean, left: boolean, right: boolean)
	{
		if (left || right)
		{
			this.onHitHorizontalBounds.dispatch(right);
			this.hitRightBoundsLast = right;
			this.visible = false;
			this.game.time.events.add(Phaser.Timer.SECOND * Ball.resetDelay, this.resetBall, this);
			this.body.velocity.setTo(0,0);  // Set the current velocity to 0.
		}
	}

	/**
	 * Reset the ball to its original position, ensure its velocity is zero, make it visible, an restart movement.
	 */
	private resetBall(): void
	{
		this.x = this.initialX;
		this.y = this.initialY;
		this.visible = true;
		this.body.velocity.setTo(0,0);
		this.beginMovementWithDelay();
	}
}