    const toast = document.getElementById("toast");
    let toastTimer;

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.style.display = "block";

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.style.display = "none";
        }, 2600);
    }



let reservations = [];

async function fetchReservations() {
    const tableBody = document.getElementById("reservationsTableBody");

    if (!tableBody) return;

    try {
        const response = await fetch("/guest");

        if (!response.ok) {
            throw new Error("Failed to fetch reservations");
        }

        reservations = await response.json();

        displayReservations(reservations);
        updateSummary();

    } catch (error) {
        console.error("Error fetching reservations:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    Failed to load reservations.
                </td>
            </tr>
        `;
    }
}

function getReservationStatus(reservation) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkIn = new Date(reservation.checkIn);
    const checkOut = new Date(reservation.checkOut);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        return "Unknown";
    }

    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);

    if (today < checkIn) {
        return "Upcoming";
    }

    if (today >= checkIn && today < checkOut) {
        return "Active";
    }

    return "Past";
}

function displayReservations(data) {
    const tableBody = document.getElementById("reservationsTableBody");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    No reservations found.
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(reservation => {
        const status = getReservationStatus(reservation);
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <strong>${reservation.name || "N/A"}</strong>
                <small>${reservation.number || "No phone number"}</small>
            </td>

            <td>
                ${reservation.roomNumber || "N/A"}
                <small>${reservation.roomType || ""}</small>
            </td>

            <td>${reservation.checkIn.toString().split("T")[0] || "N/A"}</td>

            <td>${reservation.checkOut.toString().split("T")[0] || "N/A"}</td>

            <td>${status}</td>

            <td>
                <button type="button" class="text-link"
                    onclick="showToast('Guest: ${String(reservation.name || "N/A").replace(/['\\]/g, "")}')">
                    View Details
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", fetchReservations);





    function updateSummary() {
        document.getElementById("totalReservations").textContent =
            reservations.length;

        document.getElementById("upcomingReservations").textContent =
            reservations.filter(r =>
                getReservationStatus(r) === "Upcoming"
            ).length;

        document.getElementById("activeReservations").textContent =
            reservations.filter(r =>
                getReservationStatus(r) === "Active"
            ).length;

        document.getElementById("pastReservations").textContent =
            reservations.filter(r =>
                getReservationStatus(r) === "Past"
            ).length;
    }



function filterReservations() {
    const search = document.getElementById("reservationSearch").value.toLowerCase().trim();

    const filter = document.getElementById("reservationFilter").value.toLowerCase();

    const filtered = reservations.filter(reservation => {

        const name = String(reservation.name || "").toLowerCase();
        const number = String(reservation.number || "").toLowerCase();
        const room = String(reservation.roomNumber || "").toLowerCase();

        const status = getReservationStatus(reservation).toLowerCase();

        const matchesSearch =
            name.includes(search) ||
            number.includes(search) ||
            room.includes(search);

        const matchesStatus =
            filter === "all" ||
            status === filter;

        return matchesSearch && matchesStatus;
    });

    displayReservations(filtered);
}



    const reservationSearch =
        document.getElementById("reservationSearch");

    if (reservationSearch) {
        reservationSearch.addEventListener(
            "input",
            filterReservations
        );
    }

    const reservationFilter =
        document.getElementById("reservationFilter");

    if (reservationFilter) {
        reservationFilter.addEventListener(
            "change",
            filterReservations
        );
    }




    document.querySelectorAll(".nav a[data-soon]").forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            showToast(`${link.dataset.soon} is coming soon.`);
        });
    });

    const newReservation = document.getElementById("newReservation");

    if (newReservation) {
        newReservation.addEventListener("click", () => {
            showToast("The reservation form will be added later.");
        });
    }

    const viewRooms = document.getElementById("viewRooms");

    if (viewRooms) {
        viewRooms.addEventListener("click", () => {
            window.location.href = "rooms.html";
        });
    }

    const viewReservations =
        document.getElementById("viewReservations");

    if (viewReservations) {
        viewReservations.addEventListener("click", () => {
            showToast("You're already viewing Reservations.");
        });
    }

    const notifications = document.getElementById("notifications");

    if (notifications) {
        notifications.addEventListener("click", () => {
            showToast("You're all caught up!");
        });
    }


    updateSummary();
    displayReservations(reservations);
