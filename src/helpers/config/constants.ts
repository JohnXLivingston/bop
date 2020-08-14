const BCRYPT_SALT_ROUNDS = 10

const CONSTRAINTS = {
  USER: {
    LOGIN: { min: 4, max: 120 },
    USERNAME: { min: 1, max: 120 },
    PASSWORD: { min: 6, max: 255 }
  },
  PROJECT: {
    NAME: { min: 4, max: 120 }
  },
  RESOURCE: {
    NAME: { min: 4, max: 120 }
  },
  TASK: {
    NAME: { min: 0, max: 120 }
  }
}

export {
  BCRYPT_SALT_ROUNDS,
  CONSTRAINTS
}
