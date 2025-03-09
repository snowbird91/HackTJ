

document.addEventListener('DOMContentLoaded', function () {
    console.log("Initializing auth UI");


    if (typeof window.auth === 'undefined') {
        console.error("Auth module not loaded - cannot initialize UI");
        return;
    }


    const createAuthUI = () => {
        console.log("Creating auth UI elements");
        const authContainer = document.createElement('div');
        authContainer.id = 'auth-container';
        authContainer.innerHTML = `
      <div id="auth-modal" class="modal">
        <div class="modal-content">
          <span id="auth-close-btn" class="close-btn">&times;</span>
          <div id="auth-tabs">
            <button id="login-tab" class="auth-tab-btn active">Login</button>
            <button id="register-tab" class="auth-tab-btn">Register</button>
          </div>
          <div id="login-form" class="auth-form">
            <h2>Welcome Back!</h2>
            <div class="form-group">
              <label for="login-email">Email</label>
              <input type="email" id="login-email" placeholder="Enter your email">
            </div>
            <div class="form-group">
              <label for="login-password">Password</label>
              <input type="password" id="login-password" placeholder="Enter your password">
              <div class="error-message" id="login-error"></div>
            </div>
            <button id="login-button" class="btn">Login</button>
          </div>
          <div id="register-form" class="auth-form" style="display: none;">
            <h2>Create an Account</h2>
            <div class="form-group">
              <label for="register-email">Email</label>
              <input type="email" id="register-email" placeholder="Enter your email">
            </div>
            <div class="form-group">
              <label for="register-username">Username</label>
              <input type="text" id="register-username" placeholder="Choose a username">
            </div>
            <div class="form-group">
              <label for="register-password">Password</label>
              <input type="password" id="register-password" placeholder="Choose a password">
            </div>
            <div class="form-group">
              <label for="register-confirm-password">Confirm Password</label>
              <input type="password" id="register-confirm-password" placeholder="Confirm your password">
              <div class="error-message" id="register-error"></div>
            </div>
            <button id="register-button" class="btn">Register</button>
          </div>
        </div>
      </div>
      <div id="user-menu" style="display: none;">
        <button id="user-menu-toggle" class="user-btn">
          <i class="fas fa-user"></i>
          <span id="username-display">User</span>
        </button>
        <div id="user-menu-dropdown" style="display: none;">
          <div id="user-info">
            <span id="user-email">email@example.com</span>
          </div>
          <button id="logout-button" class="btn">Logout</button>
        </div>
      </div>
      <button id="login-register-btn" class="user-btn">
        <i class="fas fa-sign-in-alt"></i>
        Login / Register
      </button>
    `;

        document.body.appendChild(authContainer);


        const styleEl = document.createElement('style');
        styleEl.textContent = `
      #auth-container {
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 1000;
      }
      
      .user-btn {
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: bold;
      }
      
      #user-menu {
        position: relative;
      }
      
      #user-menu-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        padding: 10px;
        min-width: 200px;
        margin-top: 5px;
        z-index: 1001;
      }
      
      #user-info {
        padding-bottom: 10px;
        margin-bottom: 10px;
        border-bottom: 1px solid #ddd;
      }
      
      #auth-tabs {
        display: flex;
        margin-bottom: 20px;
        border-bottom: 1px solid #ddd;
      }
      
      .auth-tab-btn {
        background: none;
        border: none;
        padding: 10px 20px;
        cursor: pointer;
        font-weight: bold;
        opacity: 0.7;
      }
      
      .auth-tab-btn.active {
        opacity: 1;
        border-bottom: 2px solid #4CAF50;
      }
      
      .auth-form h2 {
        margin-bottom: 20px;
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      
      .form-group input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
      }
      
      .error-message {
        color: #ef4444;
        font-size: 14px;
        margin-top: 5px;
        min-height: 20px;
      }
      
      .dark-mode .auth-tab-btn {
        color: #f9fafb;
      }
      
      .dark-mode .auth-form h2 {
        color: #f9fafb;
      }
      
      .dark-mode .form-group input {
        background-color: #374151;
        color: #f9fafb;
        border-color: #4b5563;
      }
      
      #auth-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        z-index: 2000;
        align-items: center;
        justify-content: center;
      }
      
      #auth-modal .modal-content {
        background-color: #fff;
        padding: 20px;
        border-radius: 10px;
        width: 90%;
        max-width: 500px;
      }
      
      .dark-mode #auth-modal .modal-content {
        background-color: #1f2937;
        color: #f9fafb;
      }
      
      .dark-mode #user-menu-dropdown {
        background-color: #1f2937;
        border-color: #4b5563;
        color: #f9fafb;
      }
    `;
        document.head.appendChild(styleEl);

        return authContainer;
    };


    const validateEmail = (email) => {

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateUsername = (username) => {

        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    };

    const validatePassword = (password) => {

        const minLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasDigit = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);


        return minLength && hasUppercase && hasLowercase && hasDigit && hasSpecial;
    };


    window.debugPassword = function (password) {
        const requirements = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasDigit: /[0-9]/.test(password),
            hasSpecial: /[^A-Za-z0-9]/.test(password),
            isValid: false
        };

        requirements.isValid =
            requirements.minLength &&
            requirements.hasUppercase &&
            requirements.hasLowercase &&
            requirements.hasDigit &&
            requirements.hasSpecial;

        console.table(requirements);
        return requirements;
    };


    const setupValidation = () => {
        const registerEmail = document.getElementById('register-email');
        const registerUsername = document.getElementById('register-username');
        const registerPassword = document.getElementById('register-password');
        const registerConfirmPassword = document.getElementById('register-confirm-password');
        const loginEmail = document.getElementById('login-email');

        if (registerEmail) {
            registerEmail.addEventListener('blur', function () {
                const emailError = document.getElementById('register-email-error') ||
                    document.createElement('div');

                emailError.id = 'register-email-error';
                emailError.className = 'validation-feedback';

                if (!validateEmail(this.value) && this.value.trim() !== '') {
                    emailError.textContent = 'Please enter a valid email address';
                    emailError.className = 'validation-feedback error';
                } else {
                    emailError.textContent = '';
                }

                if (!this.nextElementSibling || this.nextElementSibling.id !== 'register-email-error') {
                    this.parentNode.insertBefore(emailError, this.nextElementSibling);
                }
            });
        }

        if (registerUsername) {
            registerUsername.addEventListener('blur', function () {
                const usernameError = document.getElementById('register-username-error') ||
                    document.createElement('div');

                usernameError.id = 'register-username-error';
                usernameError.className = 'validation-feedback';

                if (this.value.trim() !== '' && !validateUsername(this.value)) {
                    usernameError.textContent = 'Username must be at least 3 characters with letters, numbers, and underscores only';
                    usernameError.className = 'validation-feedback error';
                } else {
                    usernameError.textContent = '';
                }

                if (!this.nextElementSibling || this.nextElementSibling.id !== 'register-username-error') {
                    this.parentNode.insertBefore(usernameError, this.nextElementSibling);
                }
            });
        }

        if (registerPassword) {
            registerPassword.addEventListener('blur', function () {
                const passwordError = document.getElementById('register-password-error') ||
                    document.createElement('div');

                passwordError.id = 'register-password-error';
                passwordError.className = 'validation-feedback';

                if (this.value.trim() !== '' && !validatePassword(this.value)) {
                    passwordError.textContent = 'Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, one number, and one special character';
                    passwordError.className = 'validation-feedback error';
                } else {
                    passwordError.textContent = '';
                }

                if (!this.nextElementSibling || this.nextElementSibling.id !== 'register-password-error') {
                    this.parentNode.insertBefore(passwordError, this.nextElementSibling);
                }
            });
        }

        if (loginEmail) {
            loginEmail.addEventListener('blur', function () {
                const emailError = document.getElementById('login-email-error') ||
                    document.createElement('div');

                emailError.id = 'login-email-error';
                emailError.className = 'validation-feedback';

                if (!validateEmail(this.value) && this.value.trim() !== '') {
                    emailError.textContent = 'Please enter a valid email address';
                    emailError.className = 'validation-feedback error';
                } else {
                    emailError.textContent = '';
                }

                if (!this.nextElementSibling || this.nextElementSibling.id !== 'login-email-error') {
                    this.parentNode.insertBefore(emailError, this.nextElementSibling);
                }
            });
        }
    };


    const authContainer = createAuthUI();
    if (!authContainer) {
        console.error("Failed to create auth UI container");
        return;
    }


    const getUIElement = (id) => {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Auth UI element not found: ${id}`);
        }
        return element;
    };

    const authModal = getUIElement('auth-modal');
    const loginTab = getUIElement('login-tab');
    const registerTab = getUIElement('register-tab');
    const loginForm = getUIElement('login-form');
    const registerForm = getUIElement('register-form');
    const loginButton = getUIElement('login-button');
    const registerButton = getUIElement('register-button');
    const loginRegisterBtn = getUIElement('login-register-btn');
    const userMenu = getUIElement('user-menu');
    const userMenuToggle = getUIElement('user-menu-toggle');
    const userMenuDropdown = getUIElement('user-menu-dropdown');
    const usernameDisplay = getUIElement('username-display');
    const userEmail = getUIElement('user-email');
    const logoutButton = getUIElement('logout-button');
    const authCloseBtn = getUIElement('auth-close-btn');


    console.log("Auth UI elements found:", {
        authModal: !!authModal,
        loginTab: !!loginTab,
        registerTab: !!registerTab,
        loginButton: !!loginButton,
        registerButton: !!registerButton,
        loginRegisterBtn: !!loginRegisterBtn
    });


    if (loginRegisterBtn) {
        console.log("Adding event listener to loginRegisterBtn");
        loginRegisterBtn.addEventListener('click', () => {
            console.log("Login/Register button clicked");
            if (authModal) {
                authModal.style.display = 'flex';
                console.log("Auth modal displayed");
            } else {
                console.error("Auth modal not found");
            }
        });
    }


    if (loginTab && registerTab && loginForm && registerForm) {
        loginTab.addEventListener('click', () => {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        });

        registerTab.addEventListener('click', () => {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.style.display = 'block';
            loginForm.style.display = 'none';
        });
    }


    if (userMenuToggle && userMenuDropdown) {
        userMenuToggle.addEventListener('click', () => {
            userMenuDropdown.style.display = userMenuDropdown.style.display === 'none' ? 'block' : 'none';
        });
    }


    document.addEventListener('click', (e) => {
        if (userMenu && userMenuDropdown && !userMenu.contains(e.target)) {
            userMenuDropdown.style.display = 'none';
        }

        if (authModal && authModal.style.display === 'flex') {
            const modalContent = authModal.querySelector('.modal-content');
            if (modalContent && !modalContent.contains(e.target) && e.target !== loginRegisterBtn) {
                authModal.style.display = 'none';
            }
        }
    });


    const addValidationStyles = () => {
        const styleEl = document.createElement('style');
        styleEl.textContent = `
      .validation-feedback {
        font-size: 12px;
        margin-top: 4px;
        min-height: 18px;
        transition: all 0.3s;
      }
      
      .validation-feedback.error {
        color: #e74c3c;
      }
      
      .validation-feedback.success {
        color: #2ecc71;
      }
      
      input:focus {
        border-color: #3498db !important;
      }
      
      input.invalid {
        border-color: #e74c3c !important;
      }
      
      input.valid {
        border-color: #2ecc71 !important;
      }
    `;
        document.head.appendChild(styleEl);
    };

    addValidationStyles();
    setupValidation();


    if (loginButton) {
        console.log("Adding event listener to loginButton");
        loginButton.addEventListener('click', async () => {
            const email = document.getElementById('login-email')?.value || '';
            const password = document.getElementById('login-password')?.value || '';
            const errorElement = document.getElementById('login-error');

            console.log("Login button clicked", { email: email ? "provided" : "missing", password: password ? "provided" : "missing" });


            if (!email || !password) {
                if (errorElement) errorElement.textContent = 'Please enter both email and password';
                return;
            }

            if (!validateEmail(email)) {
                if (errorElement) errorElement.textContent = 'Please enter a valid email address';
                return;
            }

            try {
                if (loginButton) {
                    loginButton.disabled = true;
                    loginButton.textContent = 'Logging in...';
                }

                console.log("Attempting to login with auth service");
                await auth.login(email, password);
                console.log("Login successful");


                if (document.getElementById('login-email')) document.getElementById('login-email').value = '';
                if (document.getElementById('login-password')) document.getElementById('login-password').value = '';
                if (errorElement) errorElement.textContent = '';
                if (authModal) authModal.style.display = 'none';


                window.location.reload();
            } catch (error) {
                console.error("Login error:", error);
                if (errorElement) errorElement.textContent = error.message || 'Login failed';
            } finally {
                if (loginButton) {
                    loginButton.disabled = false;
                    loginButton.textContent = 'Login';
                }
            }
        });
    }


    if (registerButton) {
        console.log("Adding event listener to registerButton");
        registerButton.addEventListener('click', async () => {
            const email = document.getElementById('register-email')?.value || '';
            const username = document.getElementById('register-username')?.value || '';
            const password = document.getElementById('register-password')?.value || '';
            const confirmPassword = document.getElementById('register-confirm-password')?.value || '';
            const errorElement = document.getElementById('register-error');

            console.log("Register button clicked", {
                email: email ? "provided" : "missing",
                username: username ? "provided" : "missing",
                password: password ? "provided" : "missing",
                confirmPassword: confirmPassword ? "provided" : "missing"
            });


            if (!email || !username || !password) {
                if (errorElement) errorElement.textContent = 'Please fill in all fields';
                return;
            }

            if (!validateEmail(email)) {
                if (errorElement) errorElement.textContent = 'Please enter a valid email address';
                return;
            }

            if (!validateUsername(username)) {
                if (errorElement) errorElement.textContent = 'Username must be at least 3 characters with letters, numbers, and underscores only';
                return;
            }

            if (!validatePassword(password)) {
                if (errorElement) errorElement.textContent = 'Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, one number, and one special character';
                return;
            }

            if (password !== confirmPassword) {
                if (errorElement) errorElement.textContent = 'Passwords do not match';
                return;
            }

            try {
                if (registerButton) {
                    registerButton.disabled = true;
                    registerButton.textContent = 'Registering...';
                }

                console.log("Attempting to register with auth service");
                await auth.register(email, username, password);
                console.log("Registration successful");


                if (document.getElementById('register-email')) document.getElementById('register-email').value = '';
                if (document.getElementById('register-username')) document.getElementById('register-username').value = '';
                if (document.getElementById('register-password')) document.getElementById('register-password').value = '';
                if (document.getElementById('register-confirm-password')) document.getElementById('register-confirm-password').value = '';
                if (errorElement) errorElement.textContent = '';
                if (authModal) authModal.style.display = 'none';


                window.location.reload();
            } catch (error) {
                console.error("Registration error:", error);
                if (errorElement) errorElement.textContent = error.message || 'Registration failed';
            } finally {
                if (registerButton) {
                    registerButton.disabled = false;
                    registerButton.textContent = 'Register';
                }
            }
        });
    }


    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                console.log("Logout button clicked");
                await auth.logout();
                window.location.reload();
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }


    if (auth && typeof auth.onAuthChange === 'function') {
        auth.onAuthChange((isLoggedIn, user) => {
            console.log("Auth state changed:", isLoggedIn ? "Logged in" : "Not logged in", user);
            if (isLoggedIn && user) {
                if (loginRegisterBtn) loginRegisterBtn.style.display = 'none';
                if (userMenu) userMenu.style.display = 'block';
                if (usernameDisplay) usernameDisplay.textContent = user.username;
                if (userEmail) userEmail.textContent = user.email;
            } else {
                if (loginRegisterBtn) loginRegisterBtn.style.display = 'block';
                if (userMenu) userMenu.style.display = 'none';
            }
        });
    }


    console.log("Checking initial auth status");
    window.auth.checkAuthStatus().catch(err => {
        console.error("Error checking auth status:", err);
    });

    console.log("Auth UI initialization complete");
});
