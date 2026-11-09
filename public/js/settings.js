const darkMode = document.getElementById("darkMode");

darkMode.checked = localStorage.getItem("darkMode") === "true";

darkMode.addEventListener("change", () => {
    if (darkMode.checked) {
        localStorage.setItem("darkMode", "true");
        document.documentElement.classList.add("dark");
    } else {
        localStorage.setItem("darkMode", "false");
        document.documentElement.classList.remove("dark");
    }
});

document.getElementById("feedbackForm").addEventListener("submit", (event) => {
    event.preventDefault();

 // ill put here the email js wag gagalawin to
});
