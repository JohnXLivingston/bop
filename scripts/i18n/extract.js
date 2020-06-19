#!/usr/bin/env node

console.log('Searching gettext in typescript sources...')

const { GettextExtractor, JsExtractors } = require('gettext-extractor')

let extractor = new GettextExtractor()

extractor.createJsParser([
  JsExtractors.callExpression('gettext', {
    arguments: {
      text: 0
    }
  })
]).parseFilesGlob('./src/**/*.@(ts|js|tsx|jsx)')


extractor.savePotFile('./src/locale/templates/LC_MESSAGES/messages.pot');

extractor.printStats();

console.log('Continuing to nunjucks templates with jsxgettext...')

exec = require('child_process').exec
const jsxgettextCmd = './node_modules/.bin/jsxgettext -j -L jinja \
   --output-dir=src/locale/templates/LC_MESSAGES \
   --from-code=utf-8 \
   --output=messages.pot \
  `find ./src -name \'*.html\' -o -name \'*.njk\' | grep -v node_modules | grep -v "\.git"`;'
exec(jsxgettextCmd, function (err, stdout, stderr) {
  if (err) {
    console.error(stdout);
    console.error(stderr);
    throw "Error."
  }
  console.log('done');
})


// #!/bin/bash

// # -e: exit on error
// set -e

// export NODE_ENV="production"

// npm run clean;
// npm run build;

// ./node_modules/.bin/jsxgettext -L javascript \
//   --output-dir=src/locale/templates/LC_MESSAGES \
//   --from-code=utf-8 \
//   --output=messages.pot \
//   `find ./dist -name '*.js' | grep -v node_modules | grep -v "\.git"`;

// ./node_modules/.bin/jsxgettext -j -L jinja \
//   --output-dir=src/locale/templates/LC_MESSAGES \
//   --from-code=utf-8 \
//   --output=messages.pot \
//   `find ./dist -name '*.html' -o -name '*.njk' | grep -v node_modules | grep -v "\.git"`;

