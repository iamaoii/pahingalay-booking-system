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

            if (response.ok) {
                if (data.exists) {
                    this.showError(input, "This email is already registered");
                } else {
                    this.showSuccess(input);
                }
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

        if (!isValid && input.value) {
            this.showError(input, "Please enter a valid email address");
            return false;
        }

        if (isValid) {
            this.showSuccess(input);
        }
        return true;
    }

    validatePassword(input) {
        const password = input.value;
        const minLength = 8;

        if (password.length < minLength && password.length > 0) {
            this.showError(input, `Password must be at least ${minLength} characters long`);
            return false;
        }

        if (password.length >= minLength) {
            this.showSuccess(input);
        }

        return password.length >= minLength;
    }

    validatePasswordMatch() {
        const password = document.getElementById("passwordSignup");
        const confirmPassword = document.getElementById("confirmPassword");

        if (!password || !confirmPassword) return true;

        if (password.value !== confirmPassword.value && confirmPassword.value) {
            this.showError(confirmPassword, "Passwords do not match");
            return false;
        }

        if (password.value === confirmPassword.value && confirmPassword.value) {
            this.showSuccess(confirmPassword);
        }

        return true;
    }

    validateAge(input) {
        const age = Number.parseInt(input.value);

        if (age < 18 && input.value) {
            this.showError(input, "You must be at least 18 years old");
            return false;
        }

        if (age > 120 && input.value) {
            this.showError(input, "Please enter a valid age");
            return false;
        }

        if (age >= 18 && age <= 120) {
            this.showSuccess(input);
        }

        return age >= 18 && age <= 120;
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
        const remember = formData.get("remember");

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
                body: JSON.stringify({
                    email,
                    password,
                    remember: !!remember,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("authToken", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                if (remember) {
                    localStorage.setItem("rememberedEmail", email);
                    localStorage.setItem("sessionPersistent", "true");
                } else {
                    localStorage.setItem("sessionPersistent", "false");
                    localStorage.removeItem("rememberedEmail");
                }

                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 1500);
            } else {
                console.log(data.error || "Sign in failed. Please try again.");
            }
        } catch (error) {
            console.error("Sign in error:", error);
            console.log("Network error. Please check your connection and try again.");
        } finally {
            this.setLoadingState(submitBtn, false);
        }
    }

    async handleSignUp(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

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
                age: Number.parseInt(formData.get("age")),
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
                localStorage.setItem("sessionPersistent", "false"); // Default to non-persistent unless sign-in changes it

                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 2000);
            } else {
                console.error("Sign up failed: ", data.error);
                console.log(data.error || "Registration failed: " + data.error);
            }
        } catch (error) {
            console.error("Sign up server error:", error);
            console.log("Network error occurred. Please check server status and try again.");
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
                if (input) {
                    this.showError(input, field.message);
                }
                isValid = false;
            }
        });

        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");

        if (password && password.length < 8) {
            const passwordInput = document.getElementById("passwordSignup");
            this.showError(passwordInput, "Password must be at least 8 characters long");
            isValid = false;
        }

        if (password !== confirmPassword) {
            const confirmPasswordInput = document.getElementById("confirmPassword");
            this.showError(confirmPasswordInput, "Passwords do not match");
            isValid = false;
        }

        return isValid;
    }

    loadStoredToken() {
        const rememberedEmail = localStorage.getItem("rememberedEmail");
        const emailInput = document.getElementById("email");
        if (rememberedEmail && emailInput) {
            emailInput.value = rememberedEmail;
            const rememberCheckbox = document.getElementById("remember");
            if (rememberCheckbox) {
                rememberCheckbox.checked = true;
            }
        }

        const token = localStorage.getItem("authToken");
        const sessionPersistent = localStorage.getItem("sessionPersistent") === "true";

        if (token && this.isTokenValid(token)) {
            if (sessionPersistent) {
                window.location.href = "/dashboard";
            } else {
                localStorage.removeItem("authToken");
                localStorage.removeItem("user");
                localStorage.removeItem("sessionPersistent");
            }
        }
    }

    isTokenValid(token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp > currentTime;
        } catch (error) {
            return false;
        }
    }

    async logout() {
        const token = localStorage.getItem("authToken");

        if (token) {
            try {
                await fetch(`${this.apiBaseUrl}/logout`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
            } catch (error) {
                console.error("Logout error:", error);
            }
        }

        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("sessionPersistent");
        window.location.href = "/signin";
    }

    showError(input, message) {
        input.classList.add("error");
        input.classList.remove("success");

        let errorElement = input.parentNode.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains("error-message")) {
            errorElement = document.createElement("div");
            errorElement.className = "error-message";
            input.parentNode.insertAdjacentElement("afterend", errorElement);
        }

        errorElement.textContent = message;
        errorElement.classList.add("show");
    }

    showSuccess(input) {
        input.classList.add("success");
        input.classList.remove("error");

        const errorElement = input.parentNode.nextElementSibling;
        if (errorElement && errorElement.classList.contains("error-message")) {
            errorElement.classList.remove("show");
        }
    }

    clearError(input) {
        input.classList.remove("error");

        const errorElement = input.parentNode.nextElementSibling;
        if (errorElement && errorElement.classList.contains("error-message")) {
            errorElement.classList.remove("show");
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
            const isSignUp = button.closest("form").id === "signupForm";
            button.textContent = isSignUp ? "Create Account" : "Sign In";
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
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            localStorage.removeItem("rememberedEmail");
            localStorage.removeItem("sessionPersistent");
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