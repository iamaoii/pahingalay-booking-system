document.addEventListener('DOMContentLoaded', () => {
  const navigation = document.querySelector('.navigation');
  const main = document.querySelector('.main');
  const toggle = document.querySelector('.toggle');
  const navList = document.querySelector('.navigation ul');
  const signOutLink = document.querySelector('.navigation a[href="/logout"]');
  const logoLink = document.querySelector('.navigation ul li:first-child a');
  const editInfoBtn = document.querySelector('.edit-info-btn');
  const profileForm = document.querySelector('#profile-form');
  const formActions = document.querySelector('.form-actions');
  const saveBtn = document.querySelector('.save-btn');
  const cancelBtn = document.querySelector('.cancel-btn');
  const changePasswordBtn = document.querySelector('.change-password-btn');
  const userIdInput = document.querySelector('#user-id');
  const bookingModal = document.querySelector('#booking-modal');
  const bookingForm = document.querySelector('#booking-form');
  const modalClose = document.querySelector('.modal-close');
  const modalActions = document.querySelector('.modal-actions');
  const modalSaveBtn = document.querySelector('.modal-save-btn');
  const modalCancelBtn = document.querySelector('.modal-cancel-btn');
  const editBookingBtn = document.querySelector('.edit-booking-btn');

  const initializeSections = () => {
    const sections = document.querySelectorAll('.dashboard-section, .profile-section');
    sections.forEach(section => section.classList.remove('active'));
    const activeLink = document.querySelector('.navigation ul li.active a[data-section]');
    if (activeLink) {
        const targetSection = document.querySelector(`.${activeLink.dataset.section}`);
        if (targetSection) targetSection.classList.add('active');
    }
    if (document.querySelector('.profile-section.active')) {
        loadProfileData();
    }
    if (document.querySelector('.dashboard-section.active')) {
        loadBookingList();
    }
  };

  const toggleMenu = () => {
    if (navigation && main) {
      navigation.classList.toggle('active');
      main.classList.toggle('active');
    }
  };

  const handleNavClick = (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    if (link === logoLink) {
      e.preventDefault();
      window.location.href = '/';
      return;
    }

    const section = link.dataset.section;
    if (!section) return;

    e.preventDefault();
    const li = link.parentElement;
    if (li.classList.contains('active')) return;

    navList.querySelectorAll('li').forEach(item => item.classList.remove('active'));
    li.classList.add('active');

    const sections = document.querySelectorAll('.dashboard-section, .profile-section');
    sections.forEach(section => section.classList.remove('active'));
    const targetSection = document.querySelector(`.${section}`);
    if (targetSection) targetSection.classList.add('active');
    if (section === 'profile-section') {
      loadProfileData();
    } else if (section === 'dashboard-section') {
      loadBookingList();
    }
  };

  const handleNavHover = (e) => {
    const li = e.target.closest('li:not(:first-child)');
    if (!li) return;

    navList.querySelectorAll('li').forEach(item => item.classList.remove('hovered'));
    if (e.type === 'mouseover') li.classList.add('hovered');
  };

  const handleSignOut = async (e) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to sign out?')) return;

    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Logout failed');
      localStorage.clear();
      window.location.href = '/signin';
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      window.location.href = '/signin';
    }
  };

  const toggleEditMode = (enable) => {
    if (!profileForm || !formActions || !editInfoBtn) return;
    const inputs = profileForm.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.disabled = !enable;
    });
    formActions.style.display = enable ? 'flex' : 'none';
    editInfoBtn.style.display = enable ? 'none' : 'block';
  };

  const loadProfileData = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }

    try {
      const response = await fetch('/api/guest-profile', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Failed to fetch profile: ${response.status}`);
      const data = await response.json();
      userIdInput.value = data.guestID || '';
      profileForm.querySelector('#full-name').value = data.guestName || '';
      profileForm.querySelector('#email').value = data.guestEmail || '';
      profileForm.querySelector('#contact-number').value = data.guestContactNo || '';
      profileForm.querySelector('#age').value = data.guestAge || '';
      profileForm.querySelector('#nationality').value = data.nationality || '';
      profileForm.querySelector('#address').value = data.address || '';
      profileForm.querySelector('#sex').value = data.guestSex || 'M';
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No token available');
      return;
    }

    const formData = new FormData(profileForm);
    const data = {
      guestName: formData.get('guestName'),
      guestEmail: formData.get('guestEmail'),
      guestContactNo: formData.get('guestContactNo'),
      guestAge: parseInt(formData.get('guestAge')),
      nationality: formData.get('nationality'),
      address: formData.get('address'),
      guestSex: formData.get('guestSex')
    };

    try {
      const response = await fetch('/api/update-guest-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`Failed to update profile: ${response.status}`);
      toggleEditMode(false);
      loadProfileData();
      alert('Profile updated successfully.');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  const handleCancelEdit = () => {
    toggleEditMode(false);
    loadProfileData();
  };

  const handleChangePassword = () => {
    alert('Change Password functionality to be implemented.');
  };

  const toggleBookingModal = (show) => {
    if (bookingModal) {
      bookingModal.classList.toggle('active', show);
      document.body.classList.toggle('modal-open', show);
    }
  };

  const toggleBookingEditMode = (enable) => {
    if (!bookingForm || !modalActions || !editBookingBtn) return;
    const inputs = bookingForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.id !== 'modal-total' && input.id !== 'reservation-no') {
        input.disabled = !enable;
      }
    });
    const companionInputs = document.querySelectorAll('#modal-companions-tbody input, #modal-companions-tbody select');
    companionInputs.forEach(input => {
      input.disabled = !enable;
    });
    modalActions.style.display = enable ? 'flex' : 'none';
    editBookingBtn.style.display = enable ? 'none' : 'block';
  };

  const loadBookingList = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Failed to fetch bookings: ${response.status}`);
      const bookings = await response.json();
      const bookingList = document.querySelector('.booking-list');
      bookingList.innerHTML = '';

      // Update card box
      const totalBooking = bookings.length;
      const nightStayed = bookings
        .filter(booking => new Date(booking.checkOutDate) < new Date())
        .reduce((sum, booking) => sum + booking.noOfNight, 0);
      const totalSpent = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

      document.querySelector('#total-booking').textContent = totalBooking;
      document.querySelector('#night-stayed').textContent = nightStayed;
      document.querySelector('#total-spent').textContent = `₱${totalSpent.toFixed(2)}`;

      if (bookings.length === 0) {
        bookingList.innerHTML = '<p>No bookings found.</p>';
        return;
      }

      bookings.forEach(booking => {
        const bookingItem = document.createElement('div');
        bookingItem.classList.add('booking-item');
        bookingItem.dataset.reservationNo = booking.reservationNo;
        bookingItem.innerHTML = `
          <span class="detail-label">Reservation ID:</span>
          <h3 class="reservation-id">${booking.reservationNo}</h3>
          <div class="booking-details">
            <div>
              <span class="detail-label">Room Type</span>
              <span class="detail-value">${booking.roomType.charAt(0).toUpperCase() + booking.roomType.slice(1)}</span>
            </div>
            <div>
              <span class="detail-label">Check-in</span>
              <span class="detail-value">${booking.checkInDate}</span>
            </div>
            <div>
              <span class="detail-label">Check-out</span>
              <span class="detail-value">${booking.checkOutDate}</span>
            </div>
            <div>
              <span class="detail-label">Total</span>
              <span class="detail-value">₱${booking.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          <div class="action-row">
            <span class="status-${booking.status.toLowerCase()}">${booking.status}</span>
            <button class="view-button">View</button>
            <button class="button-delete">Delete</button>
          </div>
        `;
        bookingList.appendChild(bookingItem);
      });

      document.querySelectorAll('.view-button').forEach(button => {
        button.addEventListener('click', handleViewBooking);
      });
      document.querySelectorAll('.button-delete').forEach(button => {
        button.addEventListener('click', handleDeleteBooking);
      });
    } catch (error) {
      console.error('Error loading bookings:', error);
      alert('Failed to load bookings.');
    }
  };

  const loadBookingDetails = async (reservationNo) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await fetch(`/api/booking/${reservationNo}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Failed to fetch booking: ${response.status}`);
      const booking = await response.json();

      console.log('Booking data:', booking); // Debug API response

      document.querySelector('#reservation-no').value = booking.reservationNo || '';

      // Normalize and set roomType
      const roomTypeSelect = document.querySelector('#modal-room-type');
      const roomType = booking.roomType ? booking.roomType.toLowerCase() : 'single';
      roomTypeSelect.value = ['single', 'double', 'suite', 'family'].includes(roomType) ? roomType : 'single';
      console.log('Room Type set to:', roomTypeSelect.value);

      // Normalize and set bedType
      const bedTypeSelect = document.querySelector('#modal-bed-type');
      const bedType = booking.bedType ? booking.bedType.toLowerCase() : 'twin';
      bedTypeSelect.value = ['twin', 'queen', 'king'].includes(bedType) ? bedType : 'twin';
      console.log('Bed Type set to:', bedTypeSelect.value);

      // Normalize and set smokingPref
      const smokingSelect = document.querySelector('#modal-smoking');
      const smokingPref = booking.smokingPref ? booking.smokingPref.toLowerCase() : 'non-smoking';
      smokingSelect.value = ['non-smoking', 'smoking'].includes(smokingPref) ? smokingPref : 'non-smoking';
      console.log('Smoking Preference set to:', smokingSelect.value);

      document.querySelector('#modal-check-in').value = booking.checkInDate || '';
      document.querySelector('#modal-check-out').value = booking.checkOutDate || '';
      document.querySelector('#modal-nights').value = booking.noOfNight || 1;
      document.querySelector('#modal-adults').value = booking.noOfAdults || 1;
      document.querySelector('#modal-children').value = booking.noOfChildren || 0;
      document.querySelector('#modal-requests').value = booking.additionalReq || '';
      document.querySelector('#modal-total').value = booking.totalAmount ? `₱${booking.totalAmount.toFixed(2)}` : '₱0.00';

      const companionsTbody = document.querySelector('#modal-companions-tbody');
      companionsTbody.innerHTML = '';
      (booking.companions || []).forEach((companion, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index + 1}</td>
          <td><input type="text" name="companion-name-${index}" value="${companion.compName || ''}" disabled></td>
          <td><input type="tel" name="companion-contact-${index}" value="${companion.compContactNo || ''}" disabled></td>
          <td><input type="email" name="companion-email-${index}" value="${companion.compEmail || ''}" disabled></td>
          <td><input type="number" name="companion-age-${index}" value="${companion.compAge || 0}" min="0" max="120" disabled></td>
          <td>
            <select name="companion-sex-${index}" disabled>
              <option value="M" ${companion.compSex === 'M' ? 'selected' : ''}>Male</option>
              <option value="F" ${companion.compSex === 'F' ? 'selected' : ''}>Female</option>
              <option value="O" ${companion.compSex === 'O' ? 'selected' : ''}>Other</option>
            </select>
          </td>
        `;
        companionsTbody.appendChild(row);
      });

      toggleBookingModal(true);
      toggleBookingEditMode(false);
    } catch (error) {
      console.error('Error loading booking details:', error);
      alert('Failed to load booking details.');
    }
  };

  const handleViewBooking = (e) => {
    const bookingItem = e.target.closest('.booking-item');
    const reservationNo = bookingItem.dataset.reservationNo;
    loadBookingDetails(reservationNo);
  };

  const handleDeleteBooking = async (e) => {
    const bookingItem = e.target.closest('.booking-item');
    const reservationNo = bookingItem.dataset.reservationNo;
    if (!confirm(`Are you sure you want to delete reservation ${reservationNo}?`)) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await fetch(`/api/booking/${reservationNo}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Failed to delete booking: ${response.status}`);
      bookingItem.remove();
      loadBookingList(); // Refresh card box and list
      alert('Booking deleted successfully.');
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking.');
    }
  };

  const handleBookingFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No token found');
      return;
    }

    const formData = new FormData(bookingForm);
    const companions = Array.from(document.querySelectorAll('#modal-companions-tbody tr')).map((row, index) => ({
      compName: row.querySelector(`input[name="companion-name-${index}"]`).value,
      compContactNo: row.querySelector(`input[name="companion-contact-${index}"]`).value,
      compEmail: row.querySelector(`input[name="companion-email-${index}"]`).value,
      compAge: parseInt(row.querySelector(`input[name="companion-age-${index}"]`).value),
      compSex: row.querySelector(`select[name="companion-sex-${index}"]`).value
    }));

    const data = {
      reservationNo: formData.get('reservationNo'),
      checkInDate: formData.get('checkInDate'),
      checkOutDate: formData.get('checkOutDate'),
      noOfNight: parseInt(formData.get('noOfNight')),
      noOfAdults: parseInt(formData.get('noOfAdults')),
      noOfChildren: parseInt(formData.get('noOfChildren')),
      roomType: formData.get('roomType'),
      bedType: formData.get('bedType'),
      smokingPref: formData.get('smokingPref'),
      additionalReq: formData.get('additionalReq'),
      companions
    };

    try {
      const response = await fetch(`/api/booking/${data.reservationNo}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`Failed to update booking: ${response.status}`);
      toggleBookingEditMode(false);
      toggleBookingModal(false);
      loadBookingList();
      alert('Booking updated successfully.');
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking.');
    }
  };

  const handleModalClose = () => {
    toggleBookingModal(false);
    toggleBookingEditMode(false);
  };

  const handleModalCancel = () => {
    toggleBookingEditMode(false);
    loadBookingDetails(document.querySelector('#reservation-no').value);
  };

  const handleEditBooking = () => {
    toggleBookingEditMode(true);
  };

  if (toggle) toggle.addEventListener('click', toggleMenu);
  if (navList) {
    navList.addEventListener('click', handleNavClick);
    navList.addEventListener('mouseover', handleNavHover);
    navList.addEventListener('mouseout', handleNavHover);
  }
  if (signOutLink) signOutLink.addEventListener('click', handleSignOut);
  if (editInfoBtn) editInfoBtn.addEventListener('click', () => toggleEditMode(true));
  if (profileForm) profileForm.addEventListener('submit', handleFormSubmit);
  if (cancelBtn) cancelBtn.addEventListener('click', handleCancelEdit);
  if (changePasswordBtn) changePasswordBtn.addEventListener('click', handleChangePassword);
  if (saveBtn) saveBtn.addEventListener('click', handleFormSubmit);
  if (modalClose) modalClose.addEventListener('click', handleModalClose);
  if (bookingForm) bookingForm.addEventListener('submit', handleBookingFormSubmit);
  if (modalCancelBtn) modalCancelBtn.addEventListener('click', handleModalCancel);
  if (editBookingBtn) editBookingBtn.addEventListener('click', handleEditBooking);

  initializeSections();

  const preloader = document.querySelector("[data-preaload]");
  window.addEventListener("load", function () {
    preloader.classList.add("loaded");
    document.body.classList.add("loaded");
  });
});