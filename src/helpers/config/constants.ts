const BCRYPT_SALT_ROUNDS = 10

const CONSTRAINTS = {
  USER: {
    LOGIN: { min: 4, max: 120 },
    PASSWORD: { min: 6, max: 255 }
  }
}

export {
  BCRYPT_SALT_ROUNDS,
  CONSTRAINTS
}
