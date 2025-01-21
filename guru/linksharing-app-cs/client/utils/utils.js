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
 * Returns domain name, bg-color, path of icon and left-padding of input text
 * according to the `source` name.
 * @param {string} name
 */
export function getLinkInfoByName(name) {
    const info = {
	domain: "",
	iconPath: "",
	bgColor: "bg-p-purple",
	offset: "",
    };

    if (name === "GitHub") {
 	info.domain   = "https://github.com/";
	info.iconPath = "../images/icons/icon-github.svg";
	info.bgColor  = "bg-github";
	info.offset   = "10.8rem";
    }
    if (name === "LinkedIn") {
	info.domain   = "https://linkedin.com/";
	info.iconPath = "../images/icons/icon-linkedin.svg";
	info.bgColor  = "bg-linkedin";
	info.offset   = "11.5rem";
    }
    if (name === "GitLab") {
	info.domain   = "https://gitlab.com/";
	info.iconPath = "../images/icons/icon-gitlab.svg";
	info.bgColor  = "bg-gitlab";
	info.offset   = "10.4rem";
    }
    if (name === "StackOverflow") {
	info.domain   = "https://stackoverflow.com/";
	info.iconPath = "../images/icons/icon-stack-overflow.svg";
	info.bgColor  = "bg-stackoverflow";
	info.offset   = "14.2rem";
    }
    if (name === "YouTube") {
	info.domain   = "https://youtube.com/";
	info.iconPath = "../images/icons/icon-youtube.svg";
	info.bgColor  = "bg-youtube";
	info.offset   = "11.6rem";
    }
    if (name === "Facebook") {
	info.domain   = "https://facebook.com/";
	info.iconPath = "../images/icons/icon-facebook.svg";
	info.bgColor  = "bg-facebook";
	info.offset   = "12.2rem";
    }
    if (name === "Twitch") {
	info.domain   = "https://twitch.tv/";
	info.iconPath = "../images/icons/icon-twitch.svg";
	info.bgColor  = "bg-twitch";
	info.offset   = "9.55rem";
    }
    if (name === "Twitter") {
	info.domain   = "https://x.com/";
	info.iconPath = "../images/icons/icon-twitter.svg";
	info.bgColor  = "bg-twitter";
	info.offset   = "8.4rem";
    }
    if (name === "Hashnode") {
	info.domain   = "https://hashnode.com/";
	info.iconPath = "../images/icons/icon-hashnode.svg";
	info.bgColor  = "bg-hashnode";
	info.offset   = "12.45rem";
    }
    if (name === "Codepen") {
	info.domain   = "https://codepen.io/";
	info.iconPath = "../images/icons/icon-codepen.svg";
	info.bgColor  = "bg-codepen";
	info.offset   = "10.7rem";
    }
    if (name === "Devto") {
	info.domain   = "https://dev.to/";
	info.iconPath = "../images/icons/icon-devto-gray.svg";
	info.bgColor  = "bg-devto";
	info.offset   = "8.35rem";
    }
    if (name === "Codewars") {
	info.domain   = "https://codewars.com/";
	info.iconPath = "../images/icons/icon-codewars.svg";
	info.bgColor  = "bg-codewars";
	info.offset   = "12.25rem";
    }
    if (name === "Freecodecamp") {
	info.domain   = "https://freecodecamp.org/";
	info.iconPath = "../images/icons/icon-freecodecamp.svg";
	info.bgColor  = "bg-freecodecamp";
	info.offset   = "14.15rem";
    }
    if (name === "Frontend mentor") {
	info.domain   = "https://frontendmentor.io/";
	info.iconPath = "../images/icons/icon-frontend-mentor-gray.svg";
	info.bgColor  = "bg-frontendmentor";
	info.offset   = "14.1rem";
    }

    return info;
}
