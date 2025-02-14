// @ts-check

/**
 * Shows a popup at the bottom of the screen.
 * @param {string} msg
 * @param {string} type "error" by default or "msg"
 * @param {boolean} hide by default "true" (hides popup message)
 */
export function showPopUpMessage(msg, type = "error", hide = true) {
  const popUp = document.querySelector(".pop-up-message");
  if (!popUp) {
    const color = type === "error" ? "var(--clr-primary-red)" : "var(--clr-primary-purple-pri)";
    const bg    = type === "error" ? "#FF3939" : "#633CFF";
    const popUpDiv = document.createElement("div");
    popUpDiv.className = "pop-up-message";
    const style = `position: absolute; background-color: var(--clr-neutral-000); border-radius: 0.35rem; border: 1px solid ${color}; color: ${color}; pointer-events: none; opacity: 0; bottom: 5%; width: 300px; left: 50%; transform: translateX(-50%);`;
    popUpDiv.setAttribute("style", style);
    popUpDiv.innerHTML = `<div class="row no-wrap gap-sm main-axis-center cross-axis-center pad-v-sm pad-h-m"> <div style="width:20px;"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"> <g fill="none" fill-rule="evenodd"> <circle cx="10" cy="10" r="10" fill="${bg}"/> <g fill="#FFF" transform="translate(9 5)"> <rect width="2" height="7" rx="1"/> <rect width="2" height="2" y="8" rx="1"/> </g> </g> </svg> </div> <p class="fs-d-300-400 text-center">${msg}</p> </div>`;
    document.body.setAttribute("style", "position: relative;");
    document.body.appendChild(popUpDiv);
    const animation = popUpDiv.animate(
      [
	{opacity: 1,   bottom: "10%", offset: hide ? 0.01 : 0.005},
	{opacity: 1,   bottom: "10%", offset: 0.9},
	{opacity: 0.5, bottom: "5%",  offset: 1},
      ],
      {duration: hide ? 3000 : 6000, easing: "ease-in"}
    );
    animation.addEventListener("finish", () => {
      document.body.removeChild(popUpDiv);
      document.body.removeAttribute("style");
    });      
  }  
}

/**
 * Returns some params
 * (title, bg-color, gray & white icons and left-padding of input text)
 * according to the hostname or title.
 * @param {string} search
 */
export function getParams(search) {
  if (search === "github.com" || search === "GitHub") return {
    title: "GitHub",
    host: "https://github.com/",
    whiteIcon: "icon-github.svg",
    grayIcon: "icon-github-gray.svg",
    bgColor: "bg-github",
    offset: "10.8rem"
  }
  if (search === "linkedin.com" || search === "LinkedIn") return {
    title: "LinkedIn",
    host: "https://linkedin.com/",
    whiteIcon: "icon-linkedin.svg",
    grayIcon: "icon-linkedin-gray.svg",
    bgColor: "bg-linkedin",
    offset: "11.5rem",
  }
  if (search === "gitlab.com" || search === "GitLab") return {
    title: "GitLab",
    host: "https://gitlab.com/",
    whiteIcon: "icon-gitlab.svg",
    grayIcon: "icon-gitlab-gray.svg",
    bgColor: "bg-gitlab",
    offset: "10.4rem",
  }
  if (search === "stackoverflow.com" || search === "StackOverflow") return {
    title: "StackOverflow",
    host: "https://stackoverflow.com/",
    whiteIcon: "icon-stack-overflow.svg",
    grayIcon: "icon-stack-overflow-gray.svg",
    bgColor: "bg-stackoverflow",
    offset: "14.2rem",
  }
  if (search === "youtube.com" || search === "YouTube") return {
    title: "YouTube",
    host: "https://youtube.com/",
    whiteIcon: "icon-youtube.svg",
    grayIcon: "icon-youtube-gray.svg",
    bgColor: "bg-youtube",
    offset: "11.6rem",
  }
  if (search === "facebook.com" || search === "Facebook") return {
    title: "Facebook",
    host: "https://facebook.com/",
    whiteIcon: "icon-facebook.svg",
    grayIcon: "icon-facebook-gray.svg",
    bgColor: "bg-facebook",
    offset: "12.2rem",
  }
  if (search === "twitch.tv" || search === "Twitch") return {
    title: "Twitch",
    host: "https://twitch.tv/",
    whiteIcon: "icon-twitch.svg",
    grayIcon: "icon-twitch-gray.svg",
    bgColor: "bg-twitch",
    offset: "9.55rem",
  }
  if (search === "x.com" || search === "Twitter") return {
    title: "Twitter",
    host: "https://x.com/",
    whiteIcon: "icon-twitter.svg",
    grayIcon: "icon-twitter-gray.svg",
    bgColor: "bg-twitter",
    offset: "8.4rem",
  }
  if (search === "hashnode.com" || search === "Hashnode") return {
    title: "Hashnode",
    host: "https://hashnode.com/",
    whiteIcon: "icon-hashnode.svg",
    grayIcon: "icon-hashnode-gray.svg",
    bgColor: "bg-hashnode",
    offset: "12.45rem",
  }
  if (search === "codepen.io" || search === "Codepen") return {
    title: "Codepen",
    host: "https://codepen.io/",
    whiteIcon: "icon-codepen.svg",
    grayIcon: "icon-codepen-gray.svg",
    bgColor: "bg-codepen",
    offset: "10.7rem",
  }
  if (search === "dev.to" || search === "Devto") return {
    title: "Devto",
    host: "https://dev.to/",
    whiteIcon: "icon-devto-gray.svg",
    grayIcon: "icon-devto-gray.svg",
    bgColor: "bg-devto",
    offset: "8.35rem",
  }
  if (search === "codewars.com" || search === "Codewars") return {
    title: "Codewars",
    host: "https://codewars.com/",
    whiteIcon: "icon-codewars.svg",
    grayIcon: "icon-codewars-gray.svg",
    bgColor: "bg-codewars",
    offset: "12.25rem",
  }
  if (search === "freecodecamp.org" || search === "Freecodecamp") return {
    title: "Freecodecamp",
    host: "https://freecodecamp.org/",
    whiteIcon: "icon-freecodecamp.svg",
    grayIcon: "icon-freecodecamp-gray.svg",
    bgColor: "bg-freecodecamp",
    offset: "14.15rem",
  }
  if (search === "frontendmentor.io" || search === "FrontendMentor") return {
    title: "FrontendMentor",
    host: "https://frontendmentor.io/",
    whiteIcon: "icon-frontend-mentor.svg",
    grayIcon: "icon-frontend-mentor-gray.svg",
    bgColor: "bg-frontendmentor",
    offset: "14.1rem",
  }
  return {
    title: "Unknown",
    host: "",
    whiteIcon: "",
    grayIcon: "",
    bgColor: "",
    offset: "0rem"
  }
}
