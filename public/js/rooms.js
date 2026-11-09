let roomList = document.getElementById("roomList");
let roomSearch = document.getElementById("globalSearch");
let statusFilter = document.getElementById("statusFilter");
let typeFilter = document.getElementById("typeFilter");
let roomCount = document.getElementById("roomCount");
let roomModal = document.getElementById("roomModal");
let reservationForm = document.getElementById("reservationForm");
let reservationRoom = document.getElementById("reservationRoom");
let guestCount = document.getElementById("guestCount");
let checkIn = document.getElementById("checkIn");
let checkOut = document.getElementById("checkOut");
let toast = document.getElementById("toast");

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

document.getElementById("notifications").addEventListener("click", () => {
    showToast("You're all caught up!");
});

async function display() {
    const response = await fetch("/rooms");
    const data = await response.json();

    const selectedRoom = reservationRoom.value;
    reservationRoom.innerHTML = '<option value="">Choose an available room</option>';
    data.filter(room => room.status === "Available").forEach(room => {
        const option = document.createElement("option");
        option.value = room.roomNumber;
        option.textContent = `Room ${room.roomNumber} - ${room.roomType}`;
        reservationRoom.appendChild(option);
    });
    if (data.some(room => room.status === "Available" && room.roomNumber === selectedRoom)) {
        reservationRoom.value = selectedRoom;
    }

    let searchValue = roomSearch.value.toLowerCase().trim();
    let statusValue = statusFilter.value;
    let typeValue = typeFilter.value;

    let filteredRooms = data.filter(room => {
        return (
            room.roomNumber.toLowerCase().includes(searchValue) &&
            (statusValue === "all" || room.status === statusValue) &&
            (typeValue === "all" || room.roomType === typeValue)
        );
    });

    roomList.innerHTML = "";

    filteredRooms.forEach(room => {
        let card = document.createElement("article");
        card.className = "card";

        card.innerHTML = `
             <div class="card-top" data-id="${room._id}">
                <div>
                    <h3>Room ${room.roomNumber}</h3>
                    <div class="meta">${room.roomType} · Floor ${room.floor}</div>
                </div>
                <span class="badge ${room.status}">
                    ${room.status}
                </span>
            </div>

            <div class="photo">
                <i class="fa-solid fa-bed"></i>
            </div>

            <div class="features">
                <span>${room.feature}</span>
                <span>Up to ${room.guests} guests</span>
            </div>

            <div class="price-row">
                <div class="price">
                    ₱${room.rate.toLocaleString("en-PH")}
                    <small>/ night</small>
                </div>
            </div>

            <div class="actions">
                <button class="btn solid"
                    data-act="book"
                    data-id="${room._id}"
                    data-room="${room.roomNumber}"
                    ${room.status === "Available" ? "" : "disabled"}>
                    ${room.status === "Available" ? "Book Room" : "Unavailable"}
                </button>
            </div>
        `;

        roomList.appendChild(card);
    });

    roomCount.textContent = filteredRooms.length;

    if (new URLSearchParams(window.location.search).get("newReservation") === "1") {
        window.history.replaceState(null, "", "rooms.html");
        openReservation();
    }
}

display();

roomSearch.addEventListener("input", display);
statusFilter.addEventListener("change", display);
typeFilter.addEventListener("change", display);

let selectedTaskId = null;
let selectedRoomNumber = null;

function openReservation(roomNumber = "") {
    reservationRoom.value = roomNumber;
    selectedRoomNumber = roomNumber;
    roomModal.hidden = false;
    roomModal.classList.add("open");
    reservationRoom.focus();
}

function closeReservation() {
    roomModal.classList.remove("open");
    roomModal.hidden = true;
}

document.getElementById("startReservation").addEventListener("click", event => {
    event.preventDefault();
    openReservation();
});

reservationRoom.addEventListener("change", () => {
    selectedRoomNumber = reservationRoom.value;
});

document.addEventListener("click", (event) => {
    const btn = event.target.closest('[data-act="book"]');

    if (btn) {
        selectedTaskId = btn.dataset.id;
        selectedRoomNumber = btn.dataset.room;

        openReservation(selectedRoomNumber);
    }
});

reservationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    selectedRoomNumber = reservationRoom.value;
    if (!selectedRoomNumber) return;

    const guestName = document.getElementById("guestName").value;
    const guestPhone = document.getElementById("guestPhone").value;
    const guestCount = document.getElementById("guestCount").value;
    const checkIn = document.getElementById("checkIn").value;
    const checkOut = document.getElementById("checkOut").value;
    const specialRequests = document.getElementById("specialRequests").value;
    

    const response = await fetch("/rentroom", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: guestName,
            number: guestPhone,
            guestCount: guestCount,
            roomNumber: selectedRoomNumber,
            checkIn: checkIn,
            checkOut: checkOut,
            specialRequests: specialRequests
        })
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.message);
        return;
    }

    alert("Room reserved successfully!");

    closeReservation();

    reservationForm.reset();

    await display();
});


document.getElementById("cancelModal").addEventListener("click", closeReservation);
document.getElementById("closeModal").addEventListener("click", closeReservation);
roomModal.addEventListener("click", event => {
    if (event.target === roomModal) closeReservation();
});

async function loadUser() {
    try {
        const response = await fetch("/me");

        if (!response.ok) {
            console.log("User is not logged in:", response.status);
            return;
        }

        const user = await response.json();

       

        document.querySelector(".profile strong").textContent = user.name;
        document.querySelector(".profile small").textContent = user.email;

    } catch (error) {
        console.error("Error loading user:", error);
    }
}

loadUser();
