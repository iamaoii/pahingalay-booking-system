document.addEventListener('DOMContentLoaded', () => {
    const viewButtons = document.querySelectorAll('.action-btn.view');
    const statusButtons = document.querySelectorAll('.action-btn.status');

    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            alert('Viewing booking details... (Placeholder)');
        });
    });

    statusButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('confirmed')) {
                button.textContent = 'Pending';
                button.classList.remove('confirmed');
                button.classList.add('pending');
            } else if (button.classList.contains('pending')) {
                button.textContent = 'Confirmed';
                button.classList.remove('pending');
                button.classList.add('confirmed');
            }
        });
    });

    const logoutButton = document.querySelector('.profile-btn.logout');
    logoutButton.addEventListener('click', () => {
        alert('Logging out... (Placeholder)');
        // Add logout logic here (e.g., redirect to signin page)
        window.location.href = '/signin';
    });
});