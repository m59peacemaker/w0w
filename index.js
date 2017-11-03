const identity = v => v
const notUndefined = v => v !== undefined
const isTrue = v => v === true

let capturedDependencies
let capturingDependencies = false

const captureDependencies = () => {
  capturedDependencies = new Set()
  capturingDependencies = true
  return () => {
    capturingDependencies = false
    return capturedDependencies
  }
}

const registerAsDependant = (dependencies, node) =>
  dependencies.forEach(dependency => dependency.dependants.add(node))

const notifyDependants = node => node.dependants.forEach(dependant => dependant(true))

const Node = (
  getInitialValue,
  getNextValue,
  checkShouldUpdate,
  updateDepErrMsg
) => {
  const node = value => {
    const shouldUpdate = checkShouldUpdate(value)
    if (capturingDependencies) {
      if (shouldUpdate) {
        throw new Error(updateDepErrMsg)
      }
      capturedDependencies.add(node)
    }

    if (shouldUpdate) {
      node.value = getNextValue(value)
      notifyDependants(node)
    }

    return node.value
  }

  return Object.assign(node, {
    value: getInitialValue(),
    dependants: new Set()
  })
}

const state = initialValue => Node(
  () => initialValue,
  identity,
  notUndefined,
  'attempted to set the value of a stateNode within a compute function'
)

const computed = computeFn => {
  const doneCapturing = captureDependencies()

  const computedNode = Node(
    computeFn,
    computeFn,
    isTrue,
    'attempted to force a computedNode to recompute from within a compute function'
  )

  const dependencies = doneCapturing()

  registerAsDependant(dependencies, computedNode)

  return computedNode
}

export { state, computed }
