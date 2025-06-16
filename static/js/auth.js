class AuthHandler {
    constructor() {
        this.apiBaseUrl = "/api";
        this.initializeEventListeners();
        this.loadStoredToken();
    }

    initializeEventListeners() {
        const signinForm = document.getElementById("signinForm");
        if (signinForm) {
            signinForm.addEventListener("submit", (e) => this.handleSignIn(e));
        }

        const signupForm = document.getElementById("signupForm");
        if (signupForm) {
            signupForm.addEventListener("submit", (e) => this.handleSignUp(e));
        }

        this.setupRealTimeValidation();
        this.setupMobileMenu();
    }

    setupMobileMenu() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenuClose = document.querySelector('.mobile-menu-close');
        const mobileMenu = document.querySelector('.mobile-menu');

        if (mobileMenuToggle && mobileMenuClose && mobileMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileMenu.classList.add('active');
            });

            mobileMenuClose.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
            });

            const mobileMenuLinks = document.querySelectorAll('.mobile-menu-list a');
            mobileMenuLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                });
            });
        }
    }

    setupRealTimeValidation() {
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach((input) => {
            input.addEventListener("blur", () => this.validateEmail(input));
            input.addEventListener("input", () => this.clearError(input));
        });

        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach((input) => {
            input.addEventListener("blur", () => this.validatePassword(input));
            input.addEventListener("input", () => this.clearError(input));
        });

        const confirmPassword = document.getElementById("confirmPassword");
        if (confirmPassword) {
            confirmPassword.addEventListener("blur", () => this.validatePasswordMatch());
            confirmPassword.addEventListener("input", () => this.clearError(confirmPassword));
        }

        const contactInput = document.getElementById("contact");
        if (contactInput) {
            contactInput.addEventListener("input", (e) => this.formatPhoneNumber(e));
        }

        const ageInput = document.getElementById("age");
        if (ageInput) {
            ageInput.addEventListener("blur", () => this.validateAge(ageInput));
            ageInput.addEventListener("input", () => this.clearError(ageInput));
        }

        const signupEmailInput = document.getElementById("emailSignup");
        if (signupEmailInput) {
            let emailCheckTimeout;
            signupEmailInput.addEventListener("input", () => {
                clearTimeout(emailCheckTimeout);
                emailCheckTimeout = setTimeout(() => {
                    this.checkEmailAvailability(signupEmailInput);
                }, 500);
            });
        }
    }

    async checkEmailAvailability(input) {
        const email = input.value.trim();
        if (!email || !this.validateEmailFormat(email)) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/check-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok && data.exists) {
                this.showError(input, "This email is already registered");
            } else if (response.ok) {
                this.showSuccess(input);
            }
        } catch (error) {
            console.error("Email check failed:", error);
        }
    }

    validateEmailFormat(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateEmail(input) {
        const isValid = this.validateEmailFormat(input.value);

        if (!input.value) {
            this.showError(input, "Email is required");
            return false;
        } else if (!isValid) {
            this.showError(input, "Please enter a valid email address");
            return false;
        }

        return true;
    }

    validatePassword(input) {
        const password = input.value;
        const minLength = 8;

        if (!password) {
            this.showError(input, "Password is required");
            return false;
        } else if (password.length < minLength) {
            this.showError(input, `Password must be at least ${minLength} characters long`);
            return false;
        }

        this.showSuccess(input);
        return true;
    }

    validatePasswordMatch() {
        const password = document.getElementById("passwordSignup");
        const confirmPassword = document.getElementById("confirmPassword");

        if (!password || !confirmPassword) return true;

        if (!confirmPassword.value) {
            this.showError(confirmPassword, "Please confirm your password");
            return false;
        } else if (password.value !== confirmPassword.value) {
            this.showError(confirmPassword, "Passwords do not match");
            return false;
        }

        this.showSuccess(confirmPassword);
        return true;
    }

    validateAge(input) {
        const age = parseInt(input.value);

        if (!input.value) {
            this.showError(input, "Age is required");
            return false;
        } else if (isNaN(age) || age < 18) {
            this.showError(input, "You must be at least 18 years old");
            return false;
        } else if (age > 120) {
            this.showError(input, "Please enter a valid age");
            return false;
        }

        this.showSuccess(input);
        return true;
    }

    formatPhoneNumber(e) {
        let input = e.target.value.replace(/\D/g, "");
        if (input.startsWith("63")) {
            input = input.slice(2);
        } else if (input.startsWith("0")) {
            input = input.slice(1);
        }
        input = input.slice(0, 10);
        let formatted = "";
        if (input.length >= 7) {
            formatted = input.replace(/(\d{3})(\d{3})(\d{0,4})/, "$1 $2 $3").trim();
        } else if (input.length >= 4) {
            formatted = input.replace(/(\d{3})(\d{0,3})/, "$1 $2").trim();
        } else {
            formatted = input;
        }
        e.target.value = input.length > 0 ? `+63 ${formatted}` : "";
    }

    getPhoneNumberForBackend(inputValue) {
        let digits = inputValue.replace(/\D/g, "");
        if (digits.startsWith("63")) {
            digits = "0" + digits.slice(2);
        }
        return digits;
    }

    async handleSignIn(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const email = formData.get("email");
        const password = formData.get("password");
        const messageDiv = document.getElementById("form-message");

        if (!this.validateSignInForm(email, password)) {
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        this.setLoadingState(submitBtn, true);

        try {
            const response = await fetch(`${this.apiBaseUrl}/signin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, remember: false }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("authToken", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                if (messageDiv) {
                    messageDiv.className = "flash-message success";
                    messageDiv.textContent = data.message || "Signed in successfully";
                    messageDiv.style.display = "block";
                }
                setTimeout(() => {
                    window.location.href = "/dashboard"; // Redirect to /dashboard
                }, 1500);
            } else {
                if (messageDiv) {
                    messageDiv.className = "flash-message error";
                    messageDiv.textContent = data.message || "Sign in failed. Please try again.";
                    messageDiv.style.display = "block";
                }
            }
        } catch (error) {
            console.error("Sign in error:", error);
            if (messageDiv) {
                messageDiv.className = "flash-message error";
                messageDiv.textContent = "Network error. Please check your connection.";
                messageDiv.style.display = "block";
            }
        } finally {
            this.setLoadingState(submitBtn, false);
        }
    }

    async handleSignUp(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const messageDiv = document.getElementById("form-message");

        if (!this.validateSignUpForm(formData)) {
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        this.setLoadingState(submitBtn, true);

        try {
            const signupData = {
                fullName: formData.get("fullName"),
                email: formData.get("email"),
                password: formData.get("password"),
                confirmPassword: formData.get("confirmPassword"),
                contact: this.getPhoneNumberForBackend(formData.get("contact")),
                age: parseInt(formData.get("age")),
                nationality: formData.get("nationality"),
                address: formData.get("address"),
                sex: formData.get("sex"),
            };

            const response = await fetch(`${this.apiBaseUrl}/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(signupData),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("authToken", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                if (messageDiv) {
                    messageDiv.className = "flash-message success";
                    messageDiv.textContent = data.message || "Account created successfully";
                    messageDiv.style.display = "block";
                }
                setTimeout(() => {
                    window.location.href = "/dashboard"; // Redirect to /dashboard
                }, 1500);
            } else {
                if (messageDiv) {
                    messageDiv.className = "flash-message error";
                    messageDiv.textContent = data.message || "Registration failed. Please try again.";
                    messageDiv.style.display = "block";
                }
            }
        } catch (error) {
            console.error("Sign up error:", error);
            if (messageDiv) {
                messageDiv.className = "flash-message error";
                messageDiv.textContent = "Network error. Please check your connection.";
                messageDiv.style.display = "block";
            }
        } finally {
            this.setLoadingState(submitBtn, false);
        }
    }

    validateSignInForm(email, password) {
        let isValid = true;
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        if (!email) {
            this.showError(emailInput, "Email is required");
            isValid = false;
        } else if (!this.validateEmail(emailInput)) {
            isValid = false;
        }

        if (!password) {
            this.showError(passwordInput, "Password is required");
            isValid = false;
        } else if (!this.validatePassword(passwordInput)) {
            isValid = false;
        }

        return isValid;
    }

    validateSignUpForm(formData) {
        let isValid = true;
        const requiredFields = [
            { name: "fullName", message: "Full name is required" },
            { name: "email", message: "Email is required" },
            { name: "contact", message: "Contact number is required" },
            { name: "age", message: "Age is required" },
            { name: "nationality", message: "Nationality is required" },
            { name: "address", message: "Address is required" },
            { name: "sex", message: "Please select your gender" },
            { name: "password", message: "Password is required" },
            { name: "confirmPassword", message: "Please confirm your password" },
        ];

        requiredFields.forEach((field) => {
            const value = formData.get(field.name);
            const input = document.querySelector(`[name="${field.name}"]`);
            if (!value) {
                if (input) this.showError(input, field.message);
                isValid = false;
            }
        });

        const emailInput = document.getElementById("emailSignup");
        if (emailInput && formData.get("email") && !this.validateEmail(emailInput)) {
            isValid = false;
        }

        const passwordInput = document.getElementById("passwordSignup");
        if (passwordInput && formData.get("password") && !this.validatePassword(passwordInput)) {
            isValid = false;
        }

        if (formData.get("password") && formData.get("confirmPassword") && !this.validatePasswordMatch()) {
            isValid = false;
        }

        const ageInput = document.getElementById("age");
        if (ageInput && formData.get("age") && !this.validateAge(ageInput)) {
            isValid = false;
        }

        return isValid;
    }

    loadStoredToken() {
        const token = localStorage.getItem("authToken");
        if (token && this.isTokenValid(token)) {
            window.location.href = "/dashboard"; // Redirect to /dashboard
        } else if (token) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
        }
    }

    isTokenValid(token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.exp > Date.now() / 1000;
        } catch (error) {
            return false;
        }
    }

    async logout() {
        const token = localStorage.getItem("authToken");
        try {
            if (token) {
                await fetch(`${this.apiBaseUrl}/logout`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
            }
        } catch (error) {
            console.error("Logout error:", error);
        }
        localStorage.clear();
        window.location.href = "/signin";
    }

    showError(input, message) {
        input.classList.add("error");
        input.classList.remove("success");
        let errorElement = input.parentNode.querySelector(".error-tooltip");
        if (!errorElement) {
            errorElement = document.createElement("div");
            errorElement.className = "error-tooltip";
            input.parentNode.style.position = "relative";
            input.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.display = "block";
        errorElement.classList.add("fade-in");
        setTimeout(() => {
            errorElement.classList.remove("fade-in");
        }, 300);
    }

    showSuccess(input) {
        input.classList.add("success");
        input.classList.remove("error");
        const errorElement = input.parentNode.querySelector(".error-tooltip");
        if (errorElement) {
            errorElement.style.display = "none";
        }
    }

    clearError(input) {
        input.classList.remove("error");
        input.classList.remove("success");
        const errorElement = input.parentNode.querySelector(".error-tooltip");
        if (errorElement) {
            errorElement.style.display = "none";
        }
    }

    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.classList.add("loading");
            button.disabled = true;
            button.textContent = "Please wait...";
        } else {
            button.classList.remove("loading");
            button.disabled = false;
            button.textContent = button.closest("form").id === "signupForm" ? "Create Account" : "Sign In";
        }
    }
}

async function makeAuthenticatedRequest(url, options = {}) {
    const token = localStorage.getItem("authToken");
    const defaultOptions = {
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    };
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };
    try {
        const response = await fetch(url, mergedOptions);
        if (response.status === 401) {
            localStorage.clear();
            window.location.href = "/signin";
            return null;
        }
        return response;
    } catch (error) {
        console.error("API request failed:", error);
        throw error;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new AuthHandler();
});