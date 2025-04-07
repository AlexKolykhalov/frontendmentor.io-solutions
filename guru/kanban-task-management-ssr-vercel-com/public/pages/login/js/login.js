const btn = document.querySelectorAll("button");
if (!btn) throw new Error("Can't find <button>");

btn[0].addEventListener("click", async () => {
  try {
    const response = await fetch("/api/auth/signin");
    if (response.status === 200) window.location.replace("/");
    console.log("Authentication error");
  } catch (error) {
    console.log("Internet connection error");
  }
});

// btn[1].addEventListener("click", async () => {
//   try {
//     const response = await fetch("/api/auth/signin", {
//       method: "POST",
//       headers: {"Content-Type": "application/json"},
//       body: JSON.stringify({ email: "ak@rambler.com", password: "123123" })
//     });
//     if (response.status === 200) window.location.replace("/");
//     if (response.status === 400) alert("Invalid login credentials");
//   } catch (error) {
//     console.log("Internet connection error", error);
//   }
// });

// btn[2].addEventListener("click", async () => {
//   try {
//     const response = await fetch("/api/auth/signup", {
//       method: "POST",
//       headers: {"Content-Type": "application/json"},
//       body: JSON.stringify({ email: "ak@rambler.com", password: "123123" })
//     });
//     if (response.status === 201) window.location.replace("/");
//     if (response.status === 401) alert("Unauthorized");
//   } catch (error) {
//     console.log("Internet connection error", error);
//   }
// });
