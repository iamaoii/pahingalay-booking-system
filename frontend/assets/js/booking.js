document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll(".booking-tab");
    const contents = document.querySelectorAll("[data-content]");

    function showContent(target) {
        contents.forEach(content => {
            content.classList.remove("active");
        });

        const targetContent = document.querySelector(`[data-content="${target}"]`);
        if (targetContent) {
            targetContent.classList.add("active");
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener("click", function (e) {
            e.preventDefault();

            tabs.forEach(t => t.classList.remove("active"));
            this.classList.add("active");

            const target = this.getAttribute("data-tab");
            showContent(target);
        });
    });

    // Show default tab
    showContent("guest-information");
});
