export const isProduction = process.env.NODE_ENV === 'production'
export const isTest = process.env.NODE_ENV === 'test'
export const isNotifier = require.main?.filename.match(/\bnotifier\.(js|ts)$/)
