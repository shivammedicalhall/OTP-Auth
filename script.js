import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAlp2ME-QiCCqM_EWQQ_TRWz0GkBvYABtw",
    authDomain: "otp-auth-5d475.firebaseapp.com",
    projectId: "otp-auth-5d475",
    storageBucket: "otp-auth-5d475.firebasestorage.app",
    messagingSenderId: "400867927315",
    appId: "1:400867927315:web:6f430ad49bea864417a6e6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let confirmationResult = null;

const otpInputs = document.querySelectorAll(".otp-input");
const otpCard = document.getElementById("otpCard");
const phone = document.getElementById("phone");
const phoneLock = document.getElementById("phoneLock");
const phoneButton = document.getElementById("phoneButton");
const mainTitle = document.getElementById("mainTitle");
const otpContainer = document.getElementById("otpContainer");
const statusRow = document.getElementById("statusRow");
const statusText = document.getElementById("statusText");
const resendRow = document.getElementById("resendRow");
const resendButton = document.getElementById("resendButton");
const timerRow = document.getElementById("timerRow");
const successScreen = document.getElementById("successScreen");
const restartButton = document.getElementById("restartButton");

let countdownTime = 30;
let timerInterval;

/* =========================================
   INITIALIZE & RECAPTCHA
========================================= */
window.addEventListener("load", () => {
    otpInputs[0].focus();
    updateActiveBox(0);
    
    // Initialize Invisible reCAPTCHA
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
    });
});

/* =========================================
   TRIGGER SMS (Call this from your UI)
========================================= */
// Note: You must call this function and pass a real phone number (e.g., "+919876543210")
// to actually send the text message before the user can verify it.
window.triggerFirebaseSMS = (phoneNumber) => {
    signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
        .then((result) => {
            confirmationResult = result;
            startCountdown();
            statusText.textContent = "Code sent!";
            statusText.style.color = "#24dca2";
        }).catch((error) => {
            console.error(error);
            statusText.textContent = "Failed to send code.";
            statusText.style.color = "#ff5c5c";
        });
}

/* =========================================
   UI LOGIC
========================================= */
function updateActiveBox(index) {
    otpInputs.forEach((input, i) => input.classList.toggle("active", i === index));
}

otpInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "").slice(0, 1);
        if (input.value) {
            input.classList.add("filled");
            if (index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
                updateActiveBox(index + 1);
            } else {
                updateActiveBox(index);
                verifyOTP();
            }
        }
    });

    input.addEventListener("keydown", event => {
        if (event.key === "Backspace" && input.value === "" && index > 0) {
            otpInputs[index - 1].value = "";
            otpInputs[index - 1].classList.remove("filled");
            otpInputs[index - 1].focus();
            updateActiveBox(index - 1);
        }
        if (event.key === "ArrowLeft" && index > 0) {
            otpInputs[index - 1].focus();
            updateActiveBox(index - 1);
        }
        if (event.key === "ArrowRight" && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
            updateActiveBox(index + 1);
        }
    });
});

otpContainer.addEventListener("paste", event => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);

    pasted.split("").forEach((digit, index) => {
        otpInputs[index].value = digit;
        otpInputs[index].classList.add("filled");
    });

    if (pasted.length === 6) {
        otpInputs[5].focus();
        updateActiveBox(5);
        verifyOTP();
    } else {
        otpInputs[pasted.length].focus();
        updateActiveBox(pasted.length);
    }
});

function getOTP() {
    return Array.from(otpInputs).map(input => input.value).join("");
}

/* =========================================
   FIREBASE VERIFICATION
========================================= */
function verifyOTP() {
    const enteredOTP = getOTP();
    if (enteredOTP.length !== 6) return; 

    if (!confirmationResult) {
        statusText.textContent = "Please request a code first.";
        statusText.style.color = "#ff5c5c";
        return;
    }

    otpInputs.forEach(input => input.disabled = true);
    otpCard.classList.add("verifying");
    phone.classList.add("verifying");
    mainTitle.textContent = "Verifying code...";
    statusText.textContent = "Checking your code securely...";
    statusText.style.color = "#ff9460";
    phoneButton.textContent = "Verifying...";

    // Ask Firebase if the code is correct
    confirmationResult.confirm(enteredOTP)
        .then((result) => {
            showSuccess(); 
        })
        .catch((error) => {
            showError(); 
        });
}

/* =========================================
   SUCCESS / ERROR / RESET
========================================= */
function showSuccess() {
    otpCard.classList.remove("verifying");
    otpCard.classList.add("success");
    phone.classList.remove("verifying");
    phone.classList.add("verified");
    phoneLock.textContent = "🔓";
    phoneButton.textContent = "Verified ✓";
    mainTitle.textContent = "";
    statusText.textContent = "";
    otpContainer.classList.add("hidden");
    timerRow.classList.add("hidden");
    resendRow.classList.add("hidden");
    statusRow.classList.add("hidden");
    document.getElementById("content").classList.add("hidden");
    successScreen.classList.remove("hidden");
}

function showError() {
    otpCard.classList.remove("verifying");
    phone.classList.remove("verifying");
    mainTitle.textContent = "Invalid code";
    statusText.textContent = "Please try again";
    statusText.style.color = "#ff5c5c";
    phoneButton.textContent = "Verify";
    otpInputs.forEach(input => input.disabled = false);

    otpCard.animate([
        { transform: "translateX(0)" }, { transform: "translateX(-8px)" },
        { transform: "translateX(8px)" }, { transform: "translateX(-5px)" },
        { transform: "translateX(5px)" }, { transform: "translateX(0)" }
    ], { duration: 400 });

    setTimeout(() => {
        otpInputs.forEach(input => { input.value = ""; input.classList.remove("filled"); });
        statusText.textContent = "";
        mainTitle.textContent = "Let's verify your number";
        otpInputs[0].focus();
        updateActiveBox(0);
    }, 1000);
}

function startCountdown() {
    clearInterval(timerInterval);
    countdownTime = 30;
    resendButton.disabled = true;
    timerRow.textContent = `00:${countdownTime}`;

    timerInterval = setInterval(() => {
        countdownTime--;
        const seconds = countdownTime < 10 ? "0" + countdownTime : countdownTime;
        timerRow.textContent = `00:${seconds}`;
        if (countdownTime <= 0) {
            clearInterval(timerInterval);
            resendButton.disabled = false;
        }
    }, 1000);
}

function resetOTP() {
    otpCard.classList.remove("verifying", "success");
    phone.classList.remove("verifying", "verified");
    phoneLock.textContent = "🔒";
    phoneButton.textContent = "Verify";
    mainTitle.textContent = "Let's verify your number";
    statusText.textContent = "";
    otpContainer.classList.remove("hidden");
    timerRow.classList.remove("hidden");
    resendRow.classList.remove("hidden");
    statusRow.classList.remove("hidden");
    successScreen.classList.add("hidden");
    document.getElementById("content").classList.remove("hidden");

    otpInputs.forEach(input => {
        input.value = "";
        input.disabled = false;
        input.classList.remove("filled");
    });
    otpInputs[0].focus();
    updateActiveBox(0);
    
    // Note: To truly reset in a live environment, you would typically 
    // re-trigger the SMS here or ask the user to re-enter their number.
    startCountdown();
}

resendButton.addEventListener("click", resetOTP);
restartButton.addEventListener("click", resetOTP);
