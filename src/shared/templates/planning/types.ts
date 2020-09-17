import { BopObject } from '../../objects'

type NodeColor = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' |
  'unallocated' | 'partially' | 'full' | 'overloaded' | 'off'

interface PlanningProperties {
  nbWeeks: number
}

interface NodeRenderVarsPartial {
  planningProperties: PlanningProperties
}
interface NodeRenderVars extends NodeRenderVarsPartial {
  node: {
    type: 'summary' | 'object',
    color?: NodeColor,
    object: BopObject
  }
}

export {
  // eslint-disable-next-line no-undef
  PlanningProperties,
  // eslint-disable-next-line no-undef
  NodeColor,
  // eslint-disable-next-line no-undef
  NodeRenderVars,
  // eslint-disable-next-line no-undef
  NodeRenderVarsPartial
}
