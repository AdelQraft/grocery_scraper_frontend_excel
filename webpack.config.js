/* eslint-disable no-undef */

const configuration = require("./build_utility/configuration");

const devCerts = require("office-addin-dev-certs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CustomFunctionsMetadataPlugin = require("custom-functions-metadata-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {resolve} = require("node:path");

async function getHttpsOptions() {
	const httpsOptions = await devCerts.getHttpsServerOptions();
	return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

module.exports = async (env, options) => {
	const envFilePath = options.mode === "development" ? ".env.dev" : ".env.prod";
	require("dotenv").config({ path: envFilePath });

	const DotenvWebpackPlugin = require("dotenv-webpack");

	const distDir = resolve(__dirname, process.env.DIST_DIR);

	return {
		devtool: "source-map",
		entry: {
			polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
			taskpane: ["./src/taskpane/taskpane.ts", "./src/taskpane/taskpane.html"],
			commands: "./src/command/command.ts",
			functions: "./src/function/function.ts",
		},
		output: {
			clean: true,
			path: distDir
		},
		resolve: {
			extensions: [".ts", ".html", ".js"],
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					exclude: /node_modules/,
					use: {
						loader: "babel-loader",
					},
				},
				{
					test: /\.html$/,
					exclude: /node_modules/,
					use: "html-loader",
				},
				{
					test: /\.(png|jpg|jpeg|gif|ico)$/,
					type: "asset/resource",
					generator: {
						filename: "asset/[name][ext][query]",
					},
				},
			],
		},
		plugins: [
			new CustomFunctionsMetadataPlugin({
				output: "functions.json",
				input: "./src/function/function.ts",
			}),
			new HtmlWebpackPlugin({
				filename: "taskpane.html",
				template: "./src/taskpane/taskpane.html",
				chunks: ["polyfill", "taskpane", "functions", "commands"],
			}),
			new DotenvWebpackPlugin({
				path: envFilePath
			}),
			new CopyWebpackPlugin({
				patterns: [
					{
						from: "asset",
						to: "asset",
					},
					{
						from: "manifest*.xml.in",
						to: "[name]",
						transform(content) {
							return configuration.configure(content)
						},
					},
				],
			}),
		],
		devServer: {
			headers: {
				"Access-Control-Allow-Origin": "*",
			},
			server: {
				type: "https",
				options: env.WEBPACK_BUILD || options.https !== undefined ? options.https : await getHttpsOptions(),
			},
			port: process.env.npm_package_config_dev_server_port || 3000,
		},
	};
};
