/// <reference path="bop/shared/objects" />

declare interface PlanningProperties {
  cellWidth: number
  nbWeeks: number
}

declare interface NodeRenderVarsPartial {
  planningProperties: PlanningProperties
}
declare interface NodeRenderVars extends NodeRenderVarsPartial {
  node: {
    type: 'summary' | 'object'
    calendarContent?: NodeContent.Calendar
    color?: BopColor
    object: BopObject
  }
}
