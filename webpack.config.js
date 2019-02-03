const path = require('path');

module.exports = {
	mode: 'development',
	entry: [
		//'webpack-dev-server/client?http://localhost:9090',
		//'webpack/hot/dev-server',
		'./src/app.js'
	],
	output: {
		path: path.resolve(__dirname, '.'),
		filename: 'bundle.js'
	},
	devtool: 'inline-source-map',
	module: {
		rules: [
			{ test: /\.css$/, loader: 'style!css' },
			{ test: /\.json$/, loader: 'json-loader', type: 'javascript/auto' }
		]
	},
	node: { fs: "empty" },
	plugins: [
		//new webpack.optimize.OccurenceOrderPlugin(),
		//new webpack.optimize.UglifyJsPlugin({minimize: true})
	]
};