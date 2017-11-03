import test from 'tape'
import { state, computed } from './'

test('stateNode returns initialValue if no argument given', t => {
  const n = state(0)
  t.equal(n(), 0)
  t.end()
})

test('stateNode accepts a new value as an argument and returns that value, and just returns current value if no argument given', t => {
  const n = state(0)
  t.equal(n(), 0)
  t.equal(n(14), 14)
  t.equal(n(), 14)
  t.equal(n(14), 14)
  t.equal(n(), 14)
  t.equal(n(30), 30)
  t.equal(n(), 30)
  t.equal(n(null), null)
  t.equal(n(), null)
  t.end()
})

test('computedNode() returns the computed value', t => {
  const n = state(15)
  const n2 = computed(() => n() * 2)
  t.equal(n2(), 30)
  t.end()
})

test('computedNode() returns the updated computed value', t => {
  const n = state(15)
  const n2 = computed(() => n() * 2)
  t.equal(n2(), 30)
  n(90)
  t.equal(n2(), 180)
  t.end()
})

test('computedNode can be computed from another computedNode', t => {
  const n = state(15)
  const n2 = computed(() => n() * 2)
  const n2Minus10 = computed(() => n2() - 10)
  t.equal(n(), 15)
  t.equal(n2(), 30)
  t.equal(n2Minus10(), 20)
  t.equal(n2Minus10(), 20)
  t.end()
})

test('computedNode can be computed from computedNodes and stateNodes', t => {
  const x = state('x')
  const y = state('y')
  const z = state('z')
  const xy = computed(() => x() + y())
  const xyz = computed(() => xy() + z())
  t.equal(xyz(), 'xyz')
  x('ex')
  t.equal(xyz(), 'exyz')
  x('X')
  t.equal(xyz(), 'Xyz')
  t.end()
})

test('computedNode(someValue) does not change the computed value', t => {
  const nope = state(false)
  const stillNope = computed(() => nope())
  t.equal(stillNope(), false)
  stillNope(true)
  t.equal(stillNope(), false)
  t.end()
})

test('computedNode(true) causes triggers recompute', t => {
  const x = state(0)
  let timesComputed = 0
  const y = computed(() => {
    ++timesComputed
    return x() + timesComputed
  })
  t.equal(x(), 0)
  t.equal(y(), 1)
  t.equal(timesComputed, 1)
  y(true)
  t.equal(x(), 0)
  t.equal(y(), 2)
  t.equal(timesComputed, 2)
  x(10)
  y(true)
  t.equal(y(), 14)
  t.end()
})

test('can access stateNode repeatedly in computeFn', t => {
  const y = state('y')
  let timesComputed = 0
  const yy = computed(() => {
    ++timesComputed
    return y() + y()
  })
  t.equal(yy(), 'yy')
  y('Y')
  t.equal(yy(), 'YY')
  t.equal(timesComputed, 2)
  t.end()
})

test('computed value with branching/ternary, computed value is stale after updating y() if y() is in a branch not executed on first computation', t => {
  const x = state(1)
  const y = state(2)
  const n = computed(() => x() === 1 ? 100 : y())
  t.equal(n(), 100)
  x(0)
  t.equal(n(), 2)
  y(3)
  t.equal(n(), 2)
  t.end()
})

test('accessing values used in branches in default parameters solves the branching staleness issue', t => {
  const x = state(1)
  const y = state(2)
  const n = computed((xv = x(), yv = y()) => xv === 1 ? 100 : yv)
  t.equal(n(), 100)
  x(0)
  t.equal(n(), 2)
  y(3)
  t.equal(n(), 3)
  t.end()
})

test('computeFn passes a new value to a stateNode and does not become a dependency of it, causing an infinite loop', t => {
  const x = state(0)
  const computedNode = computed(() => {
    t.equal(t.assertCount, 0, 'computeFn should only have run once, otherwise computeFn must have become a dependency of the stateNode it sets')
    return x(5) + 1
  })
  x(20)
  x(97)
  x(26)
  t.equal(computedNode(), 6)
  t.end()
})

test('example', t => {
  t.plan(3)
  const results = [ 999, 1099, 10999 ]
  const awesomeness = state(0)
  const wowReally = computed(() => awesomeness() * 100)
  const wowSeriously = computed(() => wowReally() + 999)
  computed(() => {
    t.equal(wowSeriously(), results[t.assertCount])
    return Math.random()
  })

  awesomeness(1)
  awesomeness(100)
})
