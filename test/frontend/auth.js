// Load the Auth HTML and initialize everything
document.addEventListener("DOMContentLoaded", async () => {                                         // Ensures current page which ever it maybe is loaded fully.
    try {
        // Fetch the HTML content
        const response = await fetch('auth.html');                                                  // Get the auth.html wait until its downloaded.
        const html = await response.text();                                                         // Convert the recieved file into text so that we can insert into the page.
        
        // Inject HTML into the body
        document.body.insertAdjacentHTML('beforeend', html);                                        // Inserts the auth.html at end of the current page's body.                                  // 
        
        // Initialize logic after HTML is injected
        initAuthLogic();                                                                            // Run the main sript function after evrything is loaded successfully.
        
    } catch (error) {
        console.error("Error loading auth module:", error);
    }
});

function initAuthLogic() {
    // Get Elements
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const loginLink = document.getElementById('loginLink');                                         // login ID in Navbar
    const registerLink = document.getElementById('registerLink');
    const openLogin = document.getElementById('openLogin');
    const closeButtons = document.querySelectorAll('.modal .close');

    // API Base URL
    const API_BASE = '/QuizB/test/backend';                                                         // Simple alias for the folder strucutre to accomadate future directory chnages easily.

    // --- SESSION / REMEMBER ME CHECK ---
    // Check if username exists in sessionStorage or cookie
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    const rememberedUser = getCookie('quizb_user');
    if(rememberedUser) {
        if(loginLink) loginLink.textContent = rememberedUser;
    }

    // --- OPEN MODALS ---
    if(loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            if(loginLink.textContent !== "Login" && loginLink.textContent !== "Logout") {           // Check is user is logged in or not.
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
            const modal = btn.closest('.modal');
            modal.style.display = 'none';                                                           // .closet goes upward the DOM tree and return the first ancestor that matches the selector .modal. Stops searching after it finds the first match so it works only on model boxes.
            
            // FIXED: Reset forget password forms when closing modal
            if(modal.id === 'forgetPasswordModal') {
                const forgetForm = document.getElementById('forgetPasswordForm');
                const resetForm = document.getElementById('resetPasswordForm');
                if(forgetForm) forgetForm.style.display = 'block';                                  // Show email form
                if(resetForm) resetForm.style.display = 'none';                                     // Hide reset form
            }
        });
    });

    window.addEventListener('click', (e) => {                                                       // Makes the modal boxes disapear if a click is detected outside of the modal boxes.
        if(e.target === loginModal) loginModal.style.display = 'none';
        if(e.target === signupModal) signupModal.style.display = 'none';
        
        // FIXED: Reset forget password forms when clicking outside
        if(e.target.id === 'forgetPasswordModal') {
            const forgetForm = document.getElementById('forgetPasswordForm');
            const resetForm = document.getElementById('resetPasswordForm');
            e.target.style.display = 'none';
            if(forgetForm) forgetForm.style.display = 'block';                                      // Show email form
            if(resetForm) resetForm.style.display = 'none';                                         // Hide reset form
        }
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
            const rememberMe = document.querySelector('#loginForm input[type="checkbox"]').checked;   // REMEMBER ME CHECK

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
                    if(loginLink) loginLink.textContent = data.user;                                    // Update Navbar ie change the Login text into the username.

                    // --- REMEMBER ME COOKIE ---
                    if(rememberMe){
                        document.cookie = `quizb_user=${data.user}; path=/; max-age=${60*60*24*30}`;   // 30 days
                    } else {
                        document.cookie = `quizb_user=${data.user}; path=/`;                            // Session cookie only
                    }

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

    // --- LOGOUT BUTTON ---
    const logoutButtons = document.querySelectorAll('.logout');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const res = await fetch(`${API_BASE}/logout.php`);
                const data = await res.json();
                if(data.status === 'success') {
                    alert(data.message);
                    // Reset login text
                    if(loginLink) loginLink.textContent = 'Login';
                    // Remove remember me cookie
                    document.cookie = 'quizb_user=; path=/; max-age=0';
                    location.reload(); // Refresh page to reflect changes
                } else {
                    alert('Logout failed');
                }
            } catch(err) {
                console.error(err);
                alert('Error during logout');
            }
        });
    });

    // --- FORGET PASSWORD FLOW ---
    const forgetForm = document.getElementById('forgetPasswordForm');
    const resetForm = document.getElementById('resetPasswordForm');
    const forgetPasswordModal = document.getElementById('forgetPasswordModal');

    if(forgetForm){
        forgetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = forgetForm.email.value;

            try {
                const res = await fetch(`${API_BASE}/password_reset.php`, {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({ email })
                });
                const data = await res.json();                                                      // FIXED: Parse as JSON instead of text
                console.log(data);                                                                  // Log the parsed data
                alert(data.message);                                                                // Show message to user

                if(data.status === 'success'){                                                      // Now 'data' is properly defined
                    forgetForm.style.display = 'none';
                    resetForm.style.display = 'block';
                    resetForm.dataset.userEmail = email;                                            // store email for next step
                }
            } catch(err) {
                console.error(err);
                alert('Error sending reset code');
            }
        });
    }

    if(resetForm){
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = resetForm.dataset.userEmail;
            const code = resetForm.reset_code.value;
            const newPassword = resetForm.new_password.value;
            const confirmPassword = resetForm.confirm_password.value;

            if(newPassword !== confirmPassword){
                alert("Passwords do not match");
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/password_reset.php`, {
                    method: 'PUT',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({ email, code, newPassword })
                });
                const data = await res.json();
                alert(data.message);
                if(data.status === 'success'){
                    resetForm.reset();
                    resetForm.style.display = 'none';
                    forgetForm.style.display = 'block';
                    forgetPasswordModal.style.display = 'none';
                }
            } catch(err) {
                console.error(err);
                alert('Error resetting password');
            }
        });
    }

    // Attach click event for "Forget Password" link in login modal
    const forgetLink = loginModal.querySelector('.forget a');
    if(forgetLink){
        forgetLink.addEventListener('click', (e)=>{
            e.preventDefault();
            loginModal.style.display = 'none';
            forgetPasswordModal.style.display = 'flex';
            
            // FIXED: Ensure email form is shown and reset form is hidden when opening
            if(forgetForm) forgetForm.style.display = 'block';
            if(resetForm) resetForm.style.display = 'none';
        });
    }

} // END initAuthLogic