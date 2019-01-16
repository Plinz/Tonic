import { Component, OnInit } from '@angular/core';
import { TodoServiceProvider } from '../service/todo-service/todo-service.service';
import {TodoItem, TodoList} from "../domain/todo";

@Component({
  selector: 'app-list-display',
  templateUrl: './list-display.page.html',
  styleUrls: ['./list-display.page.scss'],
})
export class ListDisplayPage implements OnInit {

  list: TodoList[];

  constructor(private todoServiceProvider: TodoServiceProvider) {}

  ngOnInit() {
    this.todoServiceProvider.getList().subscribe(res => { this.list = res});
  }

  nbNotCompleted(uuid:String) : number{
    const listItems = this.list.find(d => d.uuid == uuid).items;
    let nb = 0;
    for (let item of listItems) {
      if (!item.complete){
        nb++;
      }
    }
    return nb;
  }

}
