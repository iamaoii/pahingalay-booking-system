// Authentication handler
class AuthHandler {
    constructor() {
        this.apiBaseUrl = "http://localhost:5000/api"
        this.initializeEventListeners()
        this.loadStoredToken()
    }

    initializeEventListeners() {
        // Sign in form
        const signinForm = document.getElementById("signinForm")
        if (signinForm) {
            signinForm.addEventListener("submit", (e) => this.handleSignIn(e))
        }

        // Sign up form
        const signupForm = document.getElementById("signupForm")
        if (signupForm) {
            signupForm.addEventListener("submit", (e) => this.handleSignUp(e))
        }

        // Real-time validation
        this.setupRealTimeValidation()
    }

    setupRealTimeValidation() {
        // Email validation with backend check
        const emailInputs = document.querySelectorAll('input[type="email"]')
        emailInputs.forEach((input) => {
            input.addEventListener("blur", () => this.validateEmail(input))
            input.addEventListener("input", () => this.clearError(input))
        })

        // Password validation
        const passwordInputs = document.querySelectorAll('input[type="password"]')
        passwordInputs.forEach((input) => {
            input.addEventListener("blur", () => this.validatePassword(input))
            input.addEventListener("input", () => this.clearError(input))
        })

        // Confirm password validation
        const confirmPassword = document.getElementById("confirmPassword")
        if (confirmPassword) {
            confirmPassword.addEventListener("blur", () => this.validatePasswordMatch())
            confirmPassword.addEventListener("input", () => this.clearError(confirmPassword))
        }

        // Phone number formatting
        const contactInput = document.getElementById("contact")
        if (contactInput) {
            contactInput.addEventListener("input", (e) => this.formatPhoneNumber(e))
        }

        // Age validation
        const ageInput = document.getElementById("age")
        if (ageInput) {
            ageInput.addEventListener("blur", () => this.validateAge(ageInput))
        }

        // Email availability check for signup
        const signupEmailInput = document.getElementById("emailSignup")
        if (signupEmailInput) {
            let emailCheckTimeout
            signupEmailInput.addEventListener("input", () => {
                clearTimeout(emailCheckTimeout)
                emailCheckTimeout = setTimeout(() => {
                    this.checkEmailAvailability(signupEmailInput)
                }, 500)
            })
        }
    }

    async checkEmailAvailability(input) {
        const email = input.value.trim()
        if (!email || !this.validateEmailFormat(email)) return

        try {
            const response = await fetch(`${this.apiBaseUrl}/check-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (response.ok) {
                if (data.exists) {
                    this.showError(input, "This email is already registered")
                } else {
                    this.showSuccess(input)
                }
            }
        } catch (error) {
            console.error("Email check failed:", error)
        }
    }

    validateEmailFormat(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    validateEmail(input) {
        const isValid = this.validateEmailFormat(input.value)

        if (!isValid && input.value) {
            this.showError(input, "Please enter a valid email address")
            return false
        }

        if (isValid) {
            this.showSuccess(input)
        }
        return true
    }

    validatePassword(input) {
        const password = input.value
        const minLength = 8

        if (password.length < minLength && password.length > 0) {
            this.showError(input, `Password must be at least ${minLength} characters long`)
            return false
        }

        if (password.length >= minLength) {
            this.showSuccess(input)
        }

        return password.length >= minLength
    }

    validatePasswordMatch() {
        const password = document.getElementById("passwordSignup")
        const confirmPassword = document.getElementById("confirmPassword")

        if (!password || !confirmPassword) return true

        if (password.value !== confirmPassword.value && confirmPassword.value) {
            this.showError(confirmPassword, "Passwords do not match")
            return false
        }

        if (password.value === confirmPassword.value && confirmPassword.value) {
            this.showSuccess(confirmPassword)
        }

        return true
    }

    validateAge(input) {
        const age = Number.parseInt(input.value)

        if (age < 18 && input.value) {
            this.showError(input, "You must be at least 18 years old")
            return false
        }

        if (age > 120 && input.value) {
            this.showError(input, "Please enter a valid age")
            return false
        }

        if (age >= 18 && age <= 120) {
            this.showSuccess(input)
        }

        return age >= 18 && age <= 120
    }

    formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, "")

        if (value.startsWith("63")) {
            value = value.substring(2)
        }

        if (value.length <= 10) {
            if (value.length >= 7) {
                value = value.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")
            } else if (value.length >= 4) {
                value = value.replace(/(\d{3})(\d{3})/, "$1 $2")
            }

            e.target.value = "+63 " + value
        }
    }

    async handleSignIn(e) {
        e.preventDefault()

        const form = e.target
        const formData = new FormData(form)
        const email = formData.get("email")
        const password = formData.get("password")
        const remember = formData.get("remember")

        // Validate form
        if (!this.validateSignInForm(email, password)) {
            return
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]')
        this.setLoadingState(submitBtn, true)

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
            })

            const data = await response.json()

            if (response.ok) {
                // Store token
                localStorage.setItem("authToken", data.token)
                localStorage.setItem("user", JSON.stringify(data.user))

                // Store remembered email if remember me is checked
                if (remember) {
                    localStorage.setItem("rememberedEmail", email)
                } else {
                    localStorage.removeItem("rememberedEmail")
                }

                // Success feedback
                this.showSuccessMessage("Sign in successful! Redirecting...")

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = "dashboard.html"
                }, 1500)
            } else {
                this.showErrorMessage(data.error || "Sign in failed. Please try again.")
            }
        } catch (error) {
            console.error("Sign in error:", error)
            this.showErrorMessage("Network error. Please check your connection and try again.")
        } finally {
            this.setLoadingState(submitBtn, false)
        }
    }

    async handleSignUp(e) {
        e.preventDefault()

        const form = e.target
        const formData = new FormData(form)

        // Validate form
        if (!this.validateSignUpForm(formData)) {
            return
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]')
        this.setLoadingState(submitBtn, true)

        try {
            const signupData = {
                fullName: formData.get("fullName"),
                email: formData.get("email"),
                password: formData.get("password"),
                confirmPassword: formData.get("confirmPassword"),
                contact: formData.get("contact"),
                age: Number.parseInt(formData.get("age")),
                nationality: formData.get("nationality"),
                address: formData.get("address"),
                sex: formData.get("sex"),
            }

            const response = await fetch(`${this.apiBaseUrl}/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(signupData),
            })

            const data = await response.json()

            if (response.ok) {
                // Store token and user data
                localStorage.setItem("authToken", data.token)
                localStorage.setItem("user", JSON.stringify(data.user))

                // Success feedback
                this.showSuccessMessage("Account created successfully! Redirecting to dashboard...")

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = "dashboard.html"
                }, 2000)
            } else {
                this.showErrorMessage(data.error || "Registration failed. Please try again.")
            }
        } catch (error) {
            console.error("Sign up error:", error)
            this.showErrorMessage("Network error. Please check your connection and try again.")
        } finally {
            this.setLoadingState(submitBtn, false)
        }
    }

    validateSignInForm(email, password) {
        let isValid = true

        const emailInput = document.getElementById("email")
        const passwordInput = document.getElementById("password")

        if (!email) {
            this.showError(emailInput, "Email is required")
            isValid = false
        } else if (!this.validateEmail(emailInput)) {
            isValid = false
        }

        if (!password) {
            this.showError(passwordInput, "Password is required")
            isValid = false
        }

        return isValid
    }

    validateSignUpForm(formData) {
        let isValid = true

        // Required fields validation
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
        ]

        requiredFields.forEach((field) => {
            const value = formData.get(field.name)
            const input = document.querySelector(`[name="${field.name}"]`)

            if (!value) {
                if (input) {
                    this.showError(input, field.message)
                }
                isValid = false
            }
        })

        // Password validation
        const password = formData.get("password")
        const confirmPassword = formData.get("confirmPassword")

        if (password && password.length < 8) {
            const passwordInput = document.getElementById("passwordSignup")
            this.showError(passwordInput, "Password must be at least 8 characters long")
            isValid = false
        }

        if (password !== confirmPassword) {
            const confirmPasswordInput = document.getElementById("confirmPassword")
            this.showError(confirmPasswordInput, "Passwords do not match")
            isValid = false
        }

        return isValid
    }

    loadStoredToken() {
        // Load remembered email if exists
        const rememberedEmail = localStorage.getItem("rememberedEmail")
        const emailInput = document.getElementById("email")
        if (rememberedEmail && emailInput) {
            emailInput.value = rememberedEmail
            const rememberCheckbox = document.getElementById("remember")
            if (rememberCheckbox) {
                rememberCheckbox.checked = true
            }
        }

        // Check if user is already logged in
        const token = localStorage.getItem("authToken")
        if (token && this.isTokenValid(token)) {
            // Redirect to dashboard if already logged in
            window.location.href = "dashboard.html"
        }
    }

    isTokenValid(token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]))
            const currentTime = Date.now() / 1000
            return payload.exp > currentTime
        } catch (error) {
            return false
        }
    }

    async logout() {
        const token = localStorage.getItem("authToken")

        if (token) {
            try {
                await fetch(`${this.apiBaseUrl}/logout`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                })
            } catch (error) {
                console.error("Logout error:", error)
            }
        }

        // Clear local storage
        localStorage.removeItem("authToken")
        localStorage.removeItem("user")

        // Redirect to sign in page
        window.location.href = "signin.html"
    }

    showError(input, message) {
        input.classList.add("error")
        input.classList.remove("success")

        let errorElement = input.parentNode.nextElementSibling
        if (!errorElement || !errorElement.classList.contains("error-message")) {
            errorElement = document.createElement("div")
            errorElement.className = "error-message"
            input.parentNode.insertAdjacentElement("afterend", errorElement)
        }

        errorElement.textContent = message
        errorElement.classList.add("show")
    }

    showSuccess(input) {
        input.classList.add("success")
        input.classList.remove("error")

        const errorElement = input.parentNode.nextElementSibling
        if (errorElement && errorElement.classList.contains("error-message")) {
            errorElement.classList.remove("show")
        }
    }

    clearError(input) {
        input.classList.remove("error")

        const errorElement = input.parentNode.nextElementSibling
        if (errorElement && errorElement.classList.contains("error-message")) {
            errorElement.classList.remove("show")
        }
    }

    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.classList.add("loading")
            button.disabled = true
            button.textContent = "Please wait..."
        } else {
            button.classList.remove("loading")
            button.disabled = false
            const isSignUp = button.closest("form").id === "signupForm"
            button.textContent = isSignUp ? "Create Account" : "Sign In"
        }
    }

    showSuccessMessage(message) {
        this.showMessage(message, "success")
    }

    showErrorMessage(message) {
        this.showMessage(message, "error")
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector(".message")
        if (existingMessage) {
            existingMessage.remove()
        }

        // Create new message
        const messageDiv = document.createElement("div")
        messageDiv.className = `message ${type}`
        messageDiv.textContent = message

        document.body.appendChild(messageDiv)

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = "slideOut 0.3s ease-out"
                setTimeout(() => messageDiv.remove(), 300)
            }
        }, 5000)
    }
}

// Utility function to make authenticated API requests
async function makeAuthenticatedRequest(url, options = {}) {
    const token = localStorage.getItem("authToken")

    const defaultOptions = {
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    }

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    }

    try {
        const response = await fetch(url, mergedOptions)

        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem("authToken")
            localStorage.removeItem("user")
            window.location.href = "signin.html"
            return null
        }

        return response
    } catch (error) {
        console.error("API request failed:", error)
        throw error
    }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new AuthHandler()
})

// auth.js
async function handleLogin(event) {
  event.preventDefault(); // prevent form reload

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Login successful!");
      console.log(data.user); // optional: store user info in localStorage
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Error during login:", error);
    alert("Something went wrong. Try again later.");
  }
}