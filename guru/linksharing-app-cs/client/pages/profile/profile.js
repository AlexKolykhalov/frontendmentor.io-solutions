// @ts-check

import { getParams, showPopUpMessage } from "../../utils/utils.js";

/**
 * @typedef { import("../../../server/src/types/typedefs.js").User } User
 * @typedef { import("../../../server/src/types/typedefs.js").Link } Link
 */

// ************************** 1. Events *********************************//

window.addEventListener('load', async () => {
  try {
    const response = await fetch(
      `/api/user/${window.location.pathname.split("/")[1]}`,
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
  let list = "";
  links.forEach((item) => {		
    const params = getParams(new URL(item.url).hostname);
    const li = `<li>
		  <a style="--image_path: url('/client/images/icons/${params?.whiteIcon}');"
		     target="_blank"
		     class=${params?.bgColor}
		     href=${item.url}>
		    ${params?.title}
		  </a>
		</li>`;
    list = list + li;
  });
  return list;
}

