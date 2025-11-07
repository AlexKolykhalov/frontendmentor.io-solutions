#!/bin/bash

while [[ $# -gt 0 ]]; do
    case $1 in
        --css=*)
            CSS_FILE="${1#*=}"
            shift
            ;;
        --search-dir=*)
            SEARCH_PATH="${1#*=}"
            shift
            ;;
        *)
            shift
            ;;
    esac
done

CSS_FILE="../public/main.css"
SEARCH_PATH="../public/pages/"

FILES=$(find "$SEARCH_PATH" -type f \( -name "*.html" -o -name "*.js" \))
TOKENS_IN_FILES=""
TOKENS_IN_CSS=$(grep -o '^\.[a-zA-Z0-9-]\+' "$CSS_FILE" | sort -u)

echo -e "\n\nUseless CSS tokens in files\n"
for file in $FILES; do
    for i in "$(grep -o 'class="[^"]*"' "$file")"; do
	if [[ "$i" != "" ]]; then
	    TOKENS_IN_FILES+="$(echo "$i" | awk -v file="$file" '{ gsub(/class="|["\[\]$\{\}]/, "");$1=$1;for(i=1;i<=NF;i++){ printf "\n%s|%s",$i,file } }')"
	fi
    done
done
for token in $(echo "$TOKENS_IN_FILES" | sort -u); do
    if ! grep -q "$(echo "$token" | awk -F'|' '{ gsub(/:/, "\\\\:");print $1 }')" "$CSS_FILE"; then
	echo $(echo "$token" | awk -F'|' '{ print $1, "("$2")" }')
    fi
done

echo -e "\n\nUseless tokens in CSS file\n"
for token in $TOKENS_IN_CSS; do
    flag=0
    for file in $FILES; do
	if grep -q $token $file; then
	    flag=1
	    break
	fi
    done
    if [[ $flag == 0 ]]; then
	echo "$token"
    fi
done

