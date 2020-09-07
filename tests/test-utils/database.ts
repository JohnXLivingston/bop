/* eslint-disable no-unused-expressions */
import { describe, it, after, before } from 'mocha'
import * as chai from 'chai'

import { omit } from 'lodash'

import { Model } from 'sequelize-typescript'

const expect = chai.expect
chai.use(require('chai-as-promised'))

interface TestArgs<T extends Model> {
  name: string,
  ObjectClass: {
    new (...args: any[]): T,
    findByPk: (...args: any[]) => Promise<T | null>,
    destroy: () => Promise<number>
  },
  optimisticLocking?: boolean
}

interface TestArgsCreationAndDeletion<T extends Model> extends TestArgs<T> {
  data: any | Function,
  mandatoryFields?: string[],
  expectedObjectId?: number
}

function resolveData (data: any): any {
  if (typeof data === 'function') {
    return data()
  }
  return data
}

function testModelCreationAndDeletion<T extends Model> ({
  name,
  ObjectClass,
  data,
  mandatoryFields,
  expectedObjectId,
  optimisticLocking
}: TestArgsCreationAndDeletion<T>): void {
  describe(name + ' creation', function () {
    let object: T | null
    let objectId: number
    it('Should be able to create a ' + name, async function () {
      const resolvedData = resolveData(data)
      object = new ObjectClass(resolvedData)
      await object.save()

      expect(object.id, 'Id not null').to.be.not.null
      objectId = object.id

      if (optimisticLocking) {
        expect(object.version, 'Opimistic Locking').to.be.equal(0)
      } else if (object.version !== undefined) {
        throw new Error(name + ' seems to have a version column, but dont use the optimisticLocking option.')
      }

      object = await ObjectClass.findByPk(objectId)
      expect(object, 'Not null').to.be.not.null
      expect(object, 'Include initial datas').to.deep.include(resolvedData)
      if (optimisticLocking) {
        expect(object?.version, 'Opimistic Locking').to.be.equal(0)
      }
    })

    if (expectedObjectId) {
      it('The created object should have the id ' + expectedObjectId, function () {
        expect(object?.id).to.be.equal(expectedObjectId)
      })
    }

    if (mandatoryFields) {
      for (let i = 0; i < mandatoryFields.length; i++) {
        const field = mandatoryFields[i]
        it(`Should not create a ${name} with missing mandatory field "${field}"`, async function () {
          const resolvedData = resolveData(data)
          const project = new ObjectClass(omit(resolvedData, field))
          await expect(project.save()).to.be.rejectedWith(new RegExp(`\\.${field} cannot be null`))
        })
      }
    }

    it('Should be able to delete a ' + name, async function () {
      let object = await ObjectClass.findByPk(objectId)
      expect(object, 'Get the object').not.to.be.null
      await object!.destroy()
      object = await ObjectClass.findByPk(objectId)
      expect(object, 'Object should be delete.').to.be.null
    })
  })
}

type UpdateTestValues = {[key: string]: string | number | boolean | null }
type UpdateTestDynamic = { testName: string, testFunc: () => UpdateTestValues | Promise<UpdateTestValues> }
type UpdateTest = UpdateTestValues | UpdateTestDynamic
interface TestArgsUpdate<T extends Model> extends TestArgs<T> {
  data: any | Function,
  updateTests: UpdateTest[]
}

function testModelUpdate<T extends Model> ({
  name,
  data,
  ObjectClass,
  optimisticLocking,
  updateTests
}: TestArgsUpdate<T>) {
  describe(name + ' update', function () {
    let objectId: number
    let version: number | undefined
    before(async () => {
      const resolvedData = resolveData(data)
      const object = new ObjectClass(resolvedData)
      await object.save()
      objectId = object.id
      if (optimisticLocking) {
        version = object.version
      } else if (object.version !== undefined) {
        throw new Error(name + ' seems to have a version column, but dont use the optimisticLocking option.')
      }
    })
    after(async () => {
      const object = await ObjectClass.findByPk(objectId)
      await object?.destroy()
    })

    for (let i = 0; i < updateTests.length; i++) {
      const test = updateTests[i]
      const testName = test.testFunc && typeof test.testFunc === 'function'
        ? test.testName
        : Object.keys(test).join('/')
      it(
        'Should be able to set values for ' +
        testName +
        ' (test #' + (i + 1) + ')',
        async function () {
          let object = await ObjectClass.findByPk(objectId)
          expect(object, 'Get the object').to.be.not.null

          const values: UpdateTestValues = test.testFunc && typeof test.testFunc === 'function'
            ? await test.testFunc()
            : test as UpdateTestValues
          const previousValues: any = {}
          for (const field in values) {
            previousValues[field] = (object as any)[field];
            (object as any)[field] = values[field]
          }
          await object!.save()
          if (optimisticLocking) {
            expect(object!.version, 'Opimistic Locking 1').to.be.equal(++version!)
          }

          object = await ObjectClass.findByPk(objectId)
          expect(object, 'The object contains required changes').to.deep.include(values)
          if (optimisticLocking) {
            expect(object!.version, 'Opimistic Locking 2').to.be.equal(version!)
          }

          for (const field in previousValues) {
            (object as any)[field] = previousValues[field]
          }
          await object!.save()
          if (optimisticLocking) {
            expect(object!.version, 'Opimistic Locking 3').to.be.equal(++version!)
          }
        }
      )
    }

    if (optimisticLocking) {
      const test = updateTests[0]
      const testName = test.testFunc && typeof test.testFunc === 'function'
        ? test.testName
        : Object.keys(test).join('/')
      it(
        'Optimistic Locking must prevent saving a deprecated instance (using test #1: ' + testName + ')',
        async function () {
          const object1 = await ObjectClass.findByPk(objectId)
          expect(object1, 'Get the object').to.be.not.null

          const object2 = await ObjectClass.findByPk(objectId)
          expect(object2, 'Get the object').to.be.not.null

          const values: UpdateTestValues = test.testFunc && typeof test.testFunc === 'function'
            ? await test.testFunc()
            : test as UpdateTestValues

          for (const field in values) {
            (<any>object1!)[field] = values[field];
            (<any>object2!)[field] = values[field]
          }

          await object1!.save()
          await expect(object2?.save(), 'Object 2 should not be saved')
            .to.be.rejectedWith(/Attempting to update a stale model instance/)
        }
      )
    }
  })
}

interface ConstraintTestUnique {
  type: 'unique',
  name: string,
  data1: {[key: string]: any},
  data2: {[key: string]: any}
}
interface ConstraintTestTooShort {
  type: 'too_short',
  field: string,
  minLength: number,
}
interface ConstraintTestTooLong {
  type: 'too_long',
  field: string,
  maxLength: number,
}
interface ConstraintTestForeignKey {
  type: 'foreign_key' | 'nullable_foreign_key',
  field: string
}
interface ConstraintTestDateOnly {
  type: 'dateonly',
  field: string
}
interface ConstraintTestInteger {
  type: 'integer' | 'unsigned_integer',
  field: string
}
interface ConstraintTestBoolean {
  type: 'boolean',
  field: string
}
type ConstraintTest = ConstraintTestUnique
  | ConstraintTestTooShort
  | ConstraintTestTooLong
  | ConstraintTestForeignKey
  | ConstraintTestDateOnly
  | ConstraintTestInteger
  | ConstraintTestBoolean
interface TestArgsConstraint<T extends Model> extends TestArgs<T> {
  constraintTests: ConstraintTest[],
  data: any | Function
}

function testModelConstraint<T extends Model> ({
  name,
  ObjectClass,
  constraintTests,
  data
}: TestArgsConstraint<T>): void {
  describe(name + ' constraints', function () {
    for (let i = 0; i < constraintTests.length; i++) {
      const test = constraintTests[i]
      if (test.type === 'unique') {
        describe('Key ' + test.name + ' is unique', function () {
          it('Should be unique', async function () {
            const resolvedData = resolveData(data)
            const object1 = new ObjectClass(Object.assign({}, test.data1))
            await object1.save()
            expect(object1.id, 'Object 1 should be ok').to.be.not.null
            const object2 = new ObjectClass(Object.assign({}, resolvedData, test.data2))
            await expect(object2.save(), 'Object 2 should not be ok').to.be.rejectedWith()
          })
        })
      } else if (test.type === 'too_short') {
        describe('Field ' + test.field + ' should correctly handle the min length limit', function () {
          if (test.minLength > 0) {
            it('Should not be shorter than ' + test.minLength, async function () {
              const resolvedData = resolveData(data)
              const changes: any = {}
              changes[test.field] = 'x'.repeat(test.minLength - 1)
              const object = new ObjectClass(Object.assign({}, resolvedData, changes))
              await expect(object.save()).to.be.rejectedWith()
            })
          }

          it('Should be able to have a length of ' + test.minLength, async function () {
            const resolvedData = resolveData(data)
            const changes: any = {}
            const s = 'x'.repeat(test.minLength)
            changes[test.field] = s
            let object: T | null = new ObjectClass(Object.assign({}, resolvedData, changes))
            await object.save()
            expect(object.id, 'Saving a short value is ok').to.not.be.null

            object = await ObjectClass.findByPk(object.id)
            expect(object && (object as any)[test.field], 'The value is correct').to.be.equal(s)
          })
        })
      } else if (test.type === 'too_long') {
        describe('Field ' + test.field + ' should correctly handle the max length limit', function () {
          it('Should not be longer than ' + test.maxLength, async function () {
            const resolvedData = resolveData(data)
            const changes: any = {}
            changes[test.field] = 'x'.repeat(test.maxLength + 1)
            const object = new ObjectClass(Object.assign({}, resolvedData, changes))
            await expect(object.save()).to.be.rejectedWith()
          })

          it(
            'Should be able to have a length of ' + test.maxLength + ' and should not be truncated',
            async function () {
              const resolvedData = resolveData(data)
              const changes: any = {}
              const s = 'x'.repeat(test.maxLength)
              changes[test.field] = s
              let object: T | null = new ObjectClass(Object.assign({}, resolvedData, changes))
              await object.save()
              expect(object?.id, 'Saving a long value is ok').to.not.be.null

              object = await ObjectClass.findByPk(object.id)
              expect(object && (object as any)[test.field], 'This value is correct, and not truncated').to.be.equal(s)
            }
          )
        })
      } else if (test.type === 'foreign_key' || test.type === 'nullable_foreign_key') {
        describe('Field ' + test.field + ' is a ' + test.type, function () {
          it('Should not accept unknown values', async function () {
            const resolvedData = resolveData(data)
            const changes: any = {}
            changes[test.field] = 13241458215 // this is a random id that should not exist in database.
            const object = new ObjectClass(Object.assign({}, resolvedData, changes))
            await expect(object.save()).to.be.rejectedWith()
          })

          if (test.type === 'nullable_foreign_key') {
            it('Should accept null values', async function () {
              const resolvedData = resolveData(data)
              const changes: any = {}
              changes[test.field] = null
              let object: T | null = new ObjectClass(Object.assign({}, resolvedData, changes))

              await object.save()
              expect(object?.id, 'Saving a null value is ok').to.not.be.null

              object = await ObjectClass.findByPk(object?.id)
              expect(object && (object as any)[test.field], 'The null value is correctly saved.').to.be.equal(null)
            })
          // } else {
          //   it('Should not accept null values', async function () {
          //     const resolvedData = resolveData(data)
          //     const changes: any = {}
          //     changes[test.field] = null
          //     const object = new ObjectClass(Object.assign({}, resolvedData, changes))
          //     await expect(object.save()).to.be.rejectedWith()
          //   })
          }

          it('TODO: Test remote object retrieval')
        })
      } else if (test.type === 'dateonly') {
        describe('Field ' + test.field + ' is a dateonly field', function () {
          it('Should not accept something that is not a date', async function () {
            const resolvedData = resolveData(data)
            const changes: any = {}
            changes[test.field] = 'this is not a date'
            const object = new ObjectClass(Object.assign({}, resolvedData, changes))
            await expect(object.save()).to.be.rejectedWith()
          })

          it('Should not accept an invalid date', async function () {
            const changes: any = {}
            changes[test.field] = '2020-02-30'
            const object = new ObjectClass(Object.assign({}, data, changes))
            await expect(object.save()).to.be.rejectedWith()
          })

          it('Should truncate time part', async function () {
            const resolvedData = resolveData(data)
            const changes: any = {}
            changes[test.field] = '2020-01-01 12:30:20'
            let object: T | null = new ObjectClass(Object.assign({}, resolvedData, changes))
            expect(object && (object as any)[test.field], 'The time part should be remove before saving')
              .to.be.equal('2020-01-01')
            await object.save()
            expect(object.id, 'Saving the object').to.not.be.null
            object = await ObjectClass.findByPk(object.id)
            expect(object, 'Get the object').to.not.be.null
            expect(object && (object as any)[test.field], 'The time part should be removed after saving')
              .to.be.equal('2020-01-01')

            await object?.destroy()
          })
        })
      } else if (test.type === 'integer' || test.type === 'unsigned_integer') {
        describe('Field ' + test.field + ' is a ' + test.type + ' field', function () {
          it('Should not accept something that is not a number', async function () {
            const resolvedData = resolveData(data)
            const changes: any = {}
            changes[test.field] = 'this is not an integer'
            const object = new ObjectClass(Object.assign({}, resolvedData, changes))
            await expect(object.save()).to.be.rejectedWith()
          })

          it('Should not accept a number that is not an integer', async function () {
            const resolvedData = resolveData(data)
            const changes: any = {}
            changes[test.field] = 13.12
            const object = new ObjectClass(Object.assign({}, resolvedData, changes))
            await expect(object.save()).to.be.rejectedWith()
          })

          if (test.type === 'unsigned_integer') {
            it('Should not accept a negative number', async function () {
              const resolvedData = resolveData(data)
              const changes: any = {}
              changes[test.field] = -1
              const object = new ObjectClass(Object.assign({}, resolvedData, changes))
              await expect(object.save()).to.be.rejectedWith()
            })
          }
        })
      } else if (test.type === 'boolean') {
        describe('Field ' + test.field + ' is a boolean field', function () {
          it('Should not accept something that is not a boolean', async function () {
            const resolvedData = resolveData(data)
            const changes: any = {}
            changes[test.field] = 'this is not a boolean'
            const object = new ObjectClass(Object.assign({}, resolvedData, changes))
            await expect(object.save()).to.be.rejectedWith()
          })
        })
      } else {
        throw new Error('Not implemented yet')
      }
    }
  })
}

export {
  testModelCreationAndDeletion,
  testModelUpdate,
  testModelConstraint
}
