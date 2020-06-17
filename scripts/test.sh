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

mocha
