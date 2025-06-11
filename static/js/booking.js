document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll(".booking-tab");
    const contents = document.querySelectorAll("[data-content]");
    const nextButtons = document.querySelectorAll(".next-tab");

    function showContentByIndex(index) {
        tabs.forEach((tab, i) => {
            tab.classList.toggle("active", i === index);
            contents[i].classList.toggle("active", i === index);
        });
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", function (e) {
            e.preventDefault();
            showContentByIndex(index);
        });
    });

    nextButtons.forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();

            const currentIndex = [...contents].findIndex((el) => el.classList.contains("active"));
            const nextIndex = currentIndex + (btn.classList.contains("btn-secondary") ? -1 : 1);

            if (nextIndex >= 0 && nextIndex < contents.length) {
                showContentByIndex(nextIndex);
            }
        });
    });

    showContentByIndex(0);
});
