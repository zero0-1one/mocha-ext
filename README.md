# mocha-ext
Extend mocha function. "its": run cases multiple times; "its_seq", "its_par" : run sync cases multiple times sequentially or parallel

# Installation
```sh
  npm install  zo-mocha-ext --save
```

# Usage
```js
  its(10, 'iteration', function () {
    //this code will be run 10 times
  })
  
  //This test case will run for 10 seconds
  its_seq(10, 'iteration', async function () {
    await sleep(1000)
  })

  //This test case will run for 1 seconds
  its_par(10, 'iteration', async function () {
    await sleep(1000)
  })
```

# Example
```js
const assert = require('assert')
const {its,its_seq,its_par} = require('zo-mocha-ext')

async function sleep(t) {
  return new Promise(resolve => {
    setTimeout(resolve, t)
  })
}

describe('its', function () {
  let iter = 0
  its(10, 'iteration', function () {
    assert(iter++ == this.iteration)
  })

  it('Check last case run times', function () {
    assert(iter == 10)
    iter = 0
  })
})


describe('its_seq', function () {
  let iter = 0
  let startTime;
  its_seq(10, 'iteration', function () {
    assert(iter++ == this.iteration)
  })

  it('Check last case run times', function () {
    assert(iter == 10)
    iter = 0
  })

  its_seq(10, 'async function', async function () {
    this.slow(5000);
    this.beforeAll(() => {
      startTime = new Date().valueOf()
    })
    await sleep(100)
    assert(iter++ == this.iteration)
  })
  it('Check last case runtime', function () {
    assert(iter == 10)
    assert(new Date().valueOf() - startTime >= 10 * 100)
    assert(new Date().valueOf() - startTime < 2 * 10 * 100)
    iter = 0
  })

  its_seq(10, 'beforeAll and afterAll', function () {
    this.beforeAll(() => {
      iter++
    })
    assert(iter > 0)
    this.beforeAll(() => {
      assert(iter == 10)
    })
  })

  its_seq(10, 'async beforeAll and afterAll', async function () {
    this.slow(5000);
    await this.beforeAll(async () => {
      iter++
      await sleep(100)
    })
    assert(iter > 0)
    await sleep(100)
    await this.beforeAll(async () => {
      assert(iter == 10)
      await sleep(100)
    })
  })
})



describe('its_par', function () {
  let iter = 0
  let startTime;
  its_par(10, 'iteration', function () {
    assert(iter++ == this.iteration)
  })

  it('Check last case run times', function () {
    assert(iter == 10)
    iter = 0
  })

  its_par(10, 'async function', async function () {
    this.slow(5000);
    this.beforeAll(() => {
      startTime = new Date().valueOf()
    })
    await sleep(100)
    assert(iter++ == this.iteration)
  })
  it('Check last case runtime', function () {
    assert(iter == 10)
    assert(new Date().valueOf() - startTime < 300)
    iter = 0
  })

  its_par(10, 'beforeAll and afterAll', function () {
    this.beforeAll(() => {
      iter++
    })
    assert(iter > 0)
    this.beforeAll(() => {
      assert(iter == 10)
    })
  })

  its_par(10, 'async beforeAll and afterAll', async function () {
    this.slow(5000);
    await this.beforeAll(async () => {
      iter++
      await sleep(100)
    })
    assert(iter > 0)
    await sleep(100)
    await this.beforeAll(async () => {
      assert(iter == 10)
      await sleep(100)
    })
  })
})
```