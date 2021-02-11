
declare namespace NodeContent {
  declare namespace Item {
    declare interface Summary {
      color?: BopColor
      left: number
      width: number
      label?: string
      type: 'summary'
    }

    declare interface TaskSegment {
      color?: BopColor
      left: number
      width: number
      label?: string
      type: 'tasksegment'
      daysOff?: Array<{
        left: number
        width?: number
      }>
    }

    declare interface TaskSplit {
      type: 'tasksplit'
      left: number
      width: number
    }
  }

  declare interface Calendar {
    items: Array<Item.TaskSegment | Item.TaskSplit | Item.Summary>
  }
}
