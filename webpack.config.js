var webpack = require('webpack');

module.exports = {
	entry: [
		'webpack-dev-server/client?http://localhost:9090',
		'webpack/hot/only-dev-server',
		'./src/app.js'
	],
	output: {
		path: './dist',
		publicPath: '/',
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{ test: /\.css$/, loader: 'style!css' },
			{ test: /\.json$/, loader: 'json-loader' }
		]
	},
	node: { fs: "empty" },
	plugins: [
		//new webpack.optimize.OccurenceOrderPlugin(),
		//new webpack.optimize.UglifyJsPlugin({minimize: true})
	]
};