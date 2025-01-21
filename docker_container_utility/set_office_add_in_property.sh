#!/usr/bin/env sh

HELP_MSG="usage: $0 [VAR]=[VAL]... [options]\n\noptions:\n\t--help                                     display this help message"

exitAndPrintHelpMessage() {
	if [ "$1" -eq 0 ]; then
		printf "%b\n" "$HELP_MSG"
		exit 0
	else
		>&2 printf "%b\n" "$HELP_MSG"
		exit 1
	fi
}

getSubstitutionParameter() {
	printf "%s" "$(printf "%s" "$1" | cut -d "=" -f "$2")" | sed -e 's/[]\/$*.^[]/\\&/g'
}

if [ $# -eq 0 ]; then exitAndPrintHelpMessage 1; fi

if [ $# -eq 1 ]; then
	if [ "$1" = "--help" ]; then exitAndPrintHelpMessage 0;
	else exitAndPrintHelpMessage 1; fi
fi

SRC_PATH="/etc/grocery_scraper_frontend_excel/template"
DST_PATH="/usr/share/nginx/html"

rm -rf "$DST_PATH"
cp -r "$SRC_PATH" "$DST_PATH"

for arg in "$@"; do
	if [ "$(printf "%s" "$arg" | grep -o "=" | wc -l)" -eq 0 ]; then exitAndPrintHelpMessage 1; fi

	matchStr="PLACEHOLDER___$(getSubstitutionParameter "$arg" 1)___PLACEHOLDER"
	replaceStr="$(getSubstitutionParameter "$arg" 2)"

	find "$DST_PATH" -type f -print0 | xargs -0 sed -e "s/$matchStr/$replaceStr/g" -i
done
