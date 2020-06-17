import { User } from './user'

export interface Context {
  webBaseUrl: string,
  notifierBaseUrl: string,
  user?: User
}
