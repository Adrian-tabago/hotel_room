        const loginSection = document.getElementById("loginSection");
        const signupSection = document.getElementById("signupSection");
        const loginForm = document.getElementById("loginForm");
        const signupForm = document.getElementById("signupForm");

        document.getElementById("showSignup").addEventListener("click", () => {
            loginSection.hidden = true;
            signupSection.hidden = false;
        });

        document.getElementById("showLogin").addEventListener("click", () => {
            loginSection.hidden = false;
            signupSection.hidden = true;
        });

        signupForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            try {
       
                const signupName = document.getElementById("signupName").value.trim();

                const signupEmail = document.getElementById("signupEmail").value.trim();
                const signupPassword = document.getElementById("signupPassword").value;
                const confirmPassword = document.getElementById("confirmPassword").value;
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!signupName || !emailPattern.test(signupEmail) || signupPassword.length < 8 || signupPassword !== confirmPassword) {
                    alert("Invalid input");
                    return;
                }

                const response = await fetch("/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        
                        name: signupName,
                        email: signupEmail,
                        password: signupPassword
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    alert(data.message || "Registration failed");
                    return;
                }

                alert("Account created successfully!");
                signupForm.reset();
                loginSection.hidden = false;
                signupSection.hidden = true;
            } catch (error) {
                console.error("Error:", error);
                alert("Something went wrong. Please try again.");
            }
        });

        document.querySelectorAll(".toggle-password").forEach(button => {
            button.addEventListener("click", () => {
                const pass = document.getElementById(button.dataset.target);

                if (pass.type === "password") {
                    pass.type = "text";
                    button.textContent = "Hide";
                } else {
                    pass.type = "password";
                    button.textContent = "Show";
                }
            });
        });

        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await getdata();
        });

        async function getdata() {
            try {
                const email = document.getElementById("loginEmail").value.trim();
                const pass = document.getElementById("loginPassword").value;

                const response = await fetch("/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: email,
                        password: pass
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    window.location.href = "rooms.html";
                } else {
                    alert("Failed: " + data.message);
                }
            } catch (error) {
                console.error(error);
                alert("Unable to connect to the server");
            }
        }
    
