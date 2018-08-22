import * as Phaser from "phaser-ce";
import {Paddle} from "./paddle";
import {Ball} from "./ball";

export class PlayState extends Phaser.State
{
	private ball: Ball;
	private paddles: Paddle[] = [];
	private playerScores: number[];
	private scoreLabels: Phaser.Text[] = [];
	private static readonly lineSegments: number = 17;
	private static readonly lineSegmentWidth: number = 2;
	private static readonly paddleWidth = 16;
	private static readonly paddleHeight = 90;
	private static readonly paddleMargin = 32;

	/**
	 * Called by Phaser to for asset loading.
	 */
	public preload()
	{
		this.load.image("tile", "assets/tile.png");
	}

	/**
	 * Called by Phaser for object instantiation and general game state setup.
	 */
	public create()
	{
		this.playerScores = [0, 0];

		this.stage.backgroundColor = Phaser.Color.getColor(0, 0, 0);

		this.game.physics.startSystem(Phaser.Physics.ARCADE);

		this.ball = PlayState.createBall(this.game);
		this.ball.onHitHorizontalBounds.add(this.onBallHitHorizontalBounds.bind(this));

		this.paddles = PlayState.createPaddles(this.game);
		this.scoreLabels = PlayState.createScoreUI(this.game);
		PlayState.createInfoUI(this.game);
		PlayState.createSeparatorLine(this.game);
	}

	/**
	 * Generate a new ball object.
	 * @param {Phaser.Game} game
	 * @return {Ball}
	 */
	private static createBall(game: Phaser.Game): Ball
	{
		const halfWidth: number = game.world.width * 0.5;
		const halfHeight: number = game.world.height * 0.5;
		const ballDiameter = 16;
		const ball: Ball = new Ball(game, halfWidth, halfHeight, ballDiameter, "tile");
		game.add.existing(ball);
		return ball;
	}

	/**
	 * Generate two new game paddles.
	 * @param {Phaser.Game} game
	 * @return {Paddle[]} The two paddles. The paddle at index 0 is the left player.
	 */
	private static createPaddles(game: Phaser.Game): Paddle[]
	{
		const worldWidth: number = game.world.width;
		const halfHeight: number = game.world.height * 0.5;
		const paddles: Paddle[] = [];

		// The left player's paddle.
		paddles.push(new Paddle(
			game,
			PlayState.paddleMargin,
			halfHeight,
			PlayState.paddleWidth,
			PlayState.paddleHeight,
			"tile",
			game.input.keyboard.addKey(Phaser.Keyboard.W),
			game.input.keyboard.addKey(Phaser.Keyboard.S))
		);

		// The right player's paddle:
		paddles.push(new Paddle(
			game,
			worldWidth - PlayState.paddleMargin,
			halfHeight,
			PlayState.paddleWidth,
			PlayState.paddleHeight,
			"tile",
			game.input.keyboard.addKey(Phaser.Keyboard.UP),
			game.input.keyboard.addKey(Phaser.Keyboard.DOWN))
		);

		for (let i = 0; i < paddles.length; i++)
		{
			game.add.existing(paddles[i]);
		}
		return paddles;
	}

	/**
	 * Create the labels for the UI's score.
	 * @param {Phaser.Game} game
	 * @return {Phaser.Text[]} The score labels that were generated.
	 */
	private static createScoreUI(game: Phaser.Game): Phaser.Text[]
	{
		const quarterWidth: number = game.world.width * 0.25;
		const quarterHeight: number = game.world.height * 0.25;
		const scoreStyle = {font: "60px monospace", fill: "#FFFFFF", align: "center"};
		const scoreLabels: Phaser.Text[] = [];
		scoreLabels.push(game.add.text(quarterWidth, quarterHeight, "0", scoreStyle));
		scoreLabels.push(game.add.text(quarterWidth * 3, quarterHeight, "0", scoreStyle));
		return scoreLabels;
	}

	/**
	 * Create instruction labels and the game title/credits labels.
	 * @param {Phaser.Game} game
	 */
	private static createInfoUI(game: Phaser.Game): void
	{
		const worldHeight: number = game.world.height;
		const worldWidth: number = game.world.width;
		const labelStyle = {font: "18px monospace", fill: "#FFFFFF", align: "center"};
		game.add.text(32, worldHeight - 32, "W / S", labelStyle);
		game.add.text(worldWidth - 110, worldHeight - 32, "UP/ DOWN", labelStyle);
		game.add.text(16, 8, "PONGO - 2018 Michael Consoli", labelStyle);
	}

	/**
	 * Generate the visuals for a mid-screen dashed line.
	 * @param {Phaser.Game} game
	 */
	private static createSeparatorLine(game: Phaser.Game): void
	{
		const halfWidth: number = game.world.width * 0.5;
		const worldHeight: number = game.world.height;
		const lineHeight: number = worldHeight / PlayState.lineSegments;
		let lineStartY: number = 0;
		for (let i = 0; i < PlayState.lineSegments; i++)
		{
			// Draw every other segment to make it dashed:
			if (i % 2 == 0)
			{
				// Create the line data:
				const line: Phaser.Line = new Phaser.Line(halfWidth, lineStartY, halfWidth, lineStartY + lineHeight);
				// Create the graphics object that will render the line segment:
				const visuals = game.add.graphics(0, 0);
				// Lines should be thin, white, and opaque:
				visuals.lineStyle(PlayState.lineSegmentWidth, 0xffffff, 1);
				game.add.graphics(line.start.x, line.start.y);
				visuals.moveTo(line.start.x, line.start.y);
				visuals.lineTo(line.end.x, line.end.y);
				visuals.endFill();
			}
			lineStartY += lineHeight;
		}
	}

	/**
	 * Update the physics simulation once per frame.
	 */
	public update()
	{
		for (let i = 0; i < this.paddles.length; i++)
		{
			this.game.physics.arcade.collide(this.paddles[i], this.ball);
		}
	}

	/**
	 * Fires on the event of the ball hitting the left or right edge. Give a point to the player opposite this side.
	 */
	private onBallHitHorizontalBounds()
	{
		if (arguments.length > 0)
		{
			const value: boolean = !!arguments[0];
			this.scorePoint(value ? 0 : 1);
		}
	}

	/**
	 * Iterate a player's score. Player 0 is on the left, player 1 on the right.
	 * @param {number} playerIndex
	 */
	private scorePoint(playerIndex: number)
	{
		if (playerIndex < this.playerScores.length)
		{
			this.playerScores[playerIndex]++;
		}
		this.refreshScoreDisplay();
	}

	/**
	 * Updates the current and top score dialogs.
	 * */
	private refreshScoreDisplay()
	{
		for (let i = 0; i < this.scoreLabels.length && i < this.playerScores.length; i++)
		{
			this.scoreLabels[i].text = this.playerScores[i].toString();
		}
	}

}