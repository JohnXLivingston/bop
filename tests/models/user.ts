/* eslint-disable no-unused-expressions */
import { describe, before, after, it } from 'mocha'
import * as chai from 'chai'

import { flushTests, flushTestsAndInitDB } from '../test-utils'
import { omit } from 'lodash'

import { UserModel } from '../../src/models/user'
import { CONSTRAINTS } from '../../src/helpers/config/constants'

const expect = chai.expect
chai.use(require('chai-as-promised'))

describe('models/user/user.ts', function () {
  before(flushTestsAndInitDB)
  after(flushTests)

  describe('The default admin user', function () {
    it('There should be an admin user', async function () {
      const user = await UserModel.findByPk(1)
      it('The admin user must be found and have valid data.', function () {
        expect(user).to.not.to.be.null
      })
      it('Common fields must have correct values.', function () {
        expect(user!.login, 'login').to.be.equal('admin')
        expect(user!.authenticationType, 'authentificationType').to.be.equal('password')
        expect(user!.email).to.be.undefined
        expect(user!.username, 'username').to.be.equal('Administrator')
      })
      it('The admin user has the correct password.', function () {
        expect(user!.isPasswordMatch('password')).to.be.true
        expect(user!.isPasswordMatch('not this one')).to.be.false
      })
      it('The toFormattedJSON method should return the correct value.', function () {
        expect(user!.toFormattedJSON()).to.be.deep.equal({
          id: 1,
          username: 'Administrator'
        })
      })
    })
  })

  let user1: UserModel | null
  const user1Data: any = {
    login: 'user1',
    password: 'the user1 password.',
    username: 'Mike',
    email: 'mike@example.com',
    authenticationType: 'password'
  }
  const user2Data: any = {
    login: 'user2',
    password: 'the user2 password.',
    username: 'Henry',
    email: 'henry@example.com',
    authenticationType: 'password'
  }
  describe('User creation', function () {
    it('Should not create user with missing mandatory fields', async function () {
      const failingFunc = async (data: any) => {
        const failingUser = new UserModel(data)
        return failingUser.save()
      }
      await expect(failingFunc(omit(user1Data, 'login')))
        .to.be.rejectedWith(/UserModel\.login cannot be null/)
    })
    it('Should be able to create an user', async function () {
      user1 = new UserModel(user1Data)
      await user1.save()

      expect(await user1!.isPasswordMatch('the user1 password... or not?'), 'wrong password before reloading').to.be.false
      expect(await user1!.isPasswordMatch('the user1 password.'), 'password before reloading').to.be.true

      expect(user1.id, 'User id').to.be.equal(2)

      user1 = await UserModel.findByPk(user1.id)
      expect(user1, 'Not undefined').to.be.not.null
      expect(user1, 'User').to.be.deep.include(omit(user1Data, 'password'))
      expect(await user1!.isPasswordMatch('the user1 password... or not?'), 'wrong password').to.be.false
      expect(await user1!.isPasswordMatch('the user1 password.'), 'password').to.be.true
    })
  })

  describe('User update', function () {
    it('Should be able to save some changes', async function () {
      const changeData: any = {
        login: 'another_login',
        username: 'Not Mike',
        email: 'notmike@example.com',
        password: 'second password'
      }
      user1 = user1!
      for (const key in changeData) {
        (user1 as any)[key] = changeData[key]
      }
      await user1.save()
      user1 = await UserModel.findByPk(user1.id)
      expect(user1, 'user1 not null').to.not.be.null
      expect(user1, 'user1').to.be.deep
        .include(
          omit(
            Object.assign({}, user1Data, changeData),
            'password'
          )
        )
      expect(await user1!.isPasswordMatch('the user1 password... or not?'), 'wrong new password').to.be.false
      expect(await user1!.isPasswordMatch('second password'), 'new password').to.be.true

      for (const key in changeData) {
        // Resetting to previous values:
        (user1 as any)[key] = user1Data[key]
      }
      await user1!.save()
      user1 = await UserModel.findByPk(user1!.id)
      expect(await user1!.isPasswordMatch('the user1 password... or not?'), 'wrong password').to.be.false
      expect(await user1!.isPasswordMatch('the user1 password.'), 'password').to.be.true
    })
  })

  function failingUser (baseUserData: any, changes: any) {
    return new UserModel(
      Object.assign(
        {},
        baseUserData,
        changes
      )
    )
  }
  describe('Constraints', function () {
    describe('Login', function () {
      it('Should be unique', async function () {
        await expect(
          failingUser(user2Data, { login: user1Data.login }).save()
        ).to.be.rejectedWith()
      })

      it('Should not be null', async function () {
        await expect(
          failingUser(user2Data, { login: null }).save()
        ).to.be.rejectedWith()
      })

      it('Should not be too short', async function () {
        await expect(
          failingUser(user2Data, { login: 'a' }).save()
        ).to.be.rejectedWith()
      })

      it('Should not be too long', async function () {
        await expect(
          failingUser(user2Data, {
            login: 'x'.repeat(CONSTRAINTS.USER.LOGIN.max + 1)
          }).save()
        ).to.be.rejectedWith()
      })

      it('Should not be truncated at the max length', async function () {
        user1!.login = 'x'.repeat(CONSTRAINTS.USER.LOGIN.max)
        await user1!.save()
        user1 = await UserModel.findByPk(user1!.id)
        expect(user1?.login).to.be.equal('x'.repeat(CONSTRAINTS.USER.LOGIN.max))

        user1!.login = user1Data.login
        await user1!.save()
      })
    })

    describe('Authentification type', function () {
      it('Should not be null', async function () {
        await expect(
          failingUser(user2Data, { authenticationType: null }).save()
        ).to.be.rejectedWith()
      })

      it('Should not have an invalid value', async function () {
        await expect(
          failingUser(user2Data, { authenticationType: 'dont_exist' }).save()
        ).to.be.rejectedWith()
      })
    })

    describe('Password', function () {
      it('Should not be too short', async function () {
        await expect(
          failingUser(user2Data, { password: 'abcd' }).save()
        ).to.be.rejectedWith()
      })

      it('Should not be too long', async function () {
        await expect(
          failingUser(user2Data, { password: 'x'.repeat(CONSTRAINTS.USER.PASSWORD.max + 1) }).save()
        ).to.be.rejectedWith()
      })

      it('Should not be truncated at the max length', async function () {
        user1!.password = 'x'.repeat(CONSTRAINTS.USER.PASSWORD.max)
        await user1!.save()
        user1 = await UserModel.findByPk(user1!.id)
        expect(await user1!.isPasswordMatch('x'.repeat(CONSTRAINTS.USER.PASSWORD.max))).to.be.true

        user1!.password = user1Data.password
        await user1!.save()
      })
    })

    describe('Email', function () {
      it('Should be unique', async function () {
        await expect(
          failingUser(user2Data, { email: user1Data.email }).save()
        ).to.be.rejectedWith()
      })

      it('Should be a valid email', async function () {
        await expect(
          failingUser(user2Data, { email: 'this is not an email@example.com' }).save()
        ).to.be.rejectedWith()
      })

      // FIXME: find why @IsEmail dont accept this case:
      it('Should not be truncated at the max length')
      // it('Should not be truncated at the max length', async function () {
      //   const email = 'a@' + 'x'.repeat(191 - 'a@.example.com'.length) + '.example.com'
      //   expect(email.length, 'correct test case').to.be.equal(191)
      //   user1!.email = email
      //   await user1!.save()
      //   user1 = await UserModel.findByPk(user1!.id)
      //   expect(user1?.email).to.be.equal(email)

      //   user1!.email = user1Data.email
      //   await user1!.save()
      // })
    })

    describe('User name', function () {
      it('Should not be null', async function () {
        await expect(
          failingUser(user2Data, { username: null }).save()
        ).to.be.rejectedWith()
      })

      it('Should not be too short', async function () {
        await expect(
          failingUser(user2Data, { username: '' }).save()
        ).to.be.rejectedWith()
      })

      it('Should not be too long', async function () {
        await expect(
          failingUser(user2Data, { username: 'x'.repeat(CONSTRAINTS.USER.USERNAME.max + 1) }).save()
        ).to.be.rejectedWith()
      })

      it('Should not be truncated at the max length', async function () {
        user1!.username = 'x'.repeat(CONSTRAINTS.USER.USERNAME.max)
        await user1!.save()
        user1 = await UserModel.findByPk(user1!.id)
        expect(user1?.username).to.be.equal('x'.repeat(CONSTRAINTS.USER.USERNAME.max))

        user1!.username = user1Data.username
        await user1!.save()
      })
    })
  })

  describe('User delete', function () {
    it('Should be able to delete a user', async function () {
      await user1!.destroy()
      user1 = await UserModel.findByPk(user1!.id)
      expect(user1).to.be.null
    })
  })

  describe('countTotal method', function () {
    it('Should be only one user at the beginning.', async function () {
      expect(await UserModel.countTotal()).to.be.equal(1)
    })

    it('Should be two users now.', async function () {
      user1 = new UserModel(user1Data)
      await user1.save()
      expect(await UserModel.countTotal()).to.be.equal(2)
      await user1.destroy()
    })
  })
})
