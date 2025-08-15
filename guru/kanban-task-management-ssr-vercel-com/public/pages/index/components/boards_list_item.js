// @ts-check

import { Board }                from "./board.js";
import { MainHeader }           from "./main_header.js";
import { emit, openAuthzDialog,
	 openRedirectDialog }   from "./_helpers.js";


/**
 * @typedef {object} BoardsListItemType
 * @property {string}  id
 * @property {string}  title
 * @property {boolean} [selected] By default "false".
 * @property {boolean} [locked]   By default "false".
 */

export class BoardsListItem {

  static prefix   = "boards_list_item"; // using in edit_board_dialog.js
  static selector = `[id^=${this.prefix}-]`;

  /**
   * @param {BoardsListItemType} props
   * @param { {SSR:boolean} }    render
   *
   * @returns {string} HTML string
   */
  static template(props, render = { SSR: false }) {
    if (!render.SSR && typeof window === 'undefined' && typeof document === 'undefined')
      throw new Error("Render template error: try to add { SSR: true }");

    const attr     = props.locked   ? `data-locked="true"` : "";
    const selected = props.selected ? " selected"   : "";
    const path     = render.SSR     ? `data-path="http://localhost:3000/pages/index/components/boards_list_item.js"` : "";

    return `<li id="${this.prefix}-${props.id}" class="boards-list-item${selected}" ${attr} ${path}>
              <img src="images/svg/${props.locked ? "icon-locked" : "icon-board-grey"}.svg" alt="" width="16" height="16">${props.title}
            </li>`;
  }

  /**
   * @param {BoardsListItemType} props
   *
   * @returns {Element}
   */
  static init(props) {
    return this.#create(props);
  }

  /**
   * @param {BoardsListItemType} props
   *
   * @returns {Element}
   */
  static #create(props) {
    const template     = document.createElement("template");
    template.innerHTML = this.template(props);
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error("Can't render \"BoardsListItem\" component");

    this.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   *
   * @returns {void}
   */
  static handleEvents(component) {
    // @ts-ignore
    const isLocked = component.dataset.locked === "true"; delete component.dataset.locked;

    if (isLocked) component.addEventListener("click", () => openAuthzDialog());
    if (!isLocked) {
      component.addEventListener("click", async function() {

	if (this.classList.contains("selected")) return;

	// add indicator
	const { LoaderRipple } = await import("../../_shared/components/loader-ripple.js");
	const loader = LoaderRipple.init();
	component.appendChild(loader);

	const id      = component.getAttribute("id")?.slice(`${BoardsListItem.prefix}-`.length);
	const url     = `http://localhost:4000/rpc/get_board?p_board_id=${id}`;
	const options = {
	  headers: {
	    "Accept":         "application/vnd.pgrst.object+json",
	    "Accept-Profile": "api",
	    "Authorization":  `Bearer ${ localStorage.getItem("bearer") }`,
	  }
	};
	// [Errors 401, 403, 404] [Success 200]
	let response = await fetch(url, options);

	if (response.status === 401) {
	  // [Errors 400, 401, 500] [Success 201]
	  const resAuthz = await fetch("http://localhost:3000/api/generate_authz_token", { method: "POST" });
	  if (resAuthz.status === 401) {
	    await openRedirectDialog();

	    return;
	  }

	  if (resAuthz.status !== 201) throw new Error("Get generate_authz_token error");

	  localStorage.setItem("bearer", await resAuthz.json());
	  options.headers.Authorization = `Bearer ${ localStorage.getItem("bearer") }`;
	  response = await fetch(url, options);
	};

	// if (response.status === 404) { openAuthzDialog(); loader.remove(); return; }

	if (response.status !== 200) throw new Error("Unexpected response status");

	const receivedBoardData = await response.json();

	// update title of the boards_list_item
	// Anonymous update board on client, not in DB, so refresh it in another click
	component.childNodes[2].nodeValue = receivedBoardData.name;
	
	// @ts-ignore
	emit("board:selected", receivedBoardData, document.querySelector(`#${Board.prefix}`));
	// @ts-ignore
	emit("board:selected", receivedBoardData, document.querySelector(`#${MainHeader.prefix}`));

	this.parentElement.querySelector("li.selected")?.classList.remove("selected");
	this.classList.add("selected");
	loader.remove();
      });
    }
  }
}
