document.addEventListener('DOMContentLoaded', () => {
  // Constants for DOM elements
  const navigation = document.querySelector('.navigation');
  const main = document.querySelector('.main');
  const toggle = document.querySelector('.toggle');
  const navList = document.querySelector('.navigation ul');
  const signOutLink = document.querySelector('.navigation a[href="/logout"]');
  const logoLink = document.querySelector('.navigation ul li:first-child a');
  const editInfoBtn = document.querySelector('.edit-info-btn');
  const profileForm = document.querySelector('#profile-form');
  const formActions = document.querySelector('.form-actions');
  const cancelBtn = document.querySelector('.cancel-btn');
  const changePasswordBtn = document.querySelector('.change-password-btn');

  // Initialize default section
  const initializeSections = () => {
    const sections = document.querySelectorAll('.dashboard-section, .profile-section');
    sections.forEach(section => section.classList.remove('active'));
    const activeLink = document.querySelector('.navigation ul li.active a[data-section]');
    if (activeLink) {
      const targetSection = document.querySelector(`.${activeLink.dataset.section}`);
      if (targetSection) targetSection.classList.add('active');
    }
  };

  // Toggle navigation menu
  const toggleMenu = () => {
    if (navigation && main) {
      navigation.classList.toggle('active');
      main.classList.toggle('active');
    }
  };

  // Handle navigation link clicks
  const handleNavClick = (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    // Handle logo click
    if (link === logoLink) {
      e.preventDefault();
      window.location.href = '/';
      return;
    }

    // Handle section links
    const section = link.dataset.section;
    if (!section) return;

    e.preventDefault();
    const li = link.parentElement;
    if (li.classList.contains('active')) return;

    // Update active link
    navList.querySelectorAll('li').forEach(item => item.classList.remove('active'));
    li.classList.add('active');

    // Toggle sections
    const sections = document.querySelectorAll('.dashboard-section, .profile-section');
    sections.forEach(section => section.classList.remove('active'));
    const targetSection = document.querySelector(`.${section}`);
    if (targetSection) targetSection.classList.add('active');
  };

  // Handle navigation hover
  const handleNavHover = (e) => {
    const li = e.target.closest('li:not(:first-child)');
    if (!li) return;

    navList.querySelectorAll('li').forEach(item => item.classList.remove('hovered'));
    if (e.type === 'mouseover') li.classList.add('hovered');
  };

  // Handle sign-out
  const handleSignOut = async (e) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to sign out?')) return;

    try {
      const response = await fetch('/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Logout failed');
      localStorage.clear();
      window.location.href = '/signin';
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      window.location.href = '/signin';
    }
  };

  // Toggle edit mode
  const toggleEditMode = (enable) => {
    const inputs = profileForm.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.disabled = !enable;
    });
    formActions.style.display = enable ? 'flex' : 'none';
    editInfoBtn.style.display = enable ? 'none' : 'block';
  };

  // Handle edit information
  const handleEditInfo = () => {
    toggleEditMode(true);
  };

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(profileForm);
    const data = Object.fromEntries(formData);
    console.log('Profile updated:', data); // Simulate saving to backend
    toggleEditMode(false);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    toggleEditMode(false);
    profileForm.reset();
  };

  // Handle change password
  const handleChangePassword = () => {
    alert('Change Password functionality to be implemented.');
  };

  // Attach event listeners
  if (toggle) toggle.addEventListener('click', toggleMenu);
  if (navList) {
    navList.addEventListener('click', handleNavClick);
    navList.addEventListener('mouseover', handleNavHover);
    navList.addEventListener('mouseout', handleNavHover);
  }
  if (signOutLink) signOutLink.addEventListener('click', handleSignOut);
  if (editInfoBtn) editInfoBtn.addEventListener('click', handleEditInfo);
  if (profileForm) profileForm.addEventListener('submit', handleFormSubmit);
  if (cancelBtn) cancelBtn.addEventListener('click', handleCancelEdit);
  if (changePasswordBtn) changePasswordBtn.addEventListener('click', handleChangePassword);

  // Initialize
  initializeSections();

  // Warn if critical elements are missing
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
});