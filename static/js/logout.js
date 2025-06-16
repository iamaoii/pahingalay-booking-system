document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.querySelector('#logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (token) {
                    const response = await fetch('/api/logout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Logout failed');
                    }
                }
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/signin';
            } catch (error) {
                console.error('Logout error:', error);
                alert('Failed to log out. Please try again.');
            }
        });
    }
});