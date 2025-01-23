#!/usr/bin/env node

/* eslint-disable */

function configure(content) {
	const encounteredKeys = new Set()

	return content.toString().replace(
		/\${(.*?)}/g,
		(match) => {
			const key = match.substring(2, match.length - 1);
			const value = process.env[key];

			let hasKey = encounteredKeys.has(key)
			encounteredKeys.add(key);

			if (value === undefined || value === "") {
				if (!hasKey) {
					console.warn(`warning: environment variable with key "${key}" is undefined or empty`);
				}

				return "";
			}

			return value;
		}
	);
}

module.exports = { configure };

if (require.main === module) {
	const HELP_MSG = `usage: ${process.argv[0]} ${process.argv[1]} [input file path] [output file path] [options]\n\noptions:\n\t--help                                      display this help message`;

	switch (process.argv.length) {
		case 3: {
			if (process.argv[2] === "--help") {
				console.log(HELP_MSG);
				process.exit(0)
			}
			else {
				console.error(HELP_MSG);
				process.exit(1)
			}
		} break;
		case 4: break;
		default: {
			console.error(HELP_MSG);
			process.exit(1)
		}
	}

	const fs = require("node:fs");
	fs.writeFileSync(process.argv[3], configure(fs.readFileSync(process.argv[2])));
}
