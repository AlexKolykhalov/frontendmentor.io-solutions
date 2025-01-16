function o(o,e,t,r){Object.defineProperty(o,e,{get:t,set:r,enumerable:!0,configurable:!0})}(0,globalThis.parcelRequire94c2.register)("jpMxA",function(e,t){function r(o,e="error"){if(!document.querySelector(".pop-up-message")){let t="error"===e?"var(--clr-primary-red)":"var(--clr-primary-purple-pri)",r=document.createElement("div");r.className="pop-up-message";let n=`position: absolute;
		       background-color: var(--clr-neutral-000);
		       border-radius: 0.35rem;
		       border: 1px solid ${t};
		       color: ${t};
		       pointer-events: none;
		       opacity: 0;
		       bottom: 5%;
                       width: 300px;
		       left: 50%;
		       transform: translateX(-50%);`;r.setAttribute("style",n),r.innerHTML=`<div class="row
      no-wrap
      gap-sm
      main-axis-center
      cross-axis-center
      pad-v-sm
      pad-h-m">
      <div style="width:20px;">
	<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
	  <g fill="none" fill-rule="evenodd">
            <circle cx="10" cy="10" r="10" fill="${"error"===e?"#FF3939":"#633CFF"}"/>
	    <g fill="#FFF" transform="translate(9 5)">
	      <rect width="2" height="7" rx="1"/>
	      <rect width="2" height="2" y="8" rx="1"/>
	    </g>
	  </g>
	</svg>
      </div>
      <p class="fs-d-300-400 text-center">${o}</p>
    </div>`,document.body.setAttribute("style","position: relative;"),document.body.appendChild(r),r.animate([{opacity:1,bottom:"10%",offset:.01},{opacity:1,bottom:"10%",offset:.9},{opacity:.5,bottom:"5%",offset:1}],{duration:3e3,easing:"ease-in"}).addEventListener("finish",()=>{document.body.removeChild(r),document.body.removeAttribute("style")})}}function n(o){let e={};return"GitHub"===o&&(e.domain="https://github.com/",e.whiteIcon="icon-github.svg",e.grayIcon="icon-github-gray.svg",e.bgColor="bg-github",e.offset="10.8rem"),"LinkedIn"===o&&(e.domain="https://linkedin.com/",e.whiteIcon="icon-linkedin.svg",e.grayIcon="icon-linkedin-gray.svg",e.bgColor="bg-linkedin",e.offset="11.5rem"),"GitLab"===o&&(e.domain="https://gitlab.com/",e.whiteIcon="icon-gitlab.svg",e.grayIcon="icon-gitlab-gray.svg",e.bgColor="bg-gitlab",e.offset="10.4rem"),"StackOverflow"===o&&(e.domain="https://stackoverflow.com/",e.whiteIcon="icon-stack-overflow.svg",e.grayIcon="icon-stack-overflow-gray.svg",e.bgColor="bg-stackoverflow",e.offset="14.2rem"),"YouTube"===o&&(e.domain="https://youtube.com/",e.whiteIcon="icon-youtube.svg",e.grayIcon="icon-youtube-gray.svg",e.bgColor="bg-youtube",e.offset="11.6rem"),"Facebook"===o&&(e.domain="https://facebook.com/",e.whiteIcon="icon-facebook.svg",e.grayIcon="icon-facebook-gray.svg",e.bgColor="bg-facebook",e.offset="12.2rem"),"Twitch"===o&&(e.domain="https://twitch.tv/",e.whiteIcon="icon-twitch.svg",e.grayIcon="icon-twitch-gray.svg",e.bgColor="bg-twitch",e.offset="9.55rem"),"Twitter"===o&&(e.domain="https://x.com/",e.whiteIcon="icon-twitter.svg",e.grayIcon="icon-twitter-gray.svg",e.bgColor="bg-twitter",e.offset="8.4rem"),"Hashnode"===o&&(e.domain="https://hashnode.com/",e.whiteIcon="icon-hashnode.svg",e.grayIcon="icon-hashnode-gray.svg",e.bgColor="bg-hashnode",e.offset="12.45rem"),"Codepen"===o&&(e.domain="https://codepen.io/",e.whiteIcon="icon-codepen.svg",e.grayIcon="icon-codepen-gray.svg",e.bgColor="bg-codepen",e.offset="10.7rem"),"Devto"===o&&(e.domain="https://dev.to/",e.whiteIcon="icon-devto-gray.svg",e.grayIcon="icon-devto-gray.svg",e.bgColor="bg-devto",e.offset="8.35rem"),"Codewars"===o&&(e.domain="https://codewars.com/",e.whiteIcon="icon-codewars.svg",e.grayIcon="icon-codewars-gray.svg",e.bgColor="bg-codewars",e.offset="12.25rem"),"Freecodecamp"===o&&(e.domain="https://freecodecamp.org/",e.whiteIcon="icon-freecodecamp.svg",e.grayIcon="icon-freecodecamp-gray.svg",e.bgColor="bg-freecodecamp",e.offset="14.15rem"),"Frontend mentor"===o&&(e.domain="https://frontendmentor.io/",e.whiteIcon="icon-frontend-mentor.svg",e.grayIcon="icon-frontend-mentor-gray.svg",e.bgColor="bg-frontendmentor",e.offset="14.1rem"),e}o(e.exports,"showPopUpMessage",()=>r),o(e.exports,"getLinkInfoByName",()=>n)});