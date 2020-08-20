import * as bcrypt from 'bcrypt'
import * as cryptoRandomString from 'crypto-random-string'
import { BCRYPT_SALT_ROUNDS } from '../config'

async function comparePassword (password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

async function cryptPassword (password: string): Promise<string> {
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS)
  return bcrypt.hash(password, salt)
}

async function generateRandomPassword (): Promise<string> {
  return cryptoRandomString({
    length: 20,
    characters: 'abcdefghijklmnopqrstuvwzyzABCDEFGHIJKLMNOPQRSTUVWXYZ?,.;:!%*&-_@'
  })
}

export {
  comparePassword,
  cryptPassword,
  generateRandomPassword
}
