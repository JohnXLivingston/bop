/// <reference path="../models/user.d.ts" />

declare interface Context {
  webBaseUrl: string,
  notifierBaseUrl: string,
  user?: User
}
