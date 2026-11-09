async function setProfile() {
    try {
        const response = await fetch("/me");

        if (!response.ok) {
            return;
        }

        const user = await response.json();

        let name = user.name || "";
        let email = user.email || "";

        name = String(name).trim();
        email = String(email).trim();


        let initials = "--";

        if (name !== "") {
            const words = name.split(/\s+/);

            const firstLetter = words[0][0].toUpperCase();

            if (words.length > 1) {
                const secondLetter = words[1][0].toUpperCase();
                initials = firstLetter + secondLetter;
            } else {
                initials = firstLetter;
            }
        }


        const nameElements = document.querySelectorAll(
            ".profile-copy strong, #sideName, #accountName"
        );

        for (let i = 0; i < nameElements.length; i++) {
            nameElements[i].textContent = name;
        }


        const emailElements = document.querySelectorAll(
            ".profile-copy small, #sideRole, #accountEmail"
        );

        for (let i = 0; i < emailElements.length; i++) {
            emailElements[i].textContent = email;
        }


        const avatarElements = document.querySelectorAll(
            ".profile .avatar, .top-avatar"
        );

        for (let i = 0; i < avatarElements.length; i++) {
            avatarElements[i].textContent = initials;
        }


        const welcome = document.getElementById("userName");

        if (welcome) {
            const words = name.split(/\s+/);
            welcome.textContent = words[0];
        }

    } catch (error) {
        console.error("Could not load logged-in profile:", error);
    }
}


setProfile();
