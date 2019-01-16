import { Component, OnInit} from '@angular/core';
import { TodoServiceProvider } from '../service/todo-service/todo-service.service';
import {TodoItem, TodoList} from "../domain/todo";
import { Params, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-display-list-items',
  templateUrl: './display-list-items.page.html',
  styleUrls: ['./display-list-items.page.scss'],
})
export class DisplayListItemsPage implements OnInit {

  list: TodoList;
  uuid: string;

  constructor(private todoServiceProvider: TodoServiceProvider, private route : ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe((params : Params) => {
      this.uuid = params['id'];
    });
    this.todoServiceProvider.getUniqueList(this.uuid).subscribe(res => { this.list = res});
  }

}
