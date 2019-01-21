export interface TodoList {
  uuid? : string,
  name : string,
  nbNotFinished: number,
  items : TodoItem[]
}

export interface TodoItem {
  uuid? : string,
  name : string,
  desc? : string,
  complete : boolean
}