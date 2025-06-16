// add hovered class to selected list item
let list = document.querySelectorAll(".navigation li");

function activeLink() {
  list.forEach((item) => {
    item.classList.remove("hovered");
  });
  this.classList.add("hovered");
}

list.forEach((item) => item.addEventListener("mouseover", activeLink));

// Menu Toggle
let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

toggle.onclick = function () {
  navigation.classList.toggle("active");
  main.classList.toggle("active");
};

// Ensure AuthHandler is defined before using it
if (typeof AuthHandler === 'undefined') {
  console.error("AuthHandler class not found. Ensure auth.js is loaded.");
}

// Add event listener to the Sign Out link
const signOutLink = document.querySelector('.navigation a[href="/logout"]');
if (signOutLink) {
  signOutLink.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent default link behavior
      if (confirm('Are you sure you want to sign out?')) {
          try {
              new AuthHandler().logout();
          } catch (error) {
              console.error("Logout failed:", error);
              localStorage.clear();
              window.location.href = '/signin';
          }
      }
  });
} else {
  console.warn("Sign Out link not found in navigation.");
}