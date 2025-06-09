'use strict';



/**
 * PRELOAD
 * * loading will be end after document is loaded
 */

const preloader = document.querySelector("[data-preaload]");

window.addEventListener("load", function () {
  preloader.classList.add("loaded");
  document.body.classList.add("loaded");
});



/**
 * add event listener on multiple elements
 */

const addEventOnElements = function (elements, eventType, callback) {
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener(eventType, callback);
  }
}



/**
 * NAVBAR
 */

const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.classList.toggle("nav-active");
}

addEventOnElements(navTogglers, "click", toggleNavbar);



/**
 * HEADER & BACK TOP BTN
 */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

let lastScrollPos = 0;

const hideHeader = function () {
  const isScrollBottom = lastScrollPos < window.scrollY;
  if (isScrollBottom) {
    header.classList.add("hide");
  } else {
    header.classList.remove("hide");
  }

  lastScrollPos = window.scrollY;
}

window.addEventListener("scroll", function () {
  if (window.scrollY >= 50) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
    hideHeader();
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
});



/**
 * HERO SLIDER
 */

const heroSlider = document.querySelector("[data-hero-slider]");
const heroSliderItems = document.querySelectorAll("[data-hero-slider-item]");
const heroSliderPrevBtn = document.querySelector("[data-prev-btn]");
const heroSliderNextBtn = document.querySelector("[data-next-btn]");

let currentSlidePos = 0;
let lastActiveSliderItem = heroSliderItems[0];

const updateSliderPos = function () {
  lastActiveSliderItem.classList.remove("active");
  heroSliderItems[currentSlidePos].classList.add("active");
  lastActiveSliderItem = heroSliderItems[currentSlidePos];
}

const slideNext = function () {
  if (currentSlidePos >= heroSliderItems.length - 1) {
    currentSlidePos = 0;
  } else {
    currentSlidePos++;
  }

  updateSliderPos();
}

heroSliderNextBtn.addEventListener("click", slideNext);

const slidePrev = function () {
  if (currentSlidePos <= 0) {
    currentSlidePos = heroSliderItems.length - 1;
  } else {
    currentSlidePos--;
  }

  updateSliderPos();
}

heroSliderPrevBtn.addEventListener("click", slidePrev);

/**
 * auto slide
 */

let autoSlideInterval;

const autoSlide = function () {
  autoSlideInterval = setInterval(function () {
    slideNext();
  }, 7000);
}

addEventOnElements([heroSliderNextBtn, heroSliderPrevBtn], "mouseover", function () {
  clearInterval(autoSlideInterval);
});

addEventOnElements([heroSliderNextBtn, heroSliderPrevBtn], "mouseout", autoSlide);

window.addEventListener("load", autoSlide);



/**
 * PARALLAX EFFECT
 */

const parallaxItems = document.querySelectorAll("[data-parallax-item]");

let x, y;

window.addEventListener("mousemove", function (event) {

  x = (event.clientX / window.innerWidth * 10) - 5;
  y = (event.clientY / window.innerHeight * 10) - 5;

  // reverse the number eg. 20 -> -20, -5 -> 5
  x = x - (x * 2);
  y = y - (y * 2);

  for (let i = 0, len = parallaxItems.length; i < len; i++) {
    x = x * Number(parallaxItems[i].dataset.parallaxSpeed);
    y = y * Number(parallaxItems[i].dataset.parallaxSpeed);
    parallaxItems[i].style.transform = `translate3d(${x}px, ${y}px, 0px)`;
  }

});


/**
 * AUTH MODAL (Sign In/Sign Up Popup)
 */

const authModal = document.getElementById('authModal');
const openModalBtn = document.querySelector('[data-modal-open]');
const closeModalBtn = authModal.querySelector('[data-modal-close]');
const tabButtons = authModal.querySelectorAll('.tab-button');
const formSections = authModal.querySelectorAll('.form-section');
const toggleLinks = authModal.querySelectorAll('[data-toggle-tab]');

// Function to open the modal
const openModal = function (event) {
  event.preventDefault(); // Prevent default link behavior if applicable
  authModal.classList.add('active');
  document.body.classList.add('modal-open'); // Add class to body to prevent scrolling
}

// Function to close the modal
const closeModal = function () {
  authModal.classList.remove('active');
  document.body.classList.remove('modal-open'); // Remove class from body
}

// Function to switch between Sign In and Sign Up tabs
const switchAuthTab = function (targetTabId) {
  // Deactivate all tab buttons and form sections
  tabButtons.forEach(button => button.classList.remove('active'));
  formSections.forEach(section => section.classList.remove('active'));

  // Activate the target tab button and form section
  const targetButton = authModal.querySelector(`.tab-button[data-tab-target="${targetTabId}"]`);
  const targetSection = authModal.querySelector(`#${targetTabId}-form`);

  if (targetButton && targetSection) {
    targetButton.classList.add('active');
    targetSection.classList.add('active');
  }
}

// Event Listeners for modal
if (openModalBtn) {
  openModalBtn.addEventListener('click', openModal);
}
if (closeModalBtn) {
  closeModalBtn.addEventListener('click', closeModal);
}

// Close modal when clicking outside the modal content
if (authModal) {
  authModal.addEventListener('click', function (event) {
    if (event.target === authModal) {
      closeModal();
    }
  });
}

// Event Listeners for tab switching
tabButtons.forEach(button => {
  button.addEventListener('click', function () {
    const targetTabId = this.dataset.tabTarget;
    switchAuthTab(targetTabId);
  });
});

// Event Listeners for toggle links (e.g., "Don't have an account? Sign Up")
toggleLinks.forEach(link => {
  link.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent default link behavior
    const targetTabId = this.dataset.toggleTab;
    switchAuthTab(targetTabId);
  });
});

// Ensure initial state is Sign In form when modal opens
// This function will be called when the modal is opened via the openModal function.
// For the initial load, it's good practice to set one form as active in HTML.
// I've already set 'signin-form' as 'active' in the HTML.
