#!/bin/bash

command -v dot >/dev/null 2>&1 || { echo >&2 "I require dot command but it's not installed. Please use 'sudo apt-get install graphviz'. Aborting."; exit 1; }

NODE_ENV=development npx depcruise --config ./.dependency-cruiser.js --include-only "^src" --output-type dot src | dot -T svg > ./dependencies.svg
NODE_ENV=development npx depcruise --config ./.dependency-cruiser.js --include-only "^src" --output-type ddot src | dot -T svg > ./dependencies-directory.svg
NODE_ENV=development npx depcruise --config ./.dependency-cruiser.js --include-only "^src" --output-type dot src | dot -T svg | npx depcruise-wrap-stream-in-html > ./dependencies.html
NODE_ENV=development npx depcruise --config ./.dependency-cruiser.js --include-only "^src" --output-type ddot src | dot -T svg | npx depcruise-wrap-stream-in-html > ./dependencies-directory.html
