#!/bin/bash

# -e: exit on error
set -e

export NODE_ENV="test"

if [ "$TEST_NOLINTING" = "1" ]; then
  echo "passing linting tests..."
else
  npm run lint
fi;

# -u: error when using undefined var
set -u

# NB: if you want only to run some tests: you can use:
# $ NODE_ENV="test" npx mocha --grep models/user
mocha
