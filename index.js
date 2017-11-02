let capturedDependencies
let capturingDependencies = false

const captureDependencies = fn => {
  capturedDependencies = new Set()
  capturingDependencies = true
  const result = fn()
  capturingDependencies = false
  return { result, dependencies: capturedDependencies }
}

const captureIfCapturing = (stateNode) =>
  capturingDependencies && capturedDependencies.add(stateNode)

const registerAsDependant = (dependencies, node) =>
  dependencies.forEach(dependency => dependency.dependants.add(node))

const notifyDependants = node => node.dependants.forEach(dependant => dependant(true))

const state = initialValue => {
  let currentValue = initialValue

  const stateNode = (newValue) => {
    captureIfCapturing(stateNode)

    if (newValue !== undefined) {
      currentValue = newValue
      notifyDependants(stateNode)
    }

    return currentValue
  }

  stateNode.dependants = new Set()

  return stateNode
}

const computed = computeFn => {
  const { result, dependencies } = captureDependencies(computeFn)
  let currentValue = result

  const computedNode = shouldRecompute => {
    captureIfCapturing(computedNode)
    if (shouldRecompute === true) {
      currentValue = computeFn()
      notifyDependants(computedNode)
    }
    return currentValue
  }

  computedNode.dependants = new Set()

  registerAsDependant(dependencies, computedNode)

  return computedNode
}

export { state, computed }
