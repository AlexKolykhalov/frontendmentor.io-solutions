let e;function t(e,t,r,n){Object.defineProperty(e,t,{get:r,set:n,enumerable:!0,configurable:!0})}var r=globalThis,n={},i={},o=r.parcelRequire94c2;null==o&&((o=function(e){if(e in n)return n[e].exports;if(e in i){var t=i[e];delete i[e];var r={id:e,exports:{}};return n[e]=r,t.call(r.exports,r,r.exports),r.exports}var o=Error("Cannot find module '"+e+"'");throw o.code="MODULE_NOT_FOUND",o}).register=function(e,t){i[e]=t},r.parcelRequire94c2=o);var a=o.register;a("dRo73",function(e,r){t(e.exports,"register",()=>n,e=>n=e),t(e.exports,"resolve",()=>i,e=>i=e);var n,i,o=new Map;n=function(e,t){for(var r=0;r<t.length-1;r+=2)o.set(t[r],{baseUrl:e,path:t[r+1]})},i=function(e){var t=o.get(e);if(null==t)throw Error("Could not resolve bundle with id "+e);return new URL(t.path,t.baseUrl).toString()}}),a("llGnS",function(e,t){var r=o("2ozqO");e.exports=r("hKb2S").then(()=>o("jpMxA"))}),a("2ozqO",function(e,t){e.exports=function(e){return import(o("dRo73").resolve(e))}}),a("hQ5Cv",function(e,t){var r=o("2ozqO");e.exports=r("3liKg").then(()=>o("1Z6MJ"))}),o("dRo73").register(new URL("",import.meta.url).toString(),JSON.parse('["5aJ9p","index.8bda4e62.js","hKb2S","helpers.809bcb76.js","3liKg","ejs.min.5eac9c0c.js"]'));const l="https://linksharing-appssr.vercel.app";let s={userId:"",avatar:"",name:"",email:"",links:[]},u={userId:"",avatar:"",name:"",email:"",links:[]};window.addEventListener("load",async()=>{s=function(){let e=document.querySelector("#userId"),t=document.querySelector(".upload-image-btn"),r=document.querySelector("#first_name"),n=document.querySelector("#last_name"),i=document.querySelector("#email");if(!e)throw Error("Can't find #userId");if(!t)throw Error("Can't find .upload-image-btn");if(!r)throw Error("Can't find #firstName");if(!n)throw Error("Can't find #lastName");if(!i)throw Error("Can't find #email");if(!r.value.trim())throw Error("First name is required");if(!n.value.trim())throw Error("Last name is required");let o={userId:e.textContent??"",avatar:"",name:"",email:"",links:[]},a="",l="",s="",u=[],d=t.style.backgroundImage.match(/url\(["']?([^"']*)["']?\)/);return d&&(a=d[1]),l=r.value.trim()+" "+n.value.trim(),s=i.value.trim(),document.querySelectorAll(".user-links > li").forEach(e=>{let t=e.querySelector(".select > button span"),r=e.querySelector("input");if(t&&t.textContent&&r){if(!e.getAttribute("id"))throw Error("Link without ID");let n={linkId:e.getAttribute("id")??"",source:t.textContent,url:r.value.trim()};u.push(n)}}),o.avatar=a,o.name=l,o.email=s,o.links=u,o}(),u.userId=s.userId,u.avatar=s.avatar,u.name=s.name,u.email=s.email}),document.querySelectorAll(".user-links>li").forEach(e=>y(e));const d=document.querySelector(".save-btn");if(!d)throw Error("Can't find .save-btn");d.addEventListener("click",async()=>{let e=d.querySelector(".clock-spinner"),t=document.querySelector(".preview-link");if(!e)throw Error("Can'f find .clock-spinner");if(!t)throw Error("Can't find .preview-link");try{e.removeAttribute("data-visible");let r=("; "+document.cookie).split("; _t1=").pop()?.split(";").shift(),n=await fetch(`${l}/api/user/update`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${r}`},body:JSON.stringify(u)});if(200===n.status&&(s=await n.json(),e.setAttribute("data-visible","false"),o("llGnS").then(e=>e.showPopUpMessage("Your changes have been successfully saved!","msg")),d.setAttribute("disabled",""),t.removeAttribute("style")),400===n.status){let t=await n.json();e.setAttribute("data-visible","false"),o("llGnS").then(e=>e.showPopUpMessage(t.message))}if(401===n.status){let r=await fetch(`${l}/api/refresh`);if(200===r.status){let r=("; "+document.cookie).split("; _t1=").pop()?.split(";").shift(),n=await fetch(`${l}/api/user/update`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${r}`},body:JSON.stringify(u)});if(200===n.status&&(s=await n.json(),e.setAttribute("data-visible","false"),o("llGnS").then(e=>e.showPopUpMessage("Your changes have been successfully saved!","msg")),d.setAttribute("disabled",""),t.removeAttribute("style")),400===n.status){let t=await n.json();e.setAttribute("data-visible","false"),o("llGnS").then(e=>e.showPopUpMessage(t.message))}500===n.status&&(e.setAttribute("data-visible","false"),o("llGnS").then(e=>e.showPopUpMessage("Internal server error")))}401===r.status&&window.location.replace("/login")}500===n.status&&(e.setAttribute("data-visible","false"),o("llGnS").then(e=>e.showPopUpMessage("Internal server error")))}catch(t){e.setAttribute("data-visible","false"),o("llGnS").then(e=>e.showPopUpMessage(t.message))}});const c=document.querySelector(".logout-btn");if(!c)throw Error("Can't find .logout-btn");c.addEventListener("click",async()=>{let e=c.querySelector(".clock-spinner");if(!e)throw Error("Can'f find .clock-spinner");try{e.removeAttribute("data-visible");let t=await fetch(`${l}/api/logout`);200===t.status&&window.location.replace("/login"),500===t.status&&(e.setAttribute("data-visible","false"),o("llGnS").then(e=>e.showPopUpMessage("Internal server error")))}catch(t){e.setAttribute("data-visible","false"),o("llGnS").then(e=>e.showPopUpMessage(t.message))}});const f=document.querySelector(".add-new-link-btn");if(!f)throw Error("Can't find .add-new-link-btn");f.addEventListener("click",()=>{let e={linkId:crypto.randomUUID(),source:"GitHub",url:""};v(e),function(e){let t=document.querySelector(".phone-mockup");if(!t)throw Error("Can'f find .phone-mockup");o("llGnS").then(r=>{let{whiteIcon:n,bgColor:i}=r.getLinkInfoByName(e.source),o=document.createElement("div");o.classList.add("phone-mockup-badge",i,"row","cross-axis-center","clr-n-000","border-radius-sm"),o.setAttribute("style",`--image_path: url(/public/images/icons/${n});`),o.textContent=e.source,t.appendChild(o)})}(e),u.links.push(e),C()});const m=document.querySelector(".upload-image-btn");if(!m)throw Error("Can't find .upload-image-btn");m.addEventListener("click",()=>{let e=document.createElement("input");e.type="file",e.accept=".png, .jpg, .bmp",e.onchange=e=>{let t=e.target?.files[0],r=new FileReader;r.readAsDataURL(t),r.onload=e=>{let n=e.target?.result,i=new Image;i.src=n,i.onload=e=>{if(i.width>1024&&i.height>1024||"image/jpeg"!==t.type&&"image/png"!==t.type&&"image/bmp"!==t.type){r.abort();let e=document.querySelector(".warnings");if(e){let r=e.querySelectorAll("span")[0],n=e.querySelectorAll("span")[1];r&&n&&(i.width>1024&&i.height>1024&&(r.classList.add("clr-p-red"),r.classList.add("fw-semibold"),n.classList.remove("clr-p-red"),n.classList.remove("fw-semibold")),"image/jpeg"!==t.type&&"image/png"!==t.type&&"image/bmp"!==t.type&&(n.classList.add("clr-p-red"),n.classList.add("fw-semibold"),r.classList.remove("clr-p-red"),r.classList.remove("fw-semibold")))}}else{let e=document.querySelector(".warnings");e&&e.querySelectorAll("span").forEach(e=>{e.classList.remove("clr-p-red"),e.classList.remove("fw-semibold")}),m.style.backgroundImage="linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url("+n+")";let t=m.querySelector("span > span");if(!t)throw Error("Can't find .upload-image-btn > span > span");t.textContent="Change Image";let r=document.querySelector(".clear-image-btn");if(!r)throw Error("Can't find .clear-image-btn");r.removeAttribute("data-visible");let i=document.querySelector(".phone-mockup-avatar");if(!i)throw Error("Can't find .phone-mockup-avatar");i.src=n,i.setAttribute("style","object-fit: cover;"),u.avatar=n,C()}}}},e.click()});const p=document.querySelector(".clear-image-btn");if(!p)throw Error("Can't find .clear-image-btn");p.addEventListener("click",()=>{p.setAttribute("data-visible","false");let e=document.querySelector(".phone-mockup-avatar"),t=document.querySelector(".upload-image-btn");if(!e)throw Error("Can't find .phone-mockup-avatar");if(!t)throw Error("Can't find .upload-image-btn");t.removeAttribute("style");let r=t.querySelector("span > span");r&&(r.textContent="+ Upload Image"),e.src="/public/images/icons/icon-upload-image.svg",e.setAttribute("style","object-fit: scale-down;");let n=document.querySelector(".warnings");if(!n)throw Error("Can't find .warnings");n.querySelectorAll("span").forEach(e=>{e.classList.remove("clr-p-red"),e.classList.remove("fw-semibold")}),u.avatar="",C()});const h=document.querySelector(".preview-link");if(!h)throw Error("Can't find .preview-link");h.addEventListener("click",e=>{h.hasAttribute("style")&&(e.preventDefault(),e.stopPropagation())});const b=document.querySelector("#first_name");if(!b)throw Error("Can't find #first_name");b.addEventListener("input",()=>{let e=document.querySelector(".phone-mockup-name");if(!e)throw Error("Can't find .phone-mockup-name");let t=""===b.value.trim()?"****":b.value.trim();e.textContent=`${t} ${e.textContent?.split(" ")[1]}`,u.name=`${b.value} ${u.name.split(" ")[1]}`,C()});const g=document.querySelector("#last_name");if(!g)throw Error("Can't find #last_name");g.addEventListener("input",()=>{let e=document.querySelector(".phone-mockup-name");if(!e)throw Error("Can't find .phone-mockup-name");let t=""===g.value.trim()?"****":g.value.trim();e.textContent=`${e.textContent?.split(" ")[0]} ${t}`,u.name=`${u.name.split(" ")[0]} ${g.value}`,C()});const w=document.querySelector("#email");if(!w)throw Error("Can't find #email");async function v(t){let r=document.querySelector(".add-new-link-btn"),n=document.querySelector(".user-links");if(!r)throw Error("Can'f find .add-new-link-btn");if(!n)throw Error("Can'f find .user-links");let{domain:i,whiteIcon:a,grayIcon:l,bgColor:s,offset:u}=(await o("llGnS")).getLinkInfoByName(t.source),d={id:t.linkId,domain:i,whiteIcon:a,grayIcon:l,bgColor:s,offset:u,url:t.url,source:t.source},c=document.createElement("template");if(!e){let t=await fetch("/public/templates/link.ejs"),r=await t.text();e=(await o("hQ5Cv")).compile(r)}c.innerHTML=e({index:n.children.length+1,link:d});let f=c.content.firstChild;n.appendChild(f),y(f),n.children.length>4&&r.setAttribute("disabled","")}function y(e){let t=e.querySelector(".row>button"),r=e.querySelector(".select>button"),n=e.querySelector(".select>.options"),i=e.querySelectorAll(".select>.options>li"),o=e.querySelector("input");if(!t)throw Error("Can't find .row>button");if(!r)throw Error("Can't find .select>button");if(!n)throw Error("Can't find .select>.options");if(!o)throw Error("Can't find input");t.addEventListener("click",S),r.addEventListener("mousedown",()=>{E(n),r.focus()}),r.addEventListener("keydown",e=>{if(("Home"===e.key||"PageUp"===e.key)&&q(n,"start"),("End"===e.key||"PageDown"===e.key)&&q(n,"end"),"ArrowUp"===e.key&&q(n,"backward"),"ArrowDown"===e.key&&q(n,"forward"),("Enter"===e.key||" "===e.key&&"false"===r.getAttribute("aria-expanded")||"Escape"===e.key&&"true"===r.getAttribute("aria-expanded"))&&E(n),!1===["Tab","F5","Shift","Control"].includes(e.key))return e.preventDefault(),!1}),r.addEventListener("blur",()=>{"true"===r.getAttribute("aria-expanded")&&(E(n),r.focus())}),i.forEach(e=>{e.addEventListener("mousedown",e=>{e.currentTarget&&k(e.currentTarget)})}),o.addEventListener("input",()=>{let t=e.getAttribute("id");if(!t)throw Error("<li> id is empty");A({linkId:t,source:r.textContent?.trim(),url:o.value})})}function k(e){let t=e.closest(".select")?.querySelector("button[id]"),r=e.parentElement?.querySelector('[data-status="selected"]');if(!t)throw Error("Can't find button[id]");if(!r)throw Error("Can't find li[data-status='selected']");let n=t.querySelector("img"),i=t.querySelector("span"),a=e.querySelector("img"),l=e.querySelector("span")?.textContent;if(!n)throw Error("Can't find button[id]>img");if(!i)throw Error("Can't find button[id]>span");if(!a)throw Error("Can't find li>img");if(!l)throw Error("Can't find li>span or textContent is null");n.src=a.src,i.textContent=l,r.removeAttribute("data-status"),e.setAttribute("data-status","selected"),o("llGnS").then(t=>{let{domain:r,whiteIcon:n,bgColor:i,offset:o}=t.getLinkInfoByName(l),a=e.closest("li[id]")?.querySelector("input[id]");if(!a)throw Error("Can't find input[id]");a.setAttribute("style",`--pad-left: ${o};`),a.parentElement?.setAttribute("style",`--domain: "${r}";`);let s=Number(a.getAttribute("id")?.split("_")[1])??0,u=document.querySelectorAll(".phone-mockup-badge")[s-1];if(!u)throw Error(`Can't find badge[${s-1}]`);u.classList.remove(...u.classList),u.classList.add("phone-mockup-badge",i,"row","cross-axis-center","clr-n-000","border-radius-sm"),u.setAttribute("style",`--image_path: url(/public/images/icons/${n});`),u.textContent=l;let d=e.closest("li[id]")?.getAttribute("id");if(!d)throw Error("<li> ID is empty");A({linkId:d,source:l,url:a.value})})}function E(e){let t=e.parentElement?.querySelector("button");if(!t)throw Error("Can't find .select>button");if("true"===t.getAttribute("aria-expanded"))e.setAttribute("data-visible","false"),e.setAttribute("data-position","under"),t.setAttribute("aria-expanded","false"),x.unobserve(e),L.unobserve(t);else{e.removeAttribute("data-visible"),t.setAttribute("aria-expanded","true");let r=e.querySelector('li[data-status="selected"]');if(r){let t=[...e.children].indexOf(r);e.scrollTo({top:40*(t-2),behavior:"smooth"})}x.observe(e),L.observe(t)}}function S(){let e=document.querySelector(".add-new-link-btn"),t=document.querySelector(".user-links"),r=document.querySelector(".phone-mockup"),n=this.closest("li[id]"),i=this.closest("li[id]")?.getAttribute("id");if(!e)throw Error("Can't find .add-new-link-btn");if(!t)throw Error("Can't find .user-links");if(!r)throw Error("Can't find .phone-mockup");if(!n)throw Error("Can't find <li [id]>");if(!i)throw Error("<li> id is empty");r.removeChild(r.children[[...t.children].indexOf(n)+4]),t.removeChild(n);let o=1;[...t.children].forEach(e=>{e.querySelectorAll("h5, label, button[id], ul, input").forEach(e=>{"H5"===e.tagName&&(e.textContent=`Link #${o}`),"LABEL"===e.tagName&&e.setAttribute("for",`input_${o}`),"BUTTON"===e.tagName&&(e.setAttribute("id",`select_${o}`),e.setAttribute("aria-controls",`options_${o}`)),"UL"===e.tagName&&e.setAttribute("id",`options_${o}`),"INPUT"===e.tagName&&e.setAttribute("id",`input_${o}`)}),o++}),e.hasAttribute("disabled")&&e.removeAttribute("disabled");let a=s.links.filter(e=>e.linkId===i);if(0===a.length&&A({linkId:i}),1===a.length&&A({linkId:i,source:"",url:""}),a.length>1)throw Error("Two or more links with same ID")}function A({linkId:e,source:t,url:r}){if(void 0===t&&void 0===r&&(u.links=u.links.filter(t=>t.linkId!==e)),""===t&&""===r&&u.links.push({linkId:e,source:t,url:r}),t&&(r||""===r)){let n=u.links.find(t=>t.linkId===e);if(n){n.source=t,n.url=r;let i=s.links.filter(t=>t.linkId===e);if(i.length>1)throw Error("More than one link found in dbUserData");1===i.length&&i[0].source===n.source&&i[0].url===n.url&&(u.links=u.links.filter(t=>t.linkId!==e))}else u.links.push({linkId:e,source:t,url:r})}C()}function C(){let e=document.querySelector(".save-btn"),t=document.querySelector(".preview-link");if(!e)throw Error("Can't find .save-btn");if(!t)throw Error("Can't find .preview-link");s.avatar!==u.avatar||s.name!==u.name||s.email!==u.email||u.links.length>0?(e.removeAttribute("disabled"),t.setAttribute("style","cursor: default; opacity: 0.5; box-shadow: none;")):(e.setAttribute("disabled",""),t.removeAttribute("style"))}function q(e,t){let r=e.querySelector('li[data-status="selected"]');if(!r)throw Error("Can't find li[data-status='selected']");let n=e.children,i=[...n].indexOf(r),o=0;"forward"===t&&(o=i+1>n.length-1?n.length-1:i+1),"backward"===t&&(o=i-1<0?0:i-1),"end"===t&&(o=n.length-1),i!==o&&(e.scrollTo({top:40*(o-2),behavior:"smooth"}),k(n[o]))}w.addEventListener("input",()=>{let e=document.querySelector(".phone-mockup-email");if(!e)throw Error("Can't find .phone-mockup-email");let t=""===w.value.trim()?"***********":w.value.trim();e.textContent=t,u.email=w.value,C()}),document.querySelectorAll(".control-btns > button").forEach(e=>{e.addEventListener("click",()=>{if(!1===e.hasAttribute("data-status")){let t=document.querySelector(".control-btns > button[data-status]");if(t){t.removeAttribute("data-status"),e.setAttribute("data-status","active");let r=document.querySelector("section > section:not([hidden])"),n=document.querySelector("section > section[hidden]");r&&n&&(r.setAttribute("hidden",""),n.removeAttribute("hidden"))}}})});const I={root:document.querySelector(".user-links"),rootMargin:"0px",threshold:1},L=new IntersectionObserver(e=>{e.forEach(e=>{if(!1===e.isIntersecting){let t=e.target.nextElementSibling;t&&!1===t.hasAttribute("data-visible")&&E(t)}})},I),x=new IntersectionObserver(e=>{e.forEach(e=>{!1===e.isIntersecting&&("above"===e.target.getAttribute("data-position")?e.target.setAttribute("data-position","under"):"under"===e.target.getAttribute("data-position")&&e.target.setAttribute("data-position","above"))})},I);