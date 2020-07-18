export interface Task {
  id: number,
  type: 'task',
  key: string,
  version: number,
  name: string,
  projectId: number,
  start: string,
  end: string,
  work: number
}
