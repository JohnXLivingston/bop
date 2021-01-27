import type { ProjectObject, TaskObject } from 'shared/objects'
import type { NodeRenderVars } from 'shared/templates/planning/types'
import { PlanningNodeObject } from './node-object'

export abstract class PlanningNodeObjectTask extends PlanningNodeObject {
  renderVars (): NodeRenderVars {
    const commonVars = super.renderVars()
    const task = this.tree.object(this.key) as TaskObject
    if (!task) {
      throw new Error('Can\'t find the task ' + this.key)
    }
    const project = this.tree.object('project/' + task.projectId) as ProjectObject
    if (!project) {
      throw new Error(`Can't find the project ${task.projectId} for the task ${task.id}.`)
    }
    const vars: NodeRenderVars = {
      ...commonVars
    }
    vars.node.calendarContent = {
      items: [{
        color: project.color,
        left: 100,
        width: 400,
        label: 'Test',
        type: 'taskpart',
        stubs: [
          {
            on: true
          }
        ]
      }] // TODO
    }
    return vars
  }
}