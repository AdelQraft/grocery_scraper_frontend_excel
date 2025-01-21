#!/usr/bin/env node

/* eslint-disable */

if (require.main === module) {
	const HELP_MSG = `usage: ${process.argv[0]} ${process.argv[1]} [options] [EXECUTABLE] [ARGS]...\n\noptions:\n\t--help                                     display this help message`;

	if (process.argv.length === 2) {
		console.error(HELP_MSG);
		process.exit(1);
	}

	if (process.argv[2] === "--help") {
		if (process.argv.length === 3) {
			console.log(HELP_MSG);
			process.exit(0)
		}
		else {
			console.error(HELP_MSG);
			process.exit(1)
		}
	}

	const {exec} = require('child_process');

	const command = process.argv.slice(2).join(' ');

	exec(command, (_, stdout, stderr) => {
		if (stdout) console.log(stdout);
		if (stderr) console.error(stderr);

		process.exit(0);
	});
}
