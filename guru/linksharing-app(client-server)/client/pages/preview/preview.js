// @ts-check

import { getLinkAttributeBySourceName, showPopUpMessage } from "../../utils/utils.js";

/**
 * @typedef { import("../../../src/types/typedefs.js").User } User
 * @typedef { import("../../../src/types/typedefs.js").Link } Link
 */

/** @type {HTMLButtonElement|null} */
const shareBtn = document.querySelector(".share-btn");

/** @type {string} */
const url = (window.location.hostname === "localhost") ?
      "http://localhost:3000" :
      "https://frontendmentor-io-solutions.vercel.app";

/** @type {User} */
let user;

// ************************** 1. Events *********************************//

window.addEventListener('load', async () => {
    try {
	const accessToken = localStorage.getItem("_t1");
	if (!accessToken) location.replace("/login");
	const response = await fetch(`${url}/api/user`,
	    {
		method: "GET",
		headers: {"Authorization": `Bearer ${accessToken}`},
	    }
	);
	if (response.status === 200) {
	    user = await response.json();
	    console.log(`User data: ${JSON.stringify(user, null, 2)}`);
	    if (user) populateUI(user); else showPopUpMessage("User has been deleted");
	}
	if (response.status === 401) {
	    const refreshResponse = await fetch(`${url}/api/refresh`);
	    if (refreshResponse.status === 200) {
		const token = await refreshResponse.json();
		localStorage.setItem("_t1", token); // accessToken
		const response = await fetch(`${url}/api/user`,
		    {
			method: "GET",
			headers: {"Authorization": `Bearer ${token}`},
		    }
		);
		if (response.status === 200) {
		    user = await response.json();
		    console.log(`User data after resfresh: ${JSON.stringify(user, null, 2)}`);
		    if (user) populateUI(user); else showPopUpMessage("User has been deleted");
		}
		if (response.status === 500) showPopUpMessage("Internal server error");
	    }
	    if (refreshResponse.status === 401) window.location.replace("/login");
	}
	if (response.status === 500) showPopUpMessage("Internal server error");
    } catch (error) {
	showPopUpMessage("Internal server error");
    }
});

shareBtn?.addEventListener("click", async () => {
    try {
	await navigator.clipboard.writeText(`${url}/${user.userId}`);
	showPopUpMessage("Link copied");
    } catch (error) {
	showPopUpMessage(error.message)
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

