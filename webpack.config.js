const path = require("path");
const targetDir = path.join(__dirname, "bin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const phaserModule = path.join(__dirname, '/node_modules/phaser-ce/');
const phaser = path.join(phaserModule, 'build/custom/phaser-split.js');
const pixi = path.join(phaserModule, 'build/custom/pixi.js');
const p2 = path.join(phaserModule, 'build/custom/p2.js');

module.exports = {
	entry:{
		vendor: ['pixi', 'p2', 'phaser'],
		main: "./src/pongoGame.ts"
	},
	mode:"development",
	devtool: 'cheap-source-map',
	output: {
		filename: "[name].js",
		path: targetDir
	},

	devServer: {
		publicPath: targetDir,
		contentBase: path.join(targetDir, "assets"),
		port: 3000
	},

	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "awesome-typescript-loader",
				exclude: /node_modules/
			},
			{ test: /pixi\.js/, use: ['expose-loader?PIXI'] },
			{ test: /phaser-split\.js$/, use: ['expose-loader?Phaser'] },
			{ test: /p2\.js/, use: ['expose-loader?p2'] },
			{
				enforce: "pre",
				test: /\.js$/,
				loader: "source-map-loader"
			}
		]
	},

	resolve: {
		// Add '.ts' and '.tsx' as resolvable extensions.
		alias: {
			'phaser': phaser,
			'pixi': pixi,
			'p2': p2
		},
		extensions: [
			".ts",
			".tsx",
			".js",
			".json"
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: process.env["npm_package_productName"],
			chunks: ['vendor', 'main'],
			filename: "index.html",
			template: path.resolve(__dirname, "src/template.ejs")
		}),
		new BrowserSyncPlugin({
			host: process.env.IP || 'localhost',
			port: process.env.PORT || 3000,
			server: {
				baseDir: ['./', './bin']
			}
		})
	]
};
