document.addEventListener("DOMContentLoaded", function () {
    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileMenuClose = document.querySelector(".mobile-menu-close");

    if (mobileMenuToggle && mobileMenu && mobileMenuClose) {
        mobileMenuToggle.addEventListener("click", function () {
            mobileMenu.classList.add("active");
            document.body.style.overflow = "hidden";
        });

        mobileMenuClose.addEventListener("click", function () {
            mobileMenu.classList.remove("active");
            document.body.style.overflow = "";
        });
    }

    // Tab Functionality
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    if (tabButtons.length > 0 && tabContents.length > 0) {
        tabButtons.forEach((button) => {
            button.addEventListener("click", () => {
                // Remove active class from all buttons and contents
                tabButtons.forEach((btn) => btn.classList.remove("active"));
                tabContents.forEach((content) =>
                    content.classList.remove("active")
                );

                // Add active class to clicked button and corresponding content
                button.classList.add("active");
                const tabId = `${button.dataset.tab}-tab`;
                document.getElementById(tabId).classList.add("active");
            });
        });
    }

    // Booking Form Tabs
    const bookingTabs = document.querySelectorAll(".booking-tab");
    const bookingTabContents = document.querySelectorAll(
        ".booking-tab-content"
    );
    const nextTabButtons = document.querySelectorAll(".next-tab");
    const prevTabButtons = document.querySelectorAll(".prev-tab");

    if (bookingTabs.length > 0 && bookingTabContents.length > 0) {
        bookingTabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                // Remove active class from all tabs and contents
                bookingTabs.forEach((t) => t.classList.remove("active"));
                bookingTabContents.forEach((content) =>
                    content.classList.remove("active")
                );

                // Add active class to clicked tab and corresponding content
                tab.classList.add("active");
                const tabId = `${tab.dataset.tab}-tab`;
                document.getElementById(tabId).classList.add("active");
            });
        });

        // Next tab buttons
        if (nextTabButtons.length > 0) {
            nextTabButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    const nextTabId = button.dataset.next;

                    // Find the tab with the matching data-tab attribute
                    const nextTab = Array.from(bookingTabs).find(
                        (tab) => tab.dataset.tab === nextTabId
                    );

                    if (nextTab) {
                        // Trigger a click on the next tab
                        nextTab.click();
                    }
                });
            });
        }

        // Previous tab buttons
        if (prevTabButtons.length > 0) {
            prevTabButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    const prevTabId = button.dataset.prev;

                    // Find the tab with the matching data-tab attribute
                    const prevTab = Array.from(bookingTabs).find(
                        (tab) => tab.dataset.tab === prevTabId
                    );

                    if (prevTab) {
                        // Trigger a click on the previous tab
                        prevTab.click();
                    }
                });
            });
        }
    }

    // Companions Table
    const addCompanionBtn = document.getElementById("add-companion-btn");
    const companionsTbody = document.getElementById("companions-tbody");

    if (addCompanionBtn && companionsTbody) {
        let companionCount = 0;
        const maxCompanions = 5;

        addCompanionBtn.addEventListener("click", () => {
            if (companionCount < maxCompanions) {
                companionCount++;

                const newRow = document.createElement("tr");
                newRow.innerHTML = `
            <td>[System provided]</td>
            <td><input type="text" placeholder="Full Name" required></td>
            <td><input type="tel" placeholder="Contact" required></td>
            <td><input type="email" placeholder="Email" required></td>
            <td><input type="number" placeholder="Age" min="0" required></td>
            <td>
              <select required>
                <option value="" disabled selected>Sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </td>
            <td>
              <button type="button" class="btn-remove-companion">
                <i class="fas fa-times"></i>
              </button>
            </td>
          `;

                companionsTbody.appendChild(newRow);

                // Add event listener to the remove button
                const removeBtn = newRow.querySelector(".btn-remove-companion");
                removeBtn.addEventListener("click", () => {
                    newRow.remove();
                    companionCount--;

                    // Enable the add button if we're below the max
                    if (companionCount < maxCompanions) {
                        addCompanionBtn.disabled = false;
                    }
                });

                // Disable the add button if we've reached the max
                if (companionCount >= maxCompanions) {
                    addCompanionBtn.disabled = true;
                }
            }
        });
    }

    // Lightbox functionality for gallery
    const lightbox = document.getElementById("lightbox");
    const galleryItems = document.querySelectorAll(".gallery-item");
    const lightboxImage = document.querySelector(".lightbox-image");
    const lightboxTitle = document.querySelector(".lightbox-title");
    const lightboxClose = document.querySelector(".lightbox-close");
    const lightboxPrev = document.querySelector(".lightbox-prev");
    const lightboxNext = document.querySelector(".lightbox-next");

    if (lightbox && galleryItems.length > 0 && lightboxImage && lightboxTitle) {
        let currentCategory = "";
        let currentImageId = 0;
        let galleryImages = [];

        // Open lightbox when clicking on a gallery item
        galleryItems.forEach((item) => {
            item.addEventListener("click", () => {
                currentCategory = item.dataset.category;
                currentImageId = parseInt(item.dataset.id);

                // Get all images from the current category
                galleryImages = Array.from(
                    document.querySelectorAll(
                        `.gallery-item[data-category="${currentCategory}"]`
                    )
                );

                // Set the lightbox image and title
                const img = item.querySelector("img");
                const title = item.querySelector("h3").textContent;

                lightboxImage.src = img.src;
                lightboxImage.alt = img.alt;
                lightboxTitle.textContent = title;

                // Show the lightbox
                lightbox.classList.add("active");
                document.body.style.overflow = "hidden"; // Prevent scrolling
            });
        });

        // Close lightbox
        if (lightboxClose) {
            lightboxClose.addEventListener("click", () => {
                lightbox.classList.remove("active");
                document.body.style.overflow = ""; // Re-enable scrolling
            });
        }

        // Close lightbox when clicking outside the image
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove("active");
                document.body.style.overflow = ""; // Re-enable scrolling
            }
        });

        // Navigate to previous image
        if (lightboxPrev) {
            lightboxPrev.addEventListener("click", () => {
                navigateGallery("prev");
            });
        }

        // Navigate to next image
        if (lightboxNext) {
            lightboxNext.addEventListener("click", () => {
                navigateGallery("next");
            });
        }

        // Keyboard navigation
        document.addEventListener("keydown", (e) => {
            if (!lightbox.classList.contains("active")) return;

            if (e.key === "Escape") {
                lightbox.classList.remove("active");
                document.body.style.overflow = ""; // Re-enable scrolling
            } else if (e.key === "ArrowLeft") {
                navigateGallery("prev");
            } else if (e.key === "ArrowRight") {
                navigateGallery("next");
            }
        });

        // Function to navigate through gallery images
        function navigateGallery(direction) {
            // Find the current image index in the gallery
            const currentIndex = galleryImages.findIndex(
                (item) => parseInt(item.dataset.id) === currentImageId
            );
            let newIndex;

            if (direction === "next") {
                newIndex = (currentIndex + 1) % galleryImages.length;
            } else {
                newIndex =
                    (currentIndex - 1 + galleryImages.length) %
                    galleryImages.length;
            }

            // Update current image ID
            const newItem = galleryImages[newIndex];
            currentImageId = parseInt(newItem.dataset.id);

            // Update lightbox image and title
            const img = newItem.querySelector("img");
            const title = newItem.querySelector("h3").textContent;

            lightboxImage.src = img.src;
            lightboxImage.alt = img.alt;
            lightboxTitle.textContent = title;
        }
    }

    // Facility Gallery Navigation
    const galleryContainer = document.querySelector(
        ".facility-gallery-container"
    );
    const galleryPrev = document.querySelector(".gallery-nav-prev");
    const galleryNext = document.querySelector(".gallery-nav-next");

    if (galleryContainer && galleryPrev && galleryNext) {
        galleryPrev.addEventListener("click", () => {
            galleryContainer.scrollBy({ left: -320, behavior: "smooth" });
        });

        galleryNext.addEventListener("click", () => {
            galleryContainer.scrollBy({ left: 320, behavior: "smooth" });
        });
    }

    // Date picker functionality (simplified version)
    const datePickerButtons = document.querySelectorAll(".date-picker-trigger");
    const datePickers = document.querySelectorAll(".date-picker");

    if (datePickerButtons.length > 0 && datePickers.length > 0) {
        datePickerButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                e.stopPropagation();

                // Get the associated date picker
                const pickerId = button.id.replace("-button", "-picker");
                const picker = document.getElementById(pickerId);

                if (picker) {
                    // Toggle the active class
                    picker.classList.toggle("active");

                    // Close other date pickers
                    datePickers.forEach((dp) => {
                        if (dp.id !== pickerId) {
                            dp.classList.remove("active");
                        }
                    });
                }
            });
        });

        // Close date pickers when clicking outside
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".date-picker-container")) {
                datePickers.forEach((picker) => {
                    picker.classList.remove("active");
                });
            }
        });
    }
});

// Add this to the existing script.js file, inside the DOMContentLoaded event listener

// FAQ Functionality
const faqItems = document.querySelectorAll(".faq-item");
if (faqItems.length > 0) {
    faqItems.forEach((item) => {
        const question = item.querySelector(".faq-question");
        question.addEventListener("click", () => {
            // Toggle active class on the clicked item
            item.classList.toggle("active");

            // Close other FAQ items
            faqItems.forEach((otherItem) => {
                if (otherItem !== item) {
                    otherItem.classList.remove("active");
                }
            });
        });
    });
}
