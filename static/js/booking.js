document.addEventListener('DOMContentLoaded', () => {
    // Retrieve JWT token from localStorage
    const token = localStorage.getItem('authToken');
    let prices = {
        'single': 999,
        'double': 1499,
        'suite': 2499,
        'family': 3499
    };

    // Fetch room prices
    fetch('/api/room-prices', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        prices = data;
        updateSummary();
    })
    .catch(error => {
        console.error('Error fetching room prices:', error);
    });

    // Fetch guest information
    if (token) {
        fetch('/api/guest-info', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.status === 401) {
                throw new Error('Unauthorized');
            }
            if (!response.ok) {
                throw new Error('Failed to fetch guest info');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                alert(data.error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/signin';
                return;
            }
            document.querySelector('#guest-name').value = data.guestName;
            document.querySelector('#email').value = data.guestEmail;
            document.querySelector('#contact').value = data.guestContactNo;
            document.querySelector('#sex').value = data.guestSex;
            document.querySelector('#age').value = data.guestAge;
            document.querySelector('#nationality').value = data.nationality;
            document.querySelector('#address').value = data.address;
        })
        .catch(error => {
            console.error('Error fetching guest info:', error);
            alert('Session invalid or expired. Please sign in again.');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/signin';
        });
    } else {
        alert('Please sign in to continue.');
        window.location.href = '/signin';
    }

    // Tab Navigation
    const tabs = document.querySelectorAll('.booking-tab');
    const tabContents = document.querySelectorAll('.booking-tab-content');
    const nextButtons = document.querySelectorAll('.next-tab');
    const prevButtons = document.querySelectorAll('.prev-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            switchTab(targetTab);
        });
    });

    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const nextTab = button.dataset.next;
            if (validateTab(getActiveTab())) {
                switchTab(nextTab);
            }
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prevTab = button.dataset.prev;
            switchTab(prevTab);
        });
    });

    function switchTab(targetTab) {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));

        document.querySelector(`.booking-tab[data-tab="${targetTab}"]`).classList.add('active');
        document.querySelector(`#${targetTab}-tab`).classList.add('active');
    }

    function getActiveTab() {
        return document.querySelector('.booking-tab.active').dataset.tab;
    }

    function validateTab(tab) {
        if (tab === 'guest-info') {
            const companions = document.querySelectorAll('#companions-tbody tr');
            for (let row of companions) {
                if (!validateCompanion(row)) return false;
            }
        }
        if (tab === 'reservation-details') {
            const checkIn = document.querySelector('#check-in').value;
            const checkOut = document.querySelector('#check-out').value;
            const nights = document.querySelector('#nights').value;
            const adults = document.querySelector('#adults').value;
            if (!checkIn || !checkOut || !nights || !adults) {
                alert('Please fill out all required fields in Reservation Details.');
                return false;
            }
        }
        return true;
    }

    function validateCompanion(row) {
        const name = row.querySelector('input[name^="companion-name"]').value;
        const contact = row.querySelector('input[name^="companion-contact"]').value;
        const email = row.querySelector('input[name^="companion-email"]').value;
        const age = parseInt(row.querySelector('input[name^="companion-age"]').value);
        const sex = row.querySelector('select[name^="companion-sex"]').value;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!name || !contact || !emailRegex.test(email) || isNaN(age) || age < 0 || age > 120 || !sex) {
            alert('Please fill out all companion fields correctly (valid email, age 0-120).');
            return false;
        }
        return true;
    }

    // Companion Management
    const addCompanionBtn = document.querySelector('#add-companion-btn');
    const companionsTbody = document.querySelector('#companions-tbody');
    let companionCount = 0;

    addCompanionBtn.addEventListener('click', () => {
        if (companionCount >= 5) {
            alert('Maximum of 5 companions allowed.');
            return;
        }

        companionCount++;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${companionCount}</td>
            <td><input type="text" placeholder="Full Name" name="companion-name-${companionCount}" required></td>
            <td><input type="tel" placeholder="Contact Number" name="companion-contact-${companionCount}" required></td>
            <td><input type="email" placeholder="Email" name="companion-email-${companionCount}" required></td>
            <td><input type="number" placeholder="Age" name="companion-age-${companionCount}" min="0" max="120" required></td>
            <td>
                <select name="companion-sex-${companionCount}" required>
                    <option value="" disabled selected>Select Sex</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Others</option>
                </select>
            </td>
            <td><button type="button" class="remove-companion-btn"><i class="fas fa-trash"></i></button></td>
        `;
        companionsTbody.appendChild(row);
        updateGuestSummary();
    });

    companionsTbody.addEventListener('click', (e) => {
        if (e.target.closest('.remove-companion-btn')) {
            e.target.closest('tr').remove();
            companionCount--;
            const rows = companionsTbody.querySelectorAll('tr');
            rows.forEach((row, index) => {
                row.querySelector('td:first-child').textContent = index + 1;
                row.querySelectorAll('input, select').forEach(input => {
                    const nameParts = input.name.split('-');
                    input.name = `${nameParts[0]}-${index + 1}`;
                });
            });
            updateGuestSummary();
        }
    });

    // Date Picker Configuration with Flatpickr
    let checkInDate = null;
    let checkOutDate = null;

    const checkInPicker = flatpickr('#check-in', {
        dateFormat: 'Y-m-d',
        minDate: 'today',
        onChange: (selectedDates, dateStr) => {
            checkInDate = selectedDates[0];
            if (checkOutDate && checkOutDate <= checkInDate) {
                checkOutPicker.clear();
                checkOutDate = null;
            }
            checkOutPicker.set('minDate', new Date(checkInDate.getTime() + 86400000));
            updateNights();
            updateSummary();
        }
    });

    const checkOutPicker = flatpickr('#check-out', {
        dateFormat: 'Y-m-d',
        minDate: 'today',
        onChange: (selectedDates, dateStr) => {
            checkOutDate = selectedDates[0];
            if (checkInDate && checkOutDate <= checkInDate) {
                alert('Check-out date must be after check-in date.');
                checkOutPicker.clear();
                checkOutDate = null;
            }
            updateNights();
            updateSummary();
        }
    });

    function updateNights() {
        if (checkInDate && checkOutDate && checkOutDate > checkInDate) {
            const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
            document.querySelector('#nights').value = nights;
        } else {
            document.querySelector('#nights').value = '';
        }
        updateSummary();
    }

    // Update Booking Summary
    function updateSummary() {
        const roomType = document.querySelector('input[name="room-type"]:checked').nextElementSibling.textContent;
        const checkIn = document.querySelector('#check-in').value || 'Not selected';
        const checkOut = document.querySelector('#check-out').value || 'Not selected';
        const adults = document.querySelector('#adults').value || 1;
        const children = document.querySelector('#children').value || 0;

        document.querySelector('.summary-item:nth-child(1) span:last-child').textContent = roomType;
        document.querySelector('#summary-check-in').textContent = checkIn;
        document.querySelector('#summary-check-out').textContent = checkOut;
        document.querySelector('#summary-guests').textContent = `${adults} Adult${adults > 1 ? 's' : ''} + ${companionCount} Companion${companionCount !== 1 ? 's' : ''}${children > 0 ? ` + ${children} Child${children > 1 ? 'ren' : ''}` : ''}`;

        const nights = document.querySelector('#nights').value || 1;
        const roomValue = document.querySelector('input[name="room-type"]:checked').value;
        const total = prices[roomValue] * nights;
        document.querySelector('#summary-total').textContent = `₱${total.toFixed(2)}`;
    }

    function updateGuestSummary() {
        const adults = document.querySelector('#adults').value || 1;
        const children = document.querySelector('#children').value || 0;
        document.querySelector('#summary-guests').textContent = `${adults} Adult${adults > 1 ? 's' : ''} + ${companionCount} Companion${companionCount !== 1 ? 's' : ''}${children > 0 ? ` + ${children} Child${children > 1 ? 'ren' : ''}` : ''}`;
        updateSummary();
    }

    // Submit Booking
    document.querySelector('#complete-reservation').addEventListener('click', (e) => {
        e.preventDefault();
        if (!validateTab(getActiveTab())) return;

        const bookingData = {
            checkInDate: document.querySelector('#check-in').value,
            checkOutDate: document.querySelector('#check-out').value,
            noOfNight: parseInt(document.querySelector('#nights').value),
            noOfAdults: parseInt(document.querySelector('#adults').value),
            noOfChildren: parseInt(document.querySelector('#children').value),
            roomType: document.querySelector('input[name="room-type"]:checked').value,
            bedType: document.querySelector('input[name="bed-type"]:checked').value,
            smokingPref: document.querySelector('input[name="smoking"]:checked').value,
            additionalRequest: document.querySelector('#requests').value,
            companions: Array.from(document.querySelectorAll('#companions-tbody tr')).map(row => ({
                compName: row.querySelector('input[name^="companion-name"]').value,
                compContactNo: row.querySelector('input[name^="companion-contact"]').value,
                compEmail: row.querySelector('input[name^="companion-email"]').value,
                compAge: parseInt(row.querySelector('input[name^="companion-age"]').value),
                compSex: row.querySelector('select[name^="companion-sex"]').value
            }))
        };

        fetch('/api/booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
        })
        .then(response => {
            if (!response.ok) throw new Error(response.status);
            return response.json();
        })
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            alert(`Booking successful! Your reservation number is ${data.reservationNo}.`);
            window.location.href = `/booking-confirmation?reservationNo=${data.reservationNo}`;
        })
        .catch(error => {
            console.error('Error submitting booking:', error);
            alert('Failed to create booking. Please try again.');
        });
    });

    // Event Listeners for Summary Updates
    document.querySelectorAll('input[name="room-type"]').forEach(radio => {
        radio.addEventListener('change', updateSummary);
    });

    document.querySelector('#nights').addEventListener('input', updateSummary);
    document.querySelector('#adults').addEventListener('input', updateGuestSummary);
    document.querySelector('#children').addEventListener('input', updateGuestSummary);

    // Initialize Summary
    updateSummary();

    // Handle logout
    const logoutLink = document.querySelector('a[href="/logout"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/logout';
            } catch (error) {
                console.error('Logout error:', error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/logout';
            }
        });
    }
});