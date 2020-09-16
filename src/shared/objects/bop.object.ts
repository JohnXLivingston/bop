import { ProjectObject } from './project/project.object'
import { ResourceObject } from './resource/resource.object'
import { TaskObject } from './task/task.object'
import { UserObject } from './user/user.object'

export type BopObject = UserObject | ProjectObject | ResourceObject | TaskObject
