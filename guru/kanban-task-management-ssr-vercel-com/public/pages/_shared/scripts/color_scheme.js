// @ts-check

window.addEventListener("load", () => {
  const colorScheme = localStorage.getItem("color-scheme");
  if (colorScheme) {
    document.body.setAttribute("data-theme", colorScheme);
  } else {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches === true) {
      document.body.setAttribute("data-theme", "dark");
      localStorage.setItem("color-scheme", "dark");
    } else {
      document.body.setAttribute("data-theme", "light");
      localStorage.setItem("color-scheme", "light");
    }
  }  
});

