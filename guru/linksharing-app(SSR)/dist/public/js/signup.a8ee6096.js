function e(e,r,t,n){Object.defineProperty(e,r,{get:t,set:n,enumerable:!0,configurable:!0})}var r=globalThis,t={},n={},o=r.parcelRequire94c2;null==o&&((o=function(e){if(e in t)return t[e].exports;if(e in n){var r=n[e];delete n[e];var o={id:e,exports:{}};return t[e]=o,r.call(o.exports,o,o.exports),o.exports}var a=Error("Cannot find module '"+e+"'");throw a.code="MODULE_NOT_FOUND",a}).register=function(e,r){n[e]=r},r.parcelRequire94c2=o);var a=o.register;a("dRo73",function(r,t){e(r.exports,"register",()=>n,e=>n=e),e(r.exports,"resolve",()=>o,e=>o=e);var n,o,a=new Map;n=function(e,r){for(var t=0;t<r.length-1;t+=2)a.set(r[t],{baseUrl:e,path:r[t+1]})},o=function(e){var r=a.get(e);if(null==r)throw Error("Could not resolve bundle with id "+e);return new URL(r.path,r.baseUrl).toString()}}),a("llGnS",function(e,r){var t=o("2ozqO");e.exports=t("hKb2S").then(()=>o("jpMxA"))}),a("2ozqO",function(e,r){e.exports=function(e){return import(o("dRo73").resolve(e))}}),o("dRo73").register(new URL("",import.meta.url).toString(),JSON.parse('["adEpy","signup.a8ee6096.js","hKb2S","helpers.809bcb76.js"]'));const i=document.querySelector(".signup-btn");i?.addEventListener("click",async()=>{let e=document.querySelector("#signup_email"),r=document.querySelector("#signup_password");if(e&&r)try{i.querySelector(".clock-spinner")?.removeAttribute("data-visible");let t=await fetch("https://linksharing-appssr.vercel.app/api/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e.value,password:r.value})});if(201===t.status)await t.json(),e.value=r.value="",window.location.replace("/");else{let e=await t.json();i.querySelector(".clock-spinner")?.setAttribute("data-visible","false"),(await o("llGnS")).showPopUpMessage(e.message)}}catch(e){i.querySelector(".clock-spinner")?.setAttribute("data-visible","false"),(await o("llGnS")).showPopUpMessage("Internal server error")}});