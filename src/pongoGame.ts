import * as Phaser from "phaser-ce";
import {PlayState} from "./playState";

/**
 * Initializes gameplay and creates the PlayState object. This game doesn't really need other states in a demo.
 */
class PongoGame extends Phaser.Game
{
	constructor()
	{
		// The game world will be 600x600
		super(600, 600, Phaser.CANVAS, "content");
		this.state.add("PLAY", PlayState, true);
	}
}

/**
 * This is where the root game object is instantiated and set to a global variable.
 */
window.onload = () =>
{
	const game = new PongoGame();
};
