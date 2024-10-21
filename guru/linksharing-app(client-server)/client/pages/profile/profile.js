// @ts-check

import { getLinkAttributeBySourceName, showPopUpMessage } from "../../utils/utils.js";

/**
 * @typedef { import("../../../src/types/typedefs.js").User } User
 * @typedef { import("../../../src/types/typedefs.js").Link } Link
 */

/** @type {string} */
const url = (window.location.hostname === "localhost") ?
      "http://localhost:3000" :
      "https://frontendmentor-io-solutions.vercel.app";

// ************************** 1. Events *********************************//

window.addEventListener('load', async () => {
    try {
	const response = await fetch(
	    `${url}/api/user/${window.location.pathname.split("/")[1]}`,
	);
	if (response.status === 200) {
	    const user = await response.json();
	    console.log(`User data: ${JSON.stringify(user, null, 2)}`);
	    if (user) populateUI(user); else location.replace("/404");
	}
	if (response.status === 400) location.replace("/404");
	if (response.status === 500) showPopUpMessage("Internal server error");
    } catch (error) {
	showPopUpMessage("Internal server error");
    }
});

// ************************* 2. Functions *******************************//

/**
 * @param {User} data
 */
function populateUI(data) {
    const previewCard  = document.querySelector('.preview-card');
    if (previewCard) {
	const avatar    = previewCard.querySelector('img');
	const cardName  = previewCard.querySelectorAll('p')[0];
	const cardEmail = previewCard.querySelectorAll('p')[1];
	const cardLinks = previewCard.querySelector('ul');
	if (avatar && cardName && cardEmail && cardLinks) {
	    if (data.avatar) {
		avatar.src = data.avatar;
		avatar.setAttribute('style', 'object-fit: cover;');
	    } else {
		avatar.setAttribute('style', 'object-fit: scale-down;');
	    }
	    cardName.textContent  = data.name;
	    cardEmail.textContent = data.email ? data.email : '***********';
	    cardLinks.innerHTML   = createListOfPreviewLinks(data.links);
	}
    }
}

/**
 * Generates a html text of links.
 * @param {Link[]} links
 */
function createListOfPreviewLinks(links) {
    let list = '';
    links.forEach((item) => {
	let path    = getLinkAttributeBySourceName(item.source).path;
	let bgColor = getLinkAttributeBySourceName(item.source).bgcolor;
	const li = `<li>
                      <a
                        style="--image_path: url(${path});"
                        target="_blank"
                        class=${bgColor}
                        href=${item.url}>
                          ${item.source}
                      </a>
                    </li>`;
	list = list + li;
    });
    return list;
}

