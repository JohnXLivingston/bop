import * as fs from 'fs'
import * as path from 'path'

import { isTest } from './env'

const filename: string = path.join(__dirname, '../../assets.json')
const raw: string = isTest ? '{}' : fs.readFileSync(filename, 'utf-8')

interface WebpackAsset {
  css?: string
  js?: string
  png?: string[]
  svg?: string[]
  text?: string
}

interface WebpackAssets {[key: string]: WebpackAsset}

const assets: WebpackAssets = JSON.parse(raw)
let headerManifestScriptTxt: string
const cssFiles: {[key: string]: string[]} = {}
const jsFiles: {[key: string]: string[]} = {}
let faviconSvg: string | undefined
for (const key in assets) {
  const asset = assets[key]
  if (key === '') {
    // - '' : here are some images and other stuff
    //        and since webpack5, there are common js (vendors, ...) and css
    // looking for the favicon...
    if (asset.svg && Array.isArray(asset.svg)) {
      faviconSvg = asset.svg.find((url: string) => /^\/images\/bop\.\w+\.svg$/.test(url))
    }
    if (asset.js) {
      if (Array.isArray(asset.js)) {
        jsFiles[''] = asset.js
      } else {
        jsFiles[''] = [asset.js]
      }
    }
    if (asset.css) {
      if (Array.isArray(asset.css)) {
        cssFiles[''] = asset.css
      } else {
        cssFiles[''] = [asset.css]
      }
    }
    continue
  }
  if (key === 'manifest') {
    // - 'manifest' : the webpack manifest
    if (asset.text) {
      headerManifestScriptTxt = asset.text
    }
    continue
  }
  let parts: string[]
  const m = key.match(/^[a-z]+-([^-]*)-.*$/)
  if (m) {
    // - cacheGroupKey-chunk1(~chunk2~... )?-modulefilename
    // (see webpack.config.js)
    parts = m[1].split('~').filter(s => s !== '')
  } else {
    // - chunck~.
    // - vendors~chunk1~(chunk2=~)*.
    parts = key.split('.')[0].split('~')
    parts = parts.filter(s => s !== '' && s !== 'vendors')
  }
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (asset.js) {
      if (!jsFiles[part]) { jsFiles[part] = [] }
      jsFiles[part].push(asset.js)
    }
    if (asset.css) {
      if (!cssFiles[part]) { cssFiles[part] = [] }
      cssFiles[part].push(asset.css)
    }
  }
}

// FIXME: cssFiles should be sorted by correct order
// FIXME: jssFiles should be sorted by dependencies

// WebpackManifest will be used in templates.
// This means that attributes like 'private' or
// 'readonly' can be ignored.
// To avoid malicious code to accidently modify
// scripts and inject code, data are not stored
// on the object, but in variables.
class WebpackManifest {
  headerScriptTxt (/* name: string */): string {
    // This code will be used in templates.
    // To avoid some code injection, we must always return
    // a clone.
    return headerManifestScriptTxt
  }

  favicons (/* name: string */): string {
    if (!faviconSvg) {
      return ''
    }
    return `<link rel="icon" type="image/svg+xml" href="${faviconSvg}">`
  }

  stylesheetUrls (name: string): string[] {
    // clone to avoid injections if variable is compromised!
    const common = cssFiles[''] ? cssFiles[''].slice() : []
    if (!cssFiles[name]) {
      return common
    }
    // clone array!
    return common.concat(cssFiles[name].slice())
  }

  scriptUrls (name: string): string[] {
    // This code will be used in templates.
    // To avoid some code injection, we must always return
    // clones.
    const common = jsFiles[''] ? jsFiles[''].slice() : []
    if (!jsFiles[name]) {
      return common
    }
    return common.concat(jsFiles[name].slice())
  }
}

export const webpackManifest = new WebpackManifest()
