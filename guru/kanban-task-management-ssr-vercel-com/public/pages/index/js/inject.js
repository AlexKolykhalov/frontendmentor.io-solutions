// @ts-check

import { BoardsList }      from "../components/boards_list.js";
import { BoardsListItem }  from "../components/boards_list_item.js";
import { Board }           from "../components/board.js";
import { Column }          from "../components/column.js";
import { Task }            from "../components/task.js";
import { CheckListItem }   from "../components/check_list_item.js";
import { DynamicListItem } from "../components/dynamic_list_item.js";

/**
 * Injects an events into child elements.
 * @param {Element} component
 */
export function injectEvents(component) {
  component.querySelectorAll(`#${BoardsList.prefix}`).forEach(item => {
    console.log(`injected BoardList`);
    BoardsList.handleEvents(item);
  });

  component.querySelectorAll(`[id^="${BoardsListItem.prefix}-"]`).forEach(item => {
    console.log(`injected BoardsListItem`);
    BoardsListItem.handleEvents(item);
  });

  component.querySelectorAll(`#${Board.prefix}`).forEach(item => {
    console.log(`injected Board`);
    Board.handleEvents(item);
  });

  component.querySelectorAll(`[id^="${Column.prefix}-"]`).forEach(item => {
    console.log(`injected Column`);
    Column.handleEvents(item);
  });

  component.querySelectorAll(`[id^="${Task.prefix}-"]`).forEach(item => {
    console.log(`injected Task`);
    Task.handleEvents(item);
  });

  component.querySelectorAll(`[id^="${CheckListItem.prefix}-"]`).forEach(item => {
    console.log(`injected CheckListItem`);
    CheckListItem.handleEvents(item);
  });

  component.querySelectorAll(`[id^="${DynamicListItem.prefix}-"]`).forEach(item => {
    console.log(`injected DynamicListItem`);
    DynamicListItem.handleEvents(item);
  });
}
