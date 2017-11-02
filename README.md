# w0w

> State management that is so dumb, it makes me say "w0w" with a zero because "wow" is already taken on npm.

`w0w` is inspired by [`PureState`](https://github.com/MaiaVictor/PureState), which claims to be "the stupidest state management library that works". `PureState` is awesomely stupid and works, but it is not immediately obvious how some edge cases will behave and its `state` function does too much for dummies like me. `w0w` has two extra-stupidest functions, `state` and `computed`, instead of the one `state` function that does both.

## install

```sh
$ npm install w0w
```

## example

```js
import { state, computed } from 'w0w' // with a zero

const awesomeness = state(10)
awesomeness() // => 10

const wowReally = computed(() => awesomeness() * 100)
wowReally() // => 1000

const wowSeriously = computed(() => wowReally() + 999)
wowSeriously() // => 1999

awesomeness(5000)
awesomeness() // => 5000
wowReally() // => 500000
wowSeriously() // => 500999
```

## api

### `state(initialValue)`

```js
const stateNode = state(10)
```

Creates and returns a `stateNode`

#### `stateNode(newValue), stateNode()`

If passed a value that isn't `undefined`, the `stateNode` will be updated with that value and `computedNodes` that depend on it will recompute.

If not passed a value or passed `undefined`, `stateNode` just returns its current value.

### `computed(computeFn)`

```js
const stateNode = state(10)
const computedNode = (() => stateNode + 5)
computedNode() // => 15
stateNode(-5)
computedNode() // => 0
```

Takes a function that gets values from `stateNodes` or other `computedNodes` and returns a new `computedNode` that will be updated whenever the nodes it invokes are updated.

#### `computedNode()`, `computedNode(true)`

`computedNode()` returns the computed value that was calculated by the `computeFn` passed to `computed`. The computed value will always be up-to-date with the nodes used in `computeFn`.

`computedNode(true)` forces `computeFn` to be called, even though no dependencies will have changed since it was last called. Maybe you have some strange side-effecty situation where this is helpful. I just needed this for the sake of triggering computations internally in the library.
