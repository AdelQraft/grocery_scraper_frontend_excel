#!/bin/env node

function configure(content) {
	return content.toString().replace(
		/\${(.*?)}/g,
		(match) => {
			const varName = match.substring(2, match.length - 1);
			const value = process.env[varName];
			if (value === undefined || value === "") {
				console.warn(`warning: environment variable "${varName}" is empty or not defined`);
				return "";
			}
			return value;
		}
	);
}

module.exports = { configure };

if (require.main === module) {
	const HELP_MSG = `usage: ${process.argv[0]} ${process.argv[1]} [input file path] [output file path] [options]\n\noptions:\n\t-p                                          use production environment file instead of the dev one\n\t--help,                                     display this help message`;

	let envFilePath;
	switch (process.argv.length) {
		case 4: {
			if (process.argv[2] === "--help") {
				console.log(HELP_MSG);
				return;
			}
			envFilePath = `${__dirname}/../.env.dev`;
		} break;
		case 5: {
			switch (process.argv[4]) {
				case "-p": {
					envFilePath = `${__dirname}/../.env.prod`;
				} break;
				default: {
					console.error(HELP_MSG);
					return;
				} break;
			} break;
		}
		default: {
			console.error(HELP_MSG);
			return;
		} break;
	}

	require("../node_modules/dotenv").config({ path: envFilePath });
	const fs = require("node:fs");
	fs.writeFileSync(process.argv[3], configure(fs.readFileSync(process.argv[2])));
}
