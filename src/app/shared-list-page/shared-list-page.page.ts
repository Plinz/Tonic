import { Component, OnInit } from '@angular/core';
import { TodoServiceProvider } from '../service/todo-service/todo-service.service';
import { TodoList } from '../domain/todo';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shared-list-page',
  templateUrl: './shared-list-page.page.html',
  styleUrls: ['./shared-list-page.page.scss'],
})
export class SharedListPagePage implements OnInit {

  lists: TodoList[];
  query: '';
  sub: Subscription;

  constructor(private todoService: TodoServiceProvider) { }

  ngOnInit() {
    this.sub = this.todoService.getSharedLists().subscribe((res) => this.lists = res);
  }

  nbNotCompleted(uuid: String): number {
    const listItems = this.lists.find(d => d.uuid === uuid).items;
    let nb = 0;
    for (const item of listItems) {
      if (!item.complete) {
        nb++;
      }
    }
    return nb;
  }

  callback = (obs) => {
    this.sub.unsubscribe();
    this.sub = obs.subscribe((res) => this.lists = [].concat(...res));
  }

  queryByName() {
    this.todoService.algolia_search(this.query, this.callback, 'shared');
  }

}
