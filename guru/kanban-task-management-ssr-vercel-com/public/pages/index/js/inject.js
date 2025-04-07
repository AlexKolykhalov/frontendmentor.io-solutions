// @ts-check

import { BoardsList }     from "../components/boards_list.js";
import { BoardsListItem } from "../components/boards_list_item.js";
import { Board }          from "../components/board.js";
import { Column }         from "../components/column.js";
import { Task }           from "../components/task.js";

/**
 * Injects an events into child elements.
 * @param {Element} component
 */
export function injectEvents(component) {
  component.querySelectorAll(`#${BoardsList.prefix}`).forEach(item => {
    console.log(`inject board list`);
    BoardsList.handleEvents(item);
  });

  component.querySelectorAll(`[id^="${BoardsListItem.prefix}-"]`).forEach(item => {
    console.log(`inject board list item`);
    BoardsListItem.handleEvents(item);
  });

  component.querySelectorAll(`[id^="${Board.prefix}-"]`).forEach(item => {
    console.log(`inject board`);
    Board.handleEvents(item);
  });

  component.querySelectorAll(`[id^="${Column.prefix}-"]`).forEach(item => {
    console.log(`inject column`);
    Column.handleEvents(item);
  });

  component.querySelectorAll(`[id^="${Task.prefix}-"]`).forEach(item => {
    console.log(`inject task`);
    Task.handleEvents(item);
  });
}

