// auth.js

// 1. Function to Load the Auth HTML and initialize everything
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Fetch the HTML content
        const response = await fetch('auth.html');
        const html = await response.text();
        
        // Inject HTML into the body
        document.body.insertAdjacentHTML('beforeend', html);
        
        // Initialize logic after HTML is injected
        initAuthLogic();
        
    } catch (error) {
        console.error("Error loading auth module:", error);
    }
});

function initAuthLogic() {
    // Get Elements
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const loginLink = document.getElementById('loginLink'); // Valid ID in Navbar
    const registerLink = document.getElementById('registerLink');
    const openLogin = document.getElementById('openLogin');
    const closeButtons = document.querySelectorAll('.modal .close');

    // API Base URL
    const API_BASE = '/QuizB/test/backend';

    // --- CHECK SESSION (Optional: Update UI if user is already logged in) ---
    // You can implement a session check endpoint in PHP later.

    // --- OPEN MODALS ---
    if(loginLink) {
        loginLink.addEventListener('click', (e) => {
            // If already logged in, maybe redirect? For now, just open modal
            // unless we add logic to change the text to "Logout"
            e.preventDefault();
            if(loginLink.textContent !== "Login" && loginLink.textContent !== "Logout") {
               // User is logged in (Simple check based on text replacement below)
               alert("You are already logged in as " + loginLink.textContent);
               return; 
            }
            loginModal.style.display = 'flex';
        });
    }

    if(registerLink) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'none';
            signupModal.style.display = 'flex';
        });
    }

    if(openLogin) {
        openLogin.addEventListener('click', (e) => {
            e.preventDefault();
            signupModal.style.display = 'none';
            loginModal.style.display = 'flex';
        });
    }

    // --- CLOSE MODALS ---
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if(e.target === loginModal) loginModal.style.display = 'none';
        if(e.target === signupModal) signupModal.style.display = 'none';
    });

    // --- PASSWORD TOGGLE ---
    document.querySelectorAll('.inputbox.password-box').forEach(box => {
        const input = box.querySelector('input');
        const toggle = box.querySelector('.toggle-password');

        if(toggle) {
            toggle.addEventListener('click', () => {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                toggle.setAttribute('name', type === 'password' ? 'eye-outline' : 'eye-off-outline');
            });
        }
    });

    // --- LOGIN SUBMISSION ---
    const loginForm = document.getElementById('loginForm');
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.querySelector('#loginForm input[name="username"]').value;
            const password = document.querySelector('#loginForm input[name="password"]').value;

            try {
                const response = await fetch(API_BASE + '/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();

                if (data.status === 'success') {
                    alert('Login successful! Welcome ' + data.user);
                    loginModal.style.display = 'none';
                    loginForm.reset();
                    if(loginLink) loginLink.textContent = data.user; // Update Navbar
                } else {
                    alert('Login failed: ' + data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during login');
            }
        });
    }

    // --- SIGNUP SUBMISSION ---
    const signupForm = document.getElementById('signupForm');
    if(signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.querySelector('#signupForm input[name="username"]').value;
            const email = document.querySelector('#signupForm input[name="email"]').value;
            const password = document.querySelector('#signupForm input[id="signupPassword"]').value;
            const confirmPassword = document.querySelector('#signupForm input[id="confirmPassword"]').value;

            try {
                const response = await fetch(API_BASE + '/register.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password, confirmPassword })
                });
                const data = await response.json();

                if (data.status === 'success') {
                    alert(data.message);
                    signupModal.style.display = 'none';
                    signupForm.reset();
                    loginModal.style.display = 'flex';
                } else {
                    alert('Signup failed: ' + data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during signup');
            }
        });
    }
}