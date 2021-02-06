#!/bin/bash

set -euo pipefail

mkdir -p dist/
cp -r src/views/ dist/

mkdir -p dist/views/shared/
cp -r src/shared/templates/ dist/views/shared/
