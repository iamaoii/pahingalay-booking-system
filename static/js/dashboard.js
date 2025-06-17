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
  const saveBtn = document.querySelector('.save-btn'); // Explicitly target save button
  const cancelBtn = document.querySelector('.cancel-btn');
  const changePasswordBtn = document.querySelector('.change-password-btn');
  const userIdInput = document.querySelector('#user-id');

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
    if (enable) {
      console.log('Edit mode enabled');
    } else {
      console.log('Edit mode disabled');
    }
  };

  const loadProfileData = async () => {
    console.log('Loading profile data...');
    console.log('profileForm:', profileForm);
    const token = localStorage.getItem('authToken');
    console.log('Token:', token);
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }
    if (!profileForm) {
      console.error('Profile form not found in DOM');
      return;
    }

    try {
      const response = await fetch('/api/guest-profile', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
      const data = await response.json();
      console.log('Profile Data Received:', data);
      userIdInput.value = data.guestID || '';
      profileForm.querySelector('#full-name').value = data.guestName || '';
      profileForm.querySelector('#email').value = data.guestEmail || '';
      profileForm.querySelector('#contact-number').value = data.guestContactNo || '';
      profileForm.querySelector('#age').value = data.guestAge || '';
      profileForm.querySelector('#nationality').value = data.nationality || '';
      profileForm.querySelector('#address').value = data.address || '';
      profileForm.querySelector('#sex').value = data.guestSex || 'male';
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form...');
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
    console.log('Form Data to Send:', data);

    try {
      const response = await fetch('/api/update-guest-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update Error:', response.status, errorText);
        throw new Error(`Failed to update profile: ${response.status}`);
      }
      const result = await response.json();
      console.log('Update Response:', result);
      toggleEditMode(false);
      loadProfileData();
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancelEdit = () => {
    toggleEditMode(false);
    loadProfileData();
    console.log('Edit cancelled, reloading data');
  };

  const handleChangePassword = () => {
    alert('Change Password functionality to be implemented.');
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
  if (saveBtn) saveBtn.addEventListener('click', handleFormSubmit); // Ensure save button triggers submit

  initializeSections();

  if (!navigation) console.warn('Navigation element not found.');
  if (!main) console.warn('Main element not found.');
  if (!toggle) console.warn('Toggle element not found.');
  if (!navList) console.warn('Navigation list not found.');
  if (!signOutLink) console.warn('Sign Out link not found.');
  if (!logoLink) console.warn('Logo link not found.');
  if (!editInfoBtn) console.warn('Edit Info button not found.');
  if (!profileForm) console.warn('Profile form not found.');
  if (!cancelBtn) console.warn('Cancel button not found.');
  if (!changePasswordBtn) console.warn('Change Password button not found.');
  if (!saveBtn) console.warn('Save button not found.');

  if (document.querySelector('.profile-section.active')) loadProfileData();
});

/**
 * PRELOAD
 * * loading will be end after document is loaded
 */

const preloader = document.querySelector("[data-preaload]");

window.addEventListener("load", function () {
  preloader.classList.add("loaded");
  document.body.classList.add("loaded");
});