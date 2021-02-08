/// <reference path="bop/shared/objects" />

declare interface PlanningProperties {
  nbWeeks: number
}

declare interface NodeRenderVarsPartial {
  planningProperties: PlanningProperties
}
declare interface NodeRenderVars extends NodeRenderVarsPartial {
  node: {
    type: 'summary' | 'object'
    calendarContent?: NodeCalendarContent
    color?: BopColor
    object: BopObject
  }
}

declare interface SummaryNodeCalendarContent {
  items: Array<{
    color?: BopColor
    left: number
    width: number
    label?: string
    type: 'summary'
  }>
}
declare interface TaskNodeCalendarContent {
  items: Array<{
    color?: BopColor
    left: number
    width: number
    label?: string
    type: 'taskpart'
    previousEnd?: number
    nextStart?: number
    stubs?: {
      on: boolean
    }
  }>
}
declare type NodeCalendarContent = TaskNodeCalendarContent | SummaryNodeCalendarContent
