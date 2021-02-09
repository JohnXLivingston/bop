import type { ProjectObject, TaskObject } from 'bop/shared/objects'
import { PlanningNodeObject } from './node-object'

export abstract class PlanningNodeObjectTask extends PlanningNodeObject {
  renderVars (): NodeRenderVars {
    const commonVars = super.renderVars()
    const task = this.tree.object(this.key) as TaskObject
    if (!task) {
      throw new Error('Can\'t find the task ' + this.key)
    }
    const project = this.tree.object('project/' + task.projectId.toString()) as ProjectObject
    if (!project) {
      throw new Error(`Can't find the project ${task.projectId} for the task ${task.id}.`)
    }
    const vars: NodeRenderVars = {
      ...commonVars
    }
    vars.node.calendarContent = {
      items: [{
        color: project.color,
        left: this.tree.dateLayout.computeAttributes(task.start, task.end).left,
        width: this.tree.dateLayout.computeAttributes(task.start, task.end).width,
        label: 'Test',
        type: 'taskpart',
        stubs: [
          {
            on: true,
            left: 100,
            width: 200
          },
          {
            on: false,
            left: 200,
            width: 100
          },
          {
            on: true,
            left: 300,
            width: 100
          }
        ]
      }] // TODO
    }
    return vars
  }
}
