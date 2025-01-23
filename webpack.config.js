/* eslint-disable no-undef */

const configuration = require("./build_utility/configuration")

const devCerts = require("office-addin-dev-certs")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const CustomFunctionsMetadataPlugin = require("custom-functions-metadata-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const webpack = require('webpack');
const path = require("node:path")

async function getHttpsOptions() {
	const httpsOptions = await devCerts.getHttpsServerOptions()
	return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert }
}

module.exports = async (env, options) => {
	const envFilePath = options.mode === "development" ? ".env.dev" : ".env.prod"
	require("dotenv").config({ path: envFilePath })

	console.log(process.env.ENVIRONMENT_DEFINITION_URL)

	return {
		devtool: "source-map",
		entry: {
			polyfill: [
				"core-js/stable",
				"regenerator-runtime/runtime"
			],
			common: [
				"./src/environment.ts",
				"./src/function/functions.ts"
			],
			taskpane: {
				import: ["./src/taskpane/taskpane.ts", "./src/taskpane/taskpane.html"],
				dependOn: "common"
			},
			commands: "./src/command/commands.ts",
			functions: {
				import: "./src/function/function.ts",
				dependOn: "common"
			}
		},
		output: {
			clean: true,
			path: path.resolve(__dirname, process.env.DIST_DIR)
		},
		resolve: {
			extensions: [".ts", ".html", ".js"]
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					exclude: /node_modules/,
					use: {
						loader: "babel-loader"
					}
				},
				{
					test: /\.html$/,
					exclude: /node_modules/,
					use: "html-loader"
				}
			]
		},
		plugins: [
			new CustomFunctionsMetadataPlugin({
				output: "functions.json",
				input: "./src/function/function.ts"
			}),
			new HtmlWebpackPlugin({
				filename: "taskpane.html",
				template: "./src/taskpane/taskpane.html",
				chunks: ["common", "polyfill", "taskpane", "functions", "commands"]
			}),
			new CopyWebpackPlugin({
				patterns: [
					{
						from: "src/asset",
						to: "asset",
					},
					{
						from: "src/manifest*.xml.in",
						to: "[name]",
						transform(content) {
							return configuration.configure(content)
						}
					},
					{
						from: "src/env_def.json.in",
						to: "[name]",
						transform(content) {
							return configuration.configure(content)
						}
					}
				]
			}),
			new webpack.DefinePlugin({
				ENVIRONMENT_DEFINITION_URL: JSON.stringify(process.env.ENVIRONMENT_DEFINITION_URL
					? process.env.ENVIRONMENT_DEFINITION_URL
					: "env_def.json"
				)
			})
		],
		devServer: {
			headers: {
				"Access-Control-Allow-Origin": "*"
			},
			server: {
				type: "https",
				options: env.WEBPACK_BUILD || options.https !== undefined ? options.https : await getHttpsOptions()
			},
			port: process.env.npm_package_config_dev_server_port || 3000
		}
	}
}
