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

const registerAsDependant = (dependencies, dependantNode) =>
  dependencies.forEach(node => (node.dependants = node.dependants || new Set()).add(dependantNode))

const notifyDependants = node =>
  node.dependants && node.dependants.forEach(dependant => dependant(true))

const Node = (
  getInitialValue,
  getNextValue,
  checkShouldUpdate
) => {
  const node = value => {
    const shouldUpdate = checkShouldUpdate(value)

    if (shouldUpdate) {
      node.value = getNextValue(value)
      notifyDependants(node)
    } else if (capturingDependencies) {
      capturedDependencies.add(node)
    }

    return node.value
  }

  node.value = getInitialValue()

  return node
}

const state = initialValue => Node(
  () => initialValue,
  identity,
  notUndefined
)

const computed = computeFn => {
  const doneCapturing = captureDependencies()

  const computedNode = Node(
    computeFn,
    computeFn,
    isTrue
  )

  const dependencies = doneCapturing()

  registerAsDependant(dependencies, computedNode)

  return computedNode
}

export { state, computed }
