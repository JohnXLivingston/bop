import * as fs from 'fs'
import * as path from 'path'

import { isTest } from './env'

const filename: string = path.join(__dirname, '../../assets.json')
const raw: string = isTest ? '{}' : fs.readFileSync(filename, 'utf-8')
export const webpackManifest = JSON.parse(raw)
