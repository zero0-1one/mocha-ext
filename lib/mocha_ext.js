'use strict'

const util = require('util')
const getParamNames = require('@captemulation/get-parameter-names')

const _beforeAllFunc = Symbol('before case')
const _afterAllFunc = Symbol('after case')

function WrapThis(thisObj, iter) {
  let thisWrap = Object.create(thisObj)
  Object.assign(thisWrap, {
    iteration: iter,
    async beforeAll(func) {
      if (!thisObj[_beforeAllFunc]) {
        thisObj[_beforeAllFunc] = new Promise(async resolve => {
          await func()
          resolve()
        })
      }
      await thisObj[_beforeAllFunc]
    },

    async afterAll(func) {
      if (!thisObj[_afterAllFunc]) {
        thisObj[_afterAllFunc] = func
      }
    }
  })
  return thisWrap
}

function repeatAsync(times, exp, cb, isSeq) {
  let cbWrap = undefined
  if (isSeq) {
    cbWrap = async function () {
      let thisObj = Object.create(this) //Avoid original 'this' being modified
      for (let i = 0; i < times; i++) {
        await cb.call(WrapThis(thisObj, i))
      }
      if (thisObj[_afterAllFunc]) {
        await thisObj[_afterAllFunc]()
      }
    }
  } else {
    cbWrap = async function () {
      let tasks = []
      let thisObj = Object.create(this) //Avoid original 'this' being modified
      for (let i = 0; i < times; i++) {
        tasks.push(cb.call(WrapThis(thisObj, i)))
      }
      await Promise.all(tasks)
      if (thisObj[_afterAllFunc]) {
        await thisObj[_afterAllFunc]()
      }
    }
  }

  //This is useful for using mocha in the browser, you can click the test case output to view the source code
  cbWrap.toString = cb.toString.bind(cb)
  it(exp, cbWrap)
}

function repeat(times, exp, cb) {
  if (getParamNames(cb).length > 0) {
    throw new TypeError('not support "done" callback, please use the async function')
  }
  let cbWrap = function () {
    for (let i = 0; i < times; i++) {
      this.iteration = i
      cb.call(this)
    }
  }
  cbWrap.toString = cb.toString.bind(cb)
  it(exp, cbWrap)
}

module.exports = {
  //run multiple times
  its(times, exp, cb) {
    if (util.types.isAsyncFunction(cb)) {
      repeatAsync(times, exp, cb, true)
    } else {
      repeat(times, exp, cb)
    }
  },

  //run multiple times in sequence
  its_seq(times, exp, cb) {
    repeatAsync(times, exp, cb, true)
  },

  //run multiple times in parallel
  its_par(times, exp, cb) {
    repeatAsync(times, exp, cb, false)
  }
}