document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // FEEDBACK MESSAGE
    // ==========================================

    const showFeedback = (message, type) => {
        const feedbackMessage =
            document.getElementById("feedback-message");

        if (!feedbackMessage) return;

        feedbackMessage.textContent = message;
        feedbackMessage.className = type;
        feedbackMessage.style.display = "block";

        setTimeout(() => {
            feedbackMessage.style.display = "none";
        }, 5000);
    };


    // ==========================================
    // FORM ELEMENTS
    // ==========================================

    const signupBtn =
        document.getElementById("signin-btn");

    const signinBtn =
        document.getElementById("signup-btn");

    const signupFormElement =
        document.getElementById("signup-form");

    const signinFormElement =
        document.getElementById("signin-form");

    const forgotPasswordLink =
        document.getElementById("forgot-password-link");

    const forgotPasswordForm =
        document.getElementById("forgot-password-form");

    const forgotPasswordFormElement =
        document.getElementById("forgotPasswordForm");


    // ==========================================
    // SWITCH SIGNUP / SIGNIN
    // ==========================================

    if (
        signupBtn &&
        signinBtn &&
        signupFormElement &&
        signinFormElement
    ) {

        signupBtn.addEventListener("click", () => {
            toggleActiveForm("signup");
        });

        signinBtn.addEventListener("click", () => {
            toggleActiveForm("signin");
        });

    }


    function toggleActiveForm(activeForm) {

        if (!signupBtn || !signinBtn) return;

        signupBtn.classList.remove("active");
        signinBtn.classList.remove("active");

        if (activeForm === "signup") {

            signupBtn.classList.add("active");

            signupFormElement?.classList.remove("hidden");
            signinFormElement?.classList.add("hidden");

        } else {

            signinBtn.classList.add("active");

            signinFormElement?.classList.remove("hidden");
            signupFormElement?.classList.add("hidden");

        }
    }


    // ==========================================
    // FORGOT PASSWORD
    // ==========================================

    if (
        forgotPasswordLink &&
        forgotPasswordForm
    ) {

        forgotPasswordLink.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                forgotPasswordForm.classList.toggle("hidden");

            }
        );

    }


    // ==========================================
    // FORM DATA
    // ==========================================

    const createFormData = (formElement) => {

        if (formElement instanceof HTMLFormElement) {
            return new FormData(formElement);
        }

        console.error(
            "Form element is not an HTMLFormElement"
        );

        return null;
    };


    // ==========================================
    // PASSWORD VALIDATION
    // ==========================================

    function validatePassword(password) {

        return (
            password.length >= 8 &&
            /[a-zA-Z]/.test(password) &&
            /\d/.test(password)
        );

    }


    // ==========================================
    // EMAIL VERIFICATION POPUP
    // ==========================================

    const verificationModal =
        document.getElementById("verification-modal");

    const closeVerificationModal =
        document.getElementById("close-verification-modal");

    const verificationEmail =
        document.getElementById("verification-email");

    const verificationMessage =
        document.getElementById("verification-message");

    const resendVerificationPopupBtn =
        document.getElementById(
            "resend-verification-popup-btn"
        );

    const resendCountdown =
        document.getElementById("resend-countdown");

    const verificationPopupFeedback =
        document.getElementById(
            "verification-popup-feedback"
        );


    let verificationEmailAddress = "";

    let resendTimer = null;


    // ------------------------------------------
    // OPEN POPUP
    // ------------------------------------------

    function openVerificationPopup(email, message) {

        if (!verificationModal) return;

        verificationEmailAddress = email || "";

        if (verificationEmail) {
            verificationEmail.textContent =
                verificationEmailAddress;
        }

        if (verificationMessage && message) {
            verificationMessage.textContent = message;
        }

        if (verificationPopupFeedback) {
            verificationPopupFeedback.textContent = "";
            verificationPopupFeedback.className =
                "verification-popup-feedback";
        }

        if (resendVerificationPopupBtn) {
            resendVerificationPopupBtn.disabled = false;
            resendVerificationPopupBtn.textContent =
                "Resend Verification Email";
        }

        if (resendCountdown) {
            resendCountdown.textContent = "";
            resendCountdown.classList.add("hidden");
        }

        verificationModal.classList.remove("hidden");
    }


    // ------------------------------------------
    // CLOSE POPUP
    // ------------------------------------------

    if (closeVerificationModal) {

        closeVerificationModal.addEventListener(
            "click",
            function () {

                verificationModal?.classList.add("hidden");

            }
        );

    }


    // Close when clicking outside popup
    if (verificationModal) {

        verificationModal.addEventListener(
            "click",
            function (event) {

                if (event.target === verificationModal) {
                    verificationModal.classList.add("hidden");
                }

            }
        );

    }


    // ==========================================
    // RESEND VERIFICATION EMAIL
    // ==========================================

    async function resendVerificationEmail() {

        if (!verificationEmailAddress) {

            if (verificationPopupFeedback) {
                verificationPopupFeedback.textContent =
                    "Please enter your email address.";
                verificationPopupFeedback.className =
                    "verification-popup-feedback error";
            }

            return;
        }


        if (resendVerificationPopupBtn) {

            resendVerificationPopupBtn.disabled = true;

            resendVerificationPopupBtn.textContent =
                "Sending...";
        }


        try {

            const response = await fetch(
                "/api/users/resend-verification",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: verificationEmailAddress
                    })
                }
            );


            const data = await response.json();


            if (data.success) {

                if (verificationPopupFeedback) {

                    verificationPopupFeedback.textContent =
                        "Verification email sent. Please check your inbox.";

                    verificationPopupFeedback.className =
                        "verification-popup-feedback success";
                }

                startResendCountdown();

            } else {

                if (verificationPopupFeedback) {

                    verificationPopupFeedback.textContent =
                        data.message ||
                        "Unable to send verification email.";

                    verificationPopupFeedback.className =
                        "verification-popup-feedback error";
                }

                if (resendVerificationPopupBtn) {
                    resendVerificationPopupBtn.disabled = false;
                    resendVerificationPopupBtn.textContent =
                        "Resend Verification Email";
                }

            }

        } catch (error) {

            console.error(
                "Resend verification error:",
                error
            );

            if (verificationPopupFeedback) {

                verificationPopupFeedback.textContent =
                    "Unable to send verification email. Please try again.";

                verificationPopupFeedback.className =
                    "verification-popup-feedback error";
            }

            if (resendVerificationPopupBtn) {
                resendVerificationPopupBtn.disabled = false;
                resendVerificationPopupBtn.textContent =
                    "Resend Verification Email";
            }

        }

    }


    // ==========================================
    // 15 SECOND RESEND COUNTDOWN
    // ==========================================

    function startResendCountdown() {

        let seconds = 15;

        if (resendVerificationPopupBtn) {
            resendVerificationPopupBtn.disabled = true;
        }

        if (resendCountdown) {

            resendCountdown.classList.remove("hidden");

            resendCountdown.textContent =
                `You can request another email in ${seconds} seconds.`;

        }


        clearInterval(resendTimer);


        resendTimer = setInterval(() => {

            seconds--;


            if (seconds <= 0) {

                clearInterval(resendTimer);

                if (resendCountdown) {
                    resendCountdown.textContent = "";
                    resendCountdown.classList.add("hidden");
                }

                if (resendVerificationPopupBtn) {

                    resendVerificationPopupBtn.disabled = false;

                    resendVerificationPopupBtn.textContent =
                        "Resend Verification Email";
                }

                return;
            }


            if (resendCountdown) {

                resendCountdown.textContent =
                    `You can request another email in ${seconds} seconds.`;

            }

        }, 1000);

    }


    if (resendVerificationPopupBtn) {

        resendVerificationPopupBtn.addEventListener(
            "click",
            resendVerificationEmail
        );

    }


    // ==========================================
    // SIGN UP
    // ==========================================

    const signupForm =
        document.getElementById("signupForm");


    if (signupForm) {

        signupForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const formData =
                    createFormData(this);

                if (!formData) return;


                const password =
                    formData.get("password")?.trim();

                const confirmPassword =
                    formData.get("confirm-password")?.trim();


                if (!validatePassword(password)) {

                    showFeedback(
                        "Password must be at least 8 characters long, include a letter and a number.",
                        "error"
                    );

                    return;
                }


                if (password !== confirmPassword) {

                    showFeedback(
                        "Passwords do not match. Please re-enter.",
                        "error"
                    );

                    return;
                }


                try {

                    const response = await fetch(
                        "/api/users/signup",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify(
                                Object.fromEntries(
                                    formData.entries()
                                )
                            )
                        }
                    );


                    const data =
                        await response.json();


                    if (data.success) {

                        this.reset();


                        // Open verification popup
                        openVerificationPopup(
                            data.email ||
                            formData.get("email"),

                            "Your account has been created. Please check your email and click the verification link to activate your account."
                        );

                    } else {

                        showFeedback(
                            data.message,
                            "error"
                        );

                    }

                } catch (error) {

                    console.error(
                        "Signup error:",
                        error
                    );

                    showFeedback(
                        "An error occurred. Please try again.",
                        "error"
                    );

                }

            }
        );

    }


    // ==========================================
    // SIGN IN
    // ==========================================

    const signinForm =
        document.getElementById("signinForm");


    if (signinForm) {

        signinForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const formData =
                    createFormData(this);

                if (!formData) return;


                const email =
                    formData.get("email");


                try {

                    const response = await fetch(
                        "/api/users/signin",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify(
                                Object.fromEntries(
                                    formData.entries()
                                )
                            )
                        }
                    );


                    const data =
                        await response.json();


                    if (data.success) {

                        showFeedback(
                            "Sign-in successful!",
                            "success"
                        );

                        localStorage.setItem(
                            "token",
                            data.token
                        );

                        localStorage.setItem(
                            "refreshToken",
                            data.refreshToken
                        );

                        window.location.href =
                            "/dashboard";

                        return;
                    }


                    // ==================================
                    // EMAIL NOT VERIFIED
                    // ==================================

                    if (
                        data.emailVerificationRequired
                    ) {

                        openVerificationPopup(
                            data.email || email,

                            "Please verify your email before signing in. We have sent a verification link to your email."
                        );

                        return;
                    }


                    showFeedback(
                        data.message ||
                        "Unable to sign in.",
                        "error"
                    );


                } catch (error) {

                    console.error(
                        "Sign-in error:",
                        error
                    );

                    showFeedback(
                        "An error occurred. Please try again.",
                        "error"
                    );

                }

            }
        );

    }


    // ==========================================
    // FORGOT PASSWORD
    // ==========================================

    if (forgotPasswordFormElement) {

        forgotPasswordFormElement.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const formData =
                    createFormData(this);

                if (!formData) return;


                try {

                    const response = await fetch(
                        "/api/users/forgot-password",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify(
                                Object.fromEntries(
                                    formData.entries()
                                )
                            )
                        }
                    );


                    const data =
                        await response.json();


                    if (data.success) {

                        showFeedback(
                            "Password reset link sent to your email.",
                            "success"
                        );

                        forgotPasswordFormElement.reset();

                    } else {

                        showFeedback(
                            data.message,
                            "error"
                        );

                    }

                } catch (error) {

                    console.error(
                        "Forgot password error:",
                        error
                    );

                    showFeedback(
                        "An error occurred. Please try again.",
                        "error"
                    );

                }

            }
        );

    }

});