const BaseLexer = require('./node_modules/i18next-parser/dist/lexers/base-lexer')
class NunjucksLexer extends BaseLexer { // This class is inspired by original handlebars-lexer.
  constructor(options = {}) {
    super(options)

    this.functions = options.functions || ['t', 'i18n.t']

    this.createFunctionRegex()
    this.createArgumentsRegex()
    this.createOptionsRegex()
  }

  extract(content) {
    let matches

    while ((matches = this.functionRegex.exec(content))) {
      const args = this.parseArguments(matches[1])
      this.populateKeysFromArguments(args)
    }

    return this.keys
  }

  parseArguments(args) {
    const result = {
      arguments: [],
      options: {},
    }

    let matches = args.match(this.argumentsRegex)
    if (matches) {
      if (matches.groups.simpleKey) {
        result.arguments.push(matches.groups.simpleKey)
      } else if (matches.groups.multipleKeys) {
        result.arguments.push(...matches.groups.multipleKeys.split(/\s*,\s*/))
      } else {
        this.emit('warning', `No key found in: ${args}`)
      }

      if (matches.groups.options) {
        result.options = this.parseOptions(matches.groups.options)
      }
    } else {
      this.emit('warning', `Cannot parse: ${args}`)
    }
    return result
  }

  parseOptions(options) {
    let matches
    let result = {}
    while (matches = this.optionsRegex.exec(options)) {
      const key = matches.groups.key
      const value = matches.groups.value
      if (!key) {
        this.emit('warning', 'Cant find key in this option: ' + matches[0])
      } else if (this.validateString(value)) {
        result[key] = value.slice(1, -1) // remove quotes
      } else if (/\d+/.test(value)) {
        result[key] = value
      } else {
        this.emit('warning', 'Cant read option value: ' + value)
      }
    }
    return result
  }

  populateKeysFromArguments(args) {
    const firstArgument = args.arguments[0]
    const secondArgument = args.arguments[1]
    const isKeyString = this.validateString(firstArgument)
    const isDefaultValueString = this.validateString(secondArgument)

    if (!isKeyString) {
      this.emit('warning', `Key is not a string literal: ${firstArgument}`)
    } else {
      const result = {
        ...args.options,
        key: firstArgument.slice(1, -1), // remove quotes
      }
      if (isDefaultValueString) {
        result.defaultValue = secondArgument.slice(1, -1) // remove quotes
      }
      this.keys.push(result)
    }
  }
  createFunctionRegex() {
    const functionPattern = this.functionPattern() // (?:t|inext\.t)
    // a call to i18next should be like: {{ i18n.t('key') }}
    const callPattern = 
      '(?:\\s)' + // space as separator
      functionPattern + // i18n.t or t
      '(?:\\s*\\()' + // optionnal spaces, and opening parenthesis
      '([^)]*)' + // arguments: everything that is not a closing parenthesis
      '(?:\\))' // closing parenthesis
    this.functionRegex = new RegExp(callPattern, 'gi')
    return this.functionRegex
  }

  createArgumentsRegex() {
    // this method resulting RegExp will return 2 matches: one string with keys, one with options
    // args can be :
    // - 'key'
    // - 'key', { ...options }
    // - ['key', 'other_key']
    // - ['key', 'other_key'], { ...options }

    const simpleKey = '(?<simpleKey>' + BaseLexer.stringOrVariablePattern + ')'
    const multipleKeys =
      '\\[\\s*' +
      '(?<multipleKeys>' +
      BaseLexer.stringOrVariablePattern + '(?:\\s*,\\s*' + BaseLexer.stringOrVariablePattern + ')*' +
      ')' +
      '\\s*\\]'

    const keysPart =
      '(^(?<keys>' +
      simpleKey +
      '|' +
      multipleKeys +
      '))'

    const optionsPart =
      '\\{' +
      '(?<options>[^}]*)' +
      '\\}'
    
    const pattern =
      keysPart +
      '(?:\\s*,\\s*' +
      optionsPart +
      ')?'

    this.argumentsRegex = new RegExp(pattern, 'mi')
    return this.argumentsRegex
  }

  createOptionsRegex() {
    this.optionsRegex = new RegExp(
      '(?<key>' + BaseLexer.variablePattern + ')' +
      '\\s*:\\s*' +
      '(?<value>[^,]+)' +
      '\\s*(?:,|$)',
      'gim'
    )
    return this.optionsRegex
  }
}

module.exports = {
  contextSeparator: '_',
  // Key separator used in your translation keys

  createOldCatalogs: true,
  // Save the \_old files

  defaultNamespace: 'common',
  // Default namespace used in your i18next config

  defaultValue: '',
  // Default value to give to empty keys

  indentation: 2,
  // Indentation of the catalog files

  keepRemoved: false,
  // Keep keys from the catalog that are no longer in code

  keySeparator: '.',
  // Key separator used in your translation keys
  // If you want to use plain english keys, separators such as `.` and `:` will conflict. You might want to set `keySeparator: false` and `namespaceSeparator: false`. That way, `t('Status: Loading...')` will not think that there are a namespace and three separator dots for instance.

  // see below for more details
  lexers: {
    html: [NunjucksLexer],
    njk: [NunjucksLexer],

    js: ['JavascriptLexer'], // if you're writing jsx inside .js files, change this to JsxLexer
    ts: ['JavascriptLexer'],
    jsx: ['JsxLexer'],
    tsx: ['JsxLexer'],

    default: ['JavascriptLexer']
  },

  lineEnding: 'auto',
  // Control the line ending. See options at https://github.com/ryanve/eol

  locales: ['en', 'fr'],
  // An array of the locales in your applications

  namespaceSeparator: ':',
  // Namespace separator used in your translation keys
  // If you want to use plain english keys, separators such as `.` and `:` will conflict. You might want to set `keySeparator: false` and `namespaceSeparator: false`. That way, `t('Status: Loading...')` will not think that there are a namespace and three separator dots for instance.

  output: 'src/locales/$LOCALE/$NAMESPACE.json',
  // Supports $LOCALE and $NAMESPACE injection
  // Supports JSON (.json) and YAML (.yml) file formats
  // Where to write the locale files relative to process.cwd()

  input: ['src/**/*.@(ts|js|tsx|jsx|html|njk)'],
  // An array of globs that describe where to look for source files
  // relative to the location of the configuration file

  sort: true,
  // Whether or not to sort the catalog

  skipDefaultValues: false,
  // Whether to ignore default values.

  useKeysAsDefaultValue: false,
  // Whether to use the keys as the default value; ex. "Hello": "Hello", "World": "World"
  // This option takes precedence over the `defaultValue` and `skipDefaultValues` options

  verbose: true,
  // Display info about the parsing including some stats

  failOnWarnings: true,
  // Exit with an exit code of 1 on warnings

  customValueTemplate: null
  // If you wish to customize the value output the value as an object, you can set your own format.
  // ${defaultValue} is the default value you set in your translation function.
  // Any other custom property will be automatically extracted.
  //
  // Example:
  // {
  //   message: "${defaultValue}",
  //   description: "${maxLength}", // t('my-key', {maxLength: 150})
  // }
}