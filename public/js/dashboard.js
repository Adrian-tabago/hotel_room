const toast = document.getElementById("toast");
let toastTimer;
 
function showToast(message) {
    toast.textContent = message;
    toast.style.display = "block";
 
    clearTimeout(toastTimer);
 
    toastTimer = setTimeout(() => {
        toast.style.display = "none";
    }, 2600);
}
 
document.querySelectorAll(".nav a[data-soon]").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        showToast(`${link.dataset.soon} is coming soon.`);
    });
});

document.getElementById("newReservation").addEventListener("click", () => {
    showToast("Connect this button to your reservation form.");
});
 
document.getElementById("viewRooms").addEventListener("click", () => {
    window.location.href = "rooms.html";
});
 
document.getElementById("viewReservations").addEventListener("click", () => {
    showToast("Connect this button to your reservations page.");
});
 
document.getElementById("notifications").addEventListener("click", () => {
    showToast("You're all caught up!");
});
 
document.getElementById("globalSearch").addEventListener("input", event => {
    const query = event.target.value.trim().toLowerCase();
 
    document.querySelectorAll("[data-search]").forEach(item => {
        item.style.display =
            item.dataset.search.includes(query) ? "" : "none";
    });
});
 
document.querySelectorAll(".room").forEach(room => {
    room.addEventListener("click", async() => {
       
        const roomNumber = room.querySelector("strong").textContent;
        const status = room.querySelector("em").textContent;
 
        showToast(`Room ${roomNumber}: ${status}`);
    });
});


async function loadRooms() {
    try {
        const response = await fetch("/rooms");

        if (!response.ok) {
            throw new Error("Failed to load rooms");
        }

        const rooms = await response.json();

        const roomGrid = document.getElementById("roomGrid");

        roomGrid.innerHTML = "";

        rooms.forEach(room => {
           const roomCard = document.createElement("div")
           roomCard.className = `room ${room.status.toLowerCase()}`
           roomCard.dataset.search = `${room.roomNumber} ${room.roomType} ${room.status}`
           roomCard.innerHTML = `
            <strong>${room.roomNumber}</strong>
            <small>${room.roomType}</small>
            <em>${room.status.charAt(0).toUpperCase() + room.status.slice(1)}</em>
        `;
            roomGrid.appendChild(roomCard);
        });
        l;
    } catch (error) {
        console.error("Error loading rooms:", error);
    }
}

loadRooms();




async function loadUser() {
    try {
        const response = await fetch("/me");

        if (!response.ok) {
            console.log("User is not logged in:", response.status);
            return;
        }

        const user = await response.json();

        document.getElementById("userName").textContent = user.name;

        document.querySelector(".profile strong").textContent = user.name;
        document.querySelector(".profile small").textContent = user.email;

    } catch (error) {
        console.error("Error loading user:", error);
    }
}

loadUser();


async function fetchRooms() {
    try {
        const response = await fetch("/rooms");

        if (!response.ok) {
            throw new Error("Failed to fetch rooms");
        }

        const rooms = await response.json();

        const totalRooms = document.getElementById("totalRooms");
        const occupiedRooms = document.getElementById("occupiedRooms");
        const occupancyRate = document.getElementById("occupancyRate");
        const availableRooms = document.getElementById("availableRooms");

        const total = rooms.length;

        const occupied = rooms.filter(room =>
            room.status === "Occupied"
        ).length;

        const available = rooms.filter(room =>
            room.status === "Available"
        ).length;

        const Cleaning = rooms.filter(room =>
            room.status === "Cleaning"
        ).length;

        let rate = total > 0 ? Math.round((occupied / total) * 100) : 0

        occupiedRooms.textContent = occupied
        availableRooms.textContent = available
        occupancyRate.textContent = rate

        const guestResponse = await fetch("/guest");
        const guests = await guestResponse.json();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayCheckInCount = guests.filter(guest => {
            if (!guest.checkIn) return false;

            const checkIn = new Date(guest.checkIn);
            checkIn.setHours(0, 0, 0, 0);

            return checkIn.getTime() === today.getTime();
        }).length;

        document.getElementById("todayCheckIns").textContent = todayCheckInCount;

    } catch (error) {
        console.error("Error fetching rooms:", error);
    }
}

document.addEventListener("DOMContentLoaded", fetchRooms);


/*
async function loadRooms() {

    try{
        const response = await fetch("/rooms");

        if (!response.ok) {
            throw new Error("Failed to fetch rooms");
        }
        const data = await response.json();

         data.forEach(element => {
            setRoomStatus(element.roomNumber, element.status);
        });
    }  catch (error) {
        console.error("Error loading rooms:", error);
    }
}


function setRoomStatus(roomNumber, status) {

    const room = document.querySelector(
        `.room[data-search^="${roomNumber} "]`
    );

    if (!room) {
        console.log("Room not found:", roomNumber);
        return;
    }

    room.classList.remove(
        "available",
        "occupied",
        "reserved",
        "cleaning"
    );

    room.classList.add(status.toLowerCase());

    room.querySelector("em").textContent =
        status.charAt(0).toUpperCase() +
        status.slice(1).toLowerCase();

    room.dataset.search =
        `${roomNumber} ${room.querySelector("small").textContent} ${status}`.toLowerCase();
}


loadRooms()*/
