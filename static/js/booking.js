document.addEventListener('DOMContentLoaded', () => {
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
            const requiredFields = document.querySelectorAll('#guest-info-tab input[required], #guest-info-tab select[required]');
            for (let field of requiredFields) {
                if (!field.value) {
                    alert('Please fill out all required fields in Guest Information.');
                    return false;
                }
            }
            return true;
        } else if (tab === 'reservation-details') {
            const checkIn = document.querySelector('#check-in').value;
            const checkOut = document.querySelector('#check-out').value;
            const nights = document.querySelector('#nights').value;
            const adults = document.querySelector('#adults').value;
            if (!checkIn || !checkOut || !nights || !adults) {
                alert('Please fill out all required fields in Reservation Details.');
                return false;
            }
            return true;
        }
        return true; // Room Preferences has no required fields
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
            <td><input type="number" placeholder="Age" name="companion-age-${companionCount}" min="0" required></td>
            <td>
                <select placeholder="Sex" name="companion-sex-${companionCount}" required>
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
            checkOutPicker.set('minDate', new Date(checkInDate.getTime() + 86400000)); // Next day
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

        const prices = {
            'single': 999,
            'double': 1499,
            'suite': 2499,
            'family': 3499
        };
        const nights = document.querySelector('#nights').value || 1;
        const roomValue = document.querySelector('input[name="room-type"]:checked').value;
        const total = prices[roomValue] * nights;
        document.querySelector('.summary-item:last-child span:last-child').textContent = `₱${total.toFixed(2)}`;
    }

    function updateGuestSummary() {
        const adults = document.querySelector('#adults').value || 1;
        const children = document.querySelector('#children').value || 0;
        document.querySelector('#summary-guests').textContent = `${adults} Adult${adults > 1 ? 's' : ''} + ${companionCount} Companion${companionCount !== 1 ? 's' : ''}${children > 0 ? ` + ${children} Child${children > 1 ? 'ren' : ''}` : ''}`;
    }

    // Event Listeners for Summary Updates
    document.querySelectorAll('input[name="room-type"]').forEach(radio => {
        radio.addEventListener('change', updateSummary);
    });

    document.querySelector('#nights').addEventListener('input', updateSummary);
    document.querySelector('#adults').addEventListener('input', updateGuestSummary);
    document.querySelector('#children').addEventListener('input', updateGuestSummary);

    // Initialize Summary
    updateSummary();
});