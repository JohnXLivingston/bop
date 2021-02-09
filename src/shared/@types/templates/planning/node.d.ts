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
    calendarContent?: NodeCalendarContent
    color?: BopColor
    object: BopObject
  }
}

declare interface SummaryNodeCalendarContentItem {
  color?: BopColor
  left: number
  width: number
  label?: string
  type: 'summary'
}
declare interface TaskNodeCalendarContentItem {
  color?: BopColor
  left: number
  width: number
  label?: string
  type: 'taskpart'
  previousEnd?: number
  nextStart?: number
  stubs?: Array<{
    on: boolean
    left: number
    width?: number
  }>
}

declare interface NodeCalendarContent {
  items: Array<SummaryNodeCalendarContentItem | TaskNodeCalendarContentItem>
}
