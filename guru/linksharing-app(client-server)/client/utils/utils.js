// @ts-check

/**
 * Shows a popup at the bottom of the screen.
 * @param {string} msg
 * @param {string} type "error" by default or "msg"
 */
export function showPopUpMessage(msg, type = "error") {
    const popUp = document.querySelector(".pop-up-message");
    if (!popUp) {
	const color = type === "error" ? "var(--clr-primary-red)" : "var(--clr-primary-purple-pri)";
	const bg    = type === "error" ? "#FF3939" : "#633CFF";
	const popUpDiv = document.createElement("div");
	popUpDiv.className = "pop-up-message";
	const style = `position: absolute;
		       background-color: var(--clr-neutral-000);
		       border-radius: 0.35rem;
		       border: 1px solid ${color};
		       color: ${color};
		       pointer-events: none;
		       opacity: 0;
		       bottom: 5%;
                       width: 300px;
		       left: 50%;
		       transform: translateX(-50%);`;
	popUpDiv.setAttribute("style", style);
	popUpDiv.innerHTML = `<div class="row
					  no-wrap
					  gap-sm
					  main-axis-center
					  cross-axis-center
					  pad-v-sm
					  pad-h-m">
                                <div style="width:20px;">
				  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
				    <g fill="none" fill-rule="evenodd">
                                      <circle cx="10" cy="10" r="10" fill="${bg}"/>
				      <g fill="#FFF" transform="translate(9 5)">
					<rect width="2" height="7" rx="1"/>
					<rect width="2" height="2" y="8" rx="1"/>
				      </g>
				    </g>
				  </svg>
                                </div>
				<p class="fs-d-300-400 text-center">${msg}</p>
			      </div>`;
	document.body.setAttribute("style", "position: relative;");
	document.body.appendChild(popUpDiv);
	const animation = popUpDiv.animate(
	    [
		{opacity: 1,   bottom: "10%", offset: 0.01},
		{opacity: 1,   bottom: "10%", offset: 0.9},
		{opacity: 0.5, bottom: "5%",  offset: 1},
	    ],
	    {duration: 3000, easing: "ease-in"}
	);
	animation.addEventListener("finish", () => {
	    document.body.removeChild(popUpDiv);
	    document.body.removeAttribute("style");
	});
    }
}

/**
 * Returns bg-color and path of icon according to the `source` name.
 * @param {string} source
 */
export function getLinkAttributeBySourceName(source) {
    let attr = {'path': '',
		'bgcolor': 'bg-p-purple'};

    if (source === 'GitHub') {
	attr.path  = '../images/icons/icon-github.svg';
	attr.bgcolor = 'bg-github';
    }
    if (source === 'LinkedIn') {
	attr.path  = '../images/icons/icon-linkedin.svg';
	attr.bgcolor = 'bg-linkedin';
    }
    if (source === 'GitLab') {
	attr.path  = '../images/icons/icon-gitlab.svg';
	attr.bgcolor = 'bg-gitlab';
    }
    if (source === 'StackOverflow') {
	attr.path  = '../images/icons/icon-stack-overflow.svg';
	attr.bgcolor = 'bg-stackoverflow';
    }
    if (source === 'YouTube') {
	attr.path  = '../images/icons/icon-youtube.svg';
	attr.bgcolor = 'bg-youtube';
    }
    if (source === 'Facebook') {
	attr.path  = '../images/icons/icon-facebook.svg';
	attr.bgcolor = 'bg-facebook';
    }
    if (source === 'Twitch') {
	attr.path  = '../images/icons/icon-twitch.svg';
	attr.bgcolor = 'bg-twitch';
    }
    if (source === 'Twitter') {
	attr.path  = '../images/icons/icon-twitter.svg';
	attr.bgcolor = 'bg-twitter';
    }
    if (source === 'Hashnode') {
	attr.path  = '../images/icons/icon-hashnode.svg';
	attr.bgcolor = 'bg-hashnode';
    }
    if (source === 'Codepen') {
	attr.path  = '../images/icons/icon-codepen.svg';
	attr.bgcolor = 'bg-codepen';
    }
    if (source === 'Devto') {
	attr.path  = '../images/icons/icon-devto-gray.svg';
	attr.bgcolor = 'bg-devto';
    }
    if (source === 'Codewars') {
	attr.path  = '../images/icons/icon-codewars.svg';
	attr.bgcolor = 'bg-codewars';
    }
    if (source === 'Freecodecamp') {
	attr.path  = '../images/icons/icon-freecodecamp.svg';
	attr.bgcolor = 'bg-freecodecamp';
    }
    if (source === 'Frontend mentor') {
	attr.path  = '../images/icons/icon-frontend-mentor-gray.svg';
	attr.bgcolor = 'bg-frontendmentor';
    }

    return attr;
}
