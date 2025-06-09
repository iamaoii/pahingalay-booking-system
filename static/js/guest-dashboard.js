// Data Storage
class HotelData {
  constructor() {
    this.currentGuestId = 1; // Simulating logged-in guest
    this.initializeData();
  }

  initializeData() {
    if (!localStorage.getItem("hotelGuests")) {
      const sampleGuests = [
        { id: 1, name: "John Doe", email: "john@example.com", phone: "+1234567890" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+1234567891" },
        { id: 3, name: "Mike Johnson", email: "mike@example.com", phone: "+1234567892" },
      ];
      localStorage.setItem("hotelGuests", JSON.stringify(sampleGuests));
    }

    if (!localStorage.getItem("hotelRooms")) {
      const sampleRooms = [
        { id: 1, number: "101", type: "Standard", price: 120, status: "Available" },
        { id: 2, number: "102", type: "Deluxe", price: 180, status: "Available" },
        { id: 3, number: "201", type: "Suite", price: 300, status: "Available" },
        { id: 4, number: "202", type: "Standard", price: 120, status: "Occupied" },
        { id: 5, number: "301", type: "Presidential", price: 500, status: "Available" },
      ];
      localStorage.setItem("hotelRooms", JSON.stringify(sampleRooms));
    }

    if (!localStorage.getItem("hotelBookings")) {
      const sampleBookings = [
        {
          id: 1,
          guestId: 1,
          roomId: 1,
          checkIn: "2025-06-01",
          checkOut: "2025-06-04",
          nights: 3,
          total: 1447,
          status: "Confirmed",
        },
        {
          id: 2,
          guestId: 1,
          roomId: 2,
          checkIn: "2025-06-10",
          checkOut: "2025-06-14",
          nights: 4,
          total: 1245,
          status: "Pending",
        },
      ];
      localStorage.setItem("hotelBookings", JSON.stringify(sampleBookings));
    }
  }

  getGuests() {
    return JSON.parse(localStorage.getItem("hotelGuests") || "[]");
  }

  getRooms() {
    return JSON.parse(localStorage.getItem("hotelRooms") || "[]");
  }

  getBookings() {
    return JSON.parse(localStorage.getItem("hotelBookings") || "[]");
  }

  saveGuests(guests) {
    localStorage.setItem("hotelGuests", JSON.stringify(guests));
  }

  saveRooms(rooms) {
    localStorage.setItem("hotelRooms", JSON.stringify(rooms));
  }

  saveBookings(bookings) {
    localStorage.setItem("hotelBookings", JSON.stringify(bookings));
  }

  getCurrentGuest() {
    const guests = this.getGuests();
    return guests.find((guest) => guest.id === this.currentGuestId);
  }

  getGuestBookings() {
    const bookings = this.getBookings();
    return bookings.filter((booking) => booking.guestId === this.currentGuestId);
  }

  addBooking(booking) {
    const bookings = this.getBookings();
    booking.id = Math.max(...bookings.map((b) => b.id), 0) + 1;
    bookings.push(booking);
    this.saveBookings(bookings);
    return booking;
  }

  updateBooking(id, updatedBooking) {
    const bookings = this.getBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index !== -1) {
      bookings[index] = { ...bookings[index], ...updatedBooking };
      this.saveBookings(bookings);
      return bookings[index];
    }
    return null;
  }

  deleteBooking(id) {
    const bookings = this.getBookings();
    const filteredBookings = bookings.filter((b) => b.id !== id);
    this.saveBookings(filteredBookings);
  }

  addGuest(guest) {
    const guests = this.getGuests();
    guest.id = Math.max(...guests.map((g) => g.id), 0) + 1;
    guests.push(guest);
    this.saveGuests(guests);
    return guest;
  }

  updateGuest(id, updatedGuest) {
    const guests = this.getGuests();
    const index = guests.findIndex((g) => g.id === id);
    if (index !== -1) {
      guests[index] = { ...guests[index], ...updatedGuest };
      this.saveGuests(guests);
      return guests[index];
    }
    return null;
  }

  deleteGuest(id) {
    const guests = this.getGuests();
    const filteredGuests = guests.filter((g) => g.id !== id);
    this.saveGuests(filteredGuests);
  }

  addRoom(room) {
    const rooms = this.getRooms();
    room.id = Math.max(...rooms.map((r) => r.id), 0) + 1;
    rooms.push(room);
    this.saveRooms(rooms);
    return room;
  }

  updateRoom(id, updatedRoom) {
    const rooms = this.getRooms();
    const index = rooms.findIndex((r) => r.id === id);
    if (index !== -1) {
      rooms[index] = { ...rooms[index], ...updatedRoom };
      this.saveRooms(rooms);
      return rooms[index];
    }
    return null;
  }

  deleteRoom(id) {
    const rooms = this.getRooms();
    const filteredRooms = rooms.filter((r) => r.id !== id);
    this.saveRooms(filteredRooms);
  }
}

// Initialize data
const hotelData = new HotelData();

// DOM Elements
const guestDashboardBtn = document.getElementById("guestDashboardBtn");
const adminDashboardBtn = document.getElementById("adminDashboardBtn");
const guestDashboard = document.getElementById("guestDashboard");
const adminDashboard = document.getElementById("adminDashboard");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalForm = document.getElementById("modalForm");
const closeModal = document.getElementById("closeModal");

// Navigation
guestDashboardBtn?.addEventListener("click", () => {
  showGuestDashboard();
});

adminDashboardBtn?.addEventListener("click", () => {
  showAdminDashboard();
});

function showGuestDashboard() {
  guestDashboard.classList.remove("hidden");
  adminDashboard.classList.add("hidden");
  guestDashboardBtn.classList.add("active");
  adminDashboardBtn.classList.remove("active");
  loadGuestDashboard();
}

function showAdminDashboard() {
  adminDashboard.classList.add("hidden");
  guestDashboard.classList.add("hidden");
  adminDashboardBtn.classList.add("active");
  guestDashboardBtn.classList.remove("active");

  setTimeout(() => {
    adminDashboard.classList.remove("hidden");
    loadAdminDashboard();
  }, 100);
}

// Guest Dashboard Functions
function loadGuestDashboard() {
  const currentGuest = hotelData.getCurrentGuest();
  const guestBookings = hotelData.getGuestBookings();
  const rooms = hotelData.getRooms();

  // Update guest name
  document.getElementById("guestName").textContent = currentGuest.name;

  // Calculate stats
  const totalBookings = guestBookings.length;
  const nightsStayed = guestBookings.reduce((total, booking) => total + booking.nights, 0);
  const totalSpent = guestBookings.reduce((total, booking) => total + booking.total, 0);

  // Update stats
  document.getElementById("totalBookings").textContent = totalBookings;
  document.getElementById("nightsStayed").textContent = nightsStayed;
  document.getElementById("totalSpent").textContent = `₱${totalSpent.toLocaleString()}`;

  // Load bookings
  loadGuestBookings();
}

function loadGuestBookings() {
  const guestBookings = hotelData.getGuestBookings();
  const rooms = hotelData.getRooms();
  const bookingsContainer = document.getElementById("guestBookings");

  if (guestBookings.length === 0) {
    bookingsContainer.innerHTML = '<p class="text-center">No bookings found. Create your first booking!</p>';
    return;
  }

  bookingsContainer.innerHTML = guestBookings
    .map((booking) => {
      const room = rooms.find((r) => r.id === booking.roomId);
      return `
            <div class="booking-card">
                <div class="booking-header">
                    <span class="booking-id">Booking #${booking.id}</span>
                    <span class="booking-status status-${booking.status.toLowerCase()}">${booking.status}</span>
                </div>
                <div class="booking-details">
                    <div class="booking-detail">
                        <span>Room:</span>
                        <strong>${room ? room.number : "N/A"}</strong>
                    </div>
                    <div class="booking-detail">
                        <span>Check-in:</span>
                        <strong>${new Date(booking.checkIn).toLocaleDateString()}</strong>
                    </div>
                    <div class="booking-detail">
                        <span>Check-out:</span>
                        <strong>${new Date(booking.checkOut).toLocaleDateString()}</strong>
                    </div>
                    <div class="booking-detail">
                        <span>Total:</span>
                        <strong>₱${booking.total.toLocaleString()}</strong>
                    </div>
                </div>
                <div class="booking-actions">
                    <button class="btn btn-secondary btn-sm">View</button>
                    ${booking.status === "Pending" ? '<button class="btn btn-danger btn-sm">Cancel</button>' : ""}
                </div>
            </div>
        `;
    })
    .join("");
}

// Admin Dashboard Functions
function loadAdminDashboard() {
  const bookings = hotelData.getBookings();
  const guests = hotelData.getGuests();
  const rooms = hotelData.getRooms();

  // Update admin stats
  document.getElementById("adminTotalBookings").textContent = bookings.length;
  document.getElementById("adminTotalGuests").textContent = guests.length;
  document.getElementById("adminTotalRooms").textContent = rooms.length;

  // Load tables
  loadBookingsTable();
  loadGuestsTable();
  loadRoomsTable();
}

function loadBookingsTable() {
  const bookings = hotelData.getBookings();
  const guests = hotelData.getGuests();
  const rooms = hotelData.getRooms();
  const tbody = document.querySelector("#bookingsTable tbody");

  tbody.innerHTML = bookings
    .map((booking) => {
      const guest = guests.find((g) => g.id === booking.guestId);
      const room = rooms.find((r) => r.id === booking.roomId);
      return `
            <tr>
                <td>#${booking.id}</td>
                <td>${guest ? guest.name : "N/A"}</td>
                <td>${room ? `${room.number} (${room.type})` : "N/A"}</td>
                <td>${new Date(booking.checkIn).toLocaleDateString()}</td>
                <td>${new Date(booking.checkOut).toLocaleDateString()}</td>
                <td>${booking.nights}</td>
                <td>₱${booking.total.toLocaleString()}</td>
                <td><span class="booking-status status-${booking.status.toLowerCase()}">${booking.status}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editBooking(${booking.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBookingConfirm(${booking.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    })
    .join("");
}

function loadGuestsTable() {
  const guests = hotelData.getGuests();
  const bookings = hotelData.getBookings();
  const tbody = document.querySelector("#guestsTable tbody");

  tbody.innerHTML = guests
    .map((guest) => {
      const guestBookings = bookings.filter((b) => b.guestId === guest.id);
      return `
            <tr>
                <td>#${guest.id}</td>
                <td>${guest.name}</td>
                <td>${guest.email}</td>
                <td>${guest.phone}</td>
                <td>${guestBookings.length}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editGuest(${guest.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteGuestConfirm(${guest.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    })
    .join("");
}

function loadRoomsTable() {
  const rooms = hotelData.getRooms();
  const tbody = document.querySelector("#roomsTable tbody");

  tbody.innerHTML = rooms
    .map(
      (room) => `
        <tr>
            <td>#${room.id}</td>
            <td>${room.number}</td>
            <td>${room.type}</td>
            <td>₱${room.price.toLocaleString()}</td>
            <td><span class="booking-status status-${room.status.toLowerCase().replace(" ", "-")}">${room.status}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editRoom(${room.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteRoomConfirm(${room.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `,
    )
    .join("");
}

// Tab functionality
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabName = btn.dataset.tab;

    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });
    document.getElementById(`${tabName}Tab`).classList.add("active");
  });
});

// Modal functions
function showModal(title, formContent) {
  modalTitle.textContent = title;
  modalForm.innerHTML = formContent;
  modal.style.display = "block";
}

function hideModal() {
  modal.style.display = "none";
  modalForm.innerHTML = "";
}

closeModal.addEventListener("click", hideModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) hideModal();
});

// Booking functions
document.getElementById("addBookingBtn").addEventListener("click", () => addBooking());
document.getElementById("addAdminBookingBtn").addEventListener("click", () => addBooking());

function addBooking() {
  const guests = hotelData.getGuests();
  const rooms = hotelData.getRooms().filter((r) => r.status === "Available");

  const guestOptions = guests.map((guest) => `<option value="${guest.id}">${guest.name}</option>`).join("");

  const roomOptions = rooms
    .map((room) => `<option value="${room.id}" data-price="${room.price}">${room.number} (${room.type}) - ₱${room.price}/night</option>`)
    .join("");

  showModal(
    "Add New Booking",
    `
        <div class="form-group">
            <label for="guestSelect">Guest</label>
            <select id="guestSelect" required>
                <option value="">Select Guest</option>
                ${guestOptions}
            </select>
        </div>
        <div class="form-group">
            <label for="roomSelect">Room</label>
            <select id="roomSelect" required>
                <option value="">Select Room</option>
                ${roomOptions}
            </select>
        </div>
        <div class="form-group">
            <label for="checkIn">Check-in Date</label>
            <input type="date" id="checkIn" required>
        </div>
        <div class="form-group">
            <label for="checkOut">Check-out Date</label>
            <input type="date" id="checkOut" required>
        </div>
        <div class="form-group">
            <label for="status">Status</label>
            <select id="status" required>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
            </select>
        </div>
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="hideModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Booking</button>
        </div>
    `,
  );

  const checkInInput = document.getElementById("checkIn");
  const checkOutInput = document.getElementById("checkOut");
  const roomSelect = document.getElementById("roomSelect");

  function calculateTotal() {
    const checkIn = new Date(checkInInput.value);
    const checkOut = new Date(checkOutInput.value);
    const roomPrice = Number.parseFloat(roomSelect.selectedOptions[0]?.dataset.price || 0);

    if (checkIn && checkOut && checkOut > checkIn) {
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const total = nights * roomPrice;

      let totalDisplay = document.getElementById("totalDisplay");
      if (!totalDisplay) {
        totalDisplay = document.createElement("div");
        totalDisplay.id = "totalDisplay";
        totalDisplay.className = "form-group";
        totalDisplay.innerHTML = '<label>Total</label><div id="totalAmount"></div>';
        document.getElementById("status").parentNode.insertAdjacentElement("beforebegin", totalDisplay);
      }
      document.getElementById("totalAmount").innerHTML = `<strong>${nights} nights × ₱${roomPrice} = ₱${total}</strong>`;
    }
  }

  checkInInput.addEventListener("change", calculateTotal);
  checkOutInput.addEventListener("change", calculateTotal);
  roomSelect.addEventListener("change", calculateTotal);

  modalForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const checkIn = new Date(checkInInput.value);
    const checkOut = new Date(checkOutInput.value);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const roomPrice = Number.parseFloat(roomSelect.selectedOptions[0].dataset.price);
    const total = nights * roomPrice;

    const booking = {
      guestId: Number.parseInt(document.getElementById("guestSelect").value),
      roomId: Number.parseInt(document.getElementById("roomSelect").value),
      checkIn: checkInInput.value,
      checkOut: checkOutInput.value,
      nights: nights,
      total: total,
      status: document.getElementById("status").value,
    };

    hotelData.addBooking(booking);
    hideModal();

    if (!guestDashboard.classList.contains("hidden")) {
      loadGuestDashboard();
    } else {
      loadAdminDashboard();
    }
  });
}

function editBooking(id) {
  const booking = hotelData.getBookings().find((b) => b.id === id);
  const guests = hotelData.getGuests();
  const rooms = hotelData.getRooms();

  if (!booking) return;

  const guestOptions = guests
    .map((guest) => `<option value="${guest.id}" ${guest.id === booking.guestId ? "selected" : ""}>${guest.name}</option>`)
    .join("");

  const roomOptions = rooms
    .map(
      (room) =>
        `<option value="${room.id}" data-price="${room.price}" ${room.id === booking.roomId ? "selected" : ""}>${room.number} (${room.type}) - ₱${room.price}/night</option>`,
    )
    .join("");

  showModal(
    "Edit Booking",
    `
        <div class="form-group">
            <label for="guestSelect">Guest</label>
            <select id="guestSelect" required>
                ${guestOptions}
            </select>
        </div>
        <div class="form-group">
            <label for="roomSelect">Room</label>
            <select id="roomSelect" required>
                ${roomOptions}
            </select>
        </div>
        <div class="form-group">
            <label for="checkIn">Check-in Date</label>
            <input type="date" id="checkIn" value="${booking.checkIn}" required>
        </div>
        <div class="form-group">
            <label for="checkOut">Check-out Date</label>
            <input type="date" id="checkOut" value="${booking.checkOut}" required>
        </div>
        <div class="form-group">
            <label for="status">Status</label>
            <select id="status" required>
                <option value="Pending" ${booking.status === "Pending" ? "selected" : ""}>Pending</option>
                <option value="Confirmed" ${booking.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
                <option value="Cancelled" ${booking.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
            </select>
        </div>
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="hideModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Update Booking</button>
        </div>
    `,
  );

  modalForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const checkIn = new Date(document.getElementById("checkIn").value);
    const checkOut = new Date(document.getElementById("checkOut").value);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const roomPrice = Number.parseFloat(document.getElementById("roomSelect").selectedOptions[0].dataset.price);
    const total = nights * roomPrice;

    const updatedBooking = {
      guestId: Number.parseInt(document.getElementById("guestSelect").value),
      roomId: Number.parseInt(document.getElementById("roomSelect").value),
      checkIn: document.getElementById("checkIn").value,
      checkOut: document.getElementById("checkOut").value,
      nights: nights,
      total: total,
      status: document.getElementById("status").value,
    };

    hotelData.updateBooking(id, updatedBooking);
    hideModal();

    if (!guestDashboard.classList.contains("hidden")) {
      loadGuestDashboard();
    } else {
      loadAdminDashboard();
    }
  });
}

function deleteBookingConfirm(id) {
  if (confirm("Are you sure you want to delete this booking?")) {
    hotelData.deleteBooking(id);

    if (!guestDashboard.classList.contains("hidden")) {
      loadGuestDashboard();
    } else {
      loadAdminDashboard();
    }
  }
}

// Guest functions
document.getElementById("addGuestBtn").addEventListener("click", addGuest);

function addGuest() {
  showModal(
    "Add New Guest",
    `
        <div class="form-group">
            <label for="guestName">Name</label>
            <input type="text" id="guestName" required>
        </div>
        <div class="form-group">
            <label for="guestEmail">Email</label>
            <input type="email" id="guestEmail" required>
        </div>
        <div class="form-group">
            <label for="guestPhone">Phone</label>
            <input type="tel" id="guestPhone" required>
        </div>
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="hideModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Guest</button>
        </div>
    `,
  );

  modalForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const guest = {
      name: document.getElementById("guestName").value,
      email: document.getElementById("guestEmail").value,
      phone: document.getElementById("guestPhone").value,
    };

    hotelData.addGuest(guest);
    hideModal();
    loadAdminDashboard();
  });
}

function editGuest(id) {
  const guest = hotelData.getGuests().find((g) => g.id === id);
  if (!guest) return;

  showModal(
    "Edit Guest",
    `
        <div class="form-group">
            <label for="guestName">Name</label>
            <input type="text" id="guestName" value="${guest.name}" required>
        </div>
        <div class="form-group">
            <label for="guestEmail">Email</label>
            <input type="email" id="guestEmail" value="${guest.email}" required>
        </div>
        <div class="form-group">
            <label for="guestPhone">Phone</label>
            <input type="tel" id="guestPhone" value="${guest.phone}" required>
        </div>
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="hideModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Update Guest</button>
        </div>
    `,
  );

  modalForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const updatedGuest = {
      name: document.getElementById("guestName").value,
      email: document.getElementById("guestEmail").value,
      phone: document.getElementById("guestPhone").value,
    };

    hotelData.updateGuest(id, updatedGuest);
    hideModal();
    loadAdminDashboard();
  });
}

function deleteGuestConfirm(id) {
  if (confirm("Are you sure you want to delete this guest? This will also delete all their bookings.")) {
    const bookings = hotelData.getBookings();
    const guestBookings = bookings.filter((b) => b.guestId === id);
    guestBookings.forEach((booking) => hotelData.deleteBooking(booking.id));

    hotelData.deleteGuest(id);
    loadAdminDashboard();
  }
}

// Room functions
document.getElementById("addRoomBtn").addEventListener("click", addRoom);

function addRoom() {
  showModal(
    "Add New Room",
    `
        <div class="form-group">
            <label for="roomNumber">Room Number</label>
            <input type="text" id="roomNumber" required>
        </div>
        <div class="form-group">
            <label for="roomType">Room Type</label>
            <select id="roomType" required>
                <option value="">Select Type</option>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
                <option value="Presidential">Presidential</option>
            </select>
        </div>
        <div class="form-group">
            <label for="roomPrice">Price per Night</label>
            <input type="number" id="roomPrice" min="0" step="0.01" required>
        </div>
        <div class="form-group">
            <label for="roomStatus">Status</label>
            <select id="roomStatus" required>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
            </select>
        </div>
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="hideModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Room</button>
        </div>
    `,
  );

  modalForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const room = {
      number: document.getElementById("roomNumber").value,
      type: document.getElementById("roomType").value,
      price: Number.parseFloat(document.getElementById("roomPrice").value),
      status: document.getElementById("roomStatus").value,
    };

    hotelData.addRoom(room);
    hideModal();
    loadAdminDashboard();
  });
}

function editRoom(id) {
  const room = hotelData.getRooms().find((r) => r.id === id);
  if (!room) return;

  showModal(
    "Edit Room",
    `
        <div class="form-group">
            <label for="roomNumber">Room Number</label>
            <input type="text" id="roomNumber" value="${room.number}" required>
        </div>
        <div class="form-group">
            <label for="roomType">Room Type</label>
            <select id="roomType" required>
                <option value="Standard" ${room.type === "Standard" ? "selected" : ""}>Standard</option>
                <option value="Deluxe" ${room.type === "Deluxe" ? "selected" : ""}>Deluxe</option>
                <option value="Suite" ${room.type === "Suite" ? "selected" : ""}>Suite</option>
                <option value="Presidential" ${room.type === "Presidential" ? "selected" : ""}>Presidential</option>
            </select>
        </div>
        <div class="form-group">
            <label for="roomPrice">Price per Night</label>
            <input type="number" id="roomPrice" value="${room.price}" min="0" step="0.01" required>
        </div>
        <div class="form-group">
            <label for="roomStatus">Status</label>
            <select id="roomStatus" required>
                <option value="Available" ${room.status === "Available" ? "selected" : ""}>Available</option>
                <option value="Occupied" ${room.status === "Occupied" ? "selected" : ""}>Occupied</option>
                <option value="Maintenance" ${room.status === "Maintenance" ? "selected" : ""}>Maintenance</option>
            </select>
        </div>
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="hideModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Update Room</button>
        </div>
    `,
  );

  modalForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const updatedRoom = {
      number: document.getElementById("roomNumber").value,
      type: document.getElementById("roomType").value,
      price: Number.parseFloat(document.getElementById("roomPrice").value),
      status: document.getElementById("roomStatus").value,
    };

    hotelData.updateRoom(id, updatedRoom);
    hideModal();
    loadAdminDashboard();
  });
}

function deleteRoomConfirm(id) {
  if (confirm("Are you sure you want to delete this room? This will also delete all bookings for this room.")) {
    const bookings = hotelData.getBookings();
    const roomBookings = bookings.filter((b) => b.roomId === id);
    roomBookings.forEach((booking) => hotelData.deleteBooking(booking.id));

    hotelData.deleteRoom(id);
    loadAdminDashboard();
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  showGuestDashboard();
});