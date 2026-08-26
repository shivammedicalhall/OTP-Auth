const CORRECT_OTP = "5632";

const otpInputs =
    document.querySelectorAll(".otp-input");

const otpCard =
    document.getElementById("otpCard");

const phone =
    document.getElementById("phone");

const phoneLock =
    document.getElementById("phoneLock");

const phoneButton =
    document.getElementById("phoneButton");

const mainTitle =
    document.getElementById("mainTitle");

const otpContainer =
    document.getElementById("otpContainer");

const statusRow =
    document.getElementById("statusRow");

const statusText =
    document.getElementById("statusText");

const resendRow =
    document.getElementById("resendRow");

const resendButton =
    document.getElementById("resendButton");

const successScreen =
    document.getElementById("successScreen");

const restartButton =
    document.getElementById("restartButton");


/* =========================================
   INITIALIZE
========================================= */

window.addEventListener("load", () => {

    otpInputs[0].focus();

    updateActiveBox(0);

});


/* =========================================
   ACTIVE BOX
========================================= */

function updateActiveBox(index) {

    otpInputs.forEach((input, i) => {

        input.classList.toggle(
            "active",
            i === index
        );

    });

}


/* =========================================
   INPUT
========================================= */

otpInputs.forEach((input, index) => {

    input.addEventListener("input", () => {

        input.value =
            input.value
                .replace(/\D/g, "")
                .slice(0, 1);

        if (input.value) {

            input.classList.add("filled");

            if (
                index <
                otpInputs.length - 1
            ) {

                otpInputs[
                    index + 1
                ].focus();

                updateActiveBox(
                    index + 1
                );

            } else {

                updateActiveBox(index);

                verifyOTP();

            }

        }

    });


    /* Keyboard */

    input.addEventListener("keydown", event => {

        if (
            event.key === "Backspace" &&
            input.value === "" &&
            index > 0
        ) {

            otpInputs[
                index - 1
            ].value = "";

            otpInputs[
                index - 1
            ].classList.remove("filled");

            otpInputs[
                index - 1
            ].focus();

            updateActiveBox(
                index - 1
            );

        }


        if (
            event.key === "ArrowLeft" &&
            index > 0
        ) {

            otpInputs[
                index - 1
            ].focus();

            updateActiveBox(
                index - 1
            );

        }


        if (
            event.key === "ArrowRight" &&
            index <
            otpInputs.length - 1
        ) {

            otpInputs[
                index + 1
            ].focus();

            updateActiveBox(
                index + 1
            );

        }

    });

});


/* =========================================
   PASTE
========================================= */

otpContainer.addEventListener(
    "paste",
    event => {

        event.preventDefault();

        const pasted =
            event.clipboardData
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, 4);

        pasted.split("").forEach(
            (digit, index) => {

                otpInputs[
                    index
                ].value = digit;

                otpInputs[
                    index
                ].classList.add("filled");

            }
        );

        if (
            pasted.length === 4
        ) {

            otpInputs[3].focus();

            updateActiveBox(3);

            verifyOTP();

        } else {

            otpInputs[
                pasted.length
            ].focus();

            updateActiveBox(
                pasted.length
            );

        }

    }
);


/* =========================================
   GET OTP
========================================= */

function getOTP() {

    return Array.from(otpInputs)
        .map(input => input.value)
        .join("");

}


/* =========================================
   VERIFY
========================================= */

function verifyOTP() {

    const enteredOTP =
        getOTP();

    if (
        enteredOTP.length !== 4
    ) {
        return;
    }


    /* LOCK INPUTS */

    otpInputs.forEach(
        input => {
            input.disabled = true;
        }
    );


    /* VERIFYING STATE */

    otpCard.classList.add(
        "verifying"
    );

    phone.classList.add(
        "verifying"
    );

    mainTitle.textContent =
        "Verifying code...";

    statusText.textContent =
        "Checking your code...";

    phoneButton.textContent =
        "Verifying...";


    /*
       This delay creates the visible
       loading animation from the reference.
    */

    setTimeout(() => {

        if (
            enteredOTP === CORRECT_OTP
        ) {

            showSuccess();

        } else {

            showError();

        }

    }, 1800);

}


/* =========================================
   SUCCESS
========================================= */

function showSuccess() {

    otpCard.classList.remove(
        "verifying"
    );

    otpCard.classList.add(
        "success"
    );

    phone.classList.remove(
        "verifying"
    );

    phone.classList.add(
        "verified"
    );

    phoneLock.textContent =
        "🔓";

    phoneButton.textContent =
        "Verified ✓";

    mainTitle.textContent =
        "";

    statusText.textContent =
        "";

    otpContainer.classList.add(
        "hidden"
    );

    resendRow.classList.add(
        "hidden"
    );

    statusRow.classList.add(
        "hidden"
    );

    document
        .getElementById("content")
        .classList.add("hidden");

    successScreen.classList.remove(
        "hidden"
    );

}


/* =========================================
   ERROR
========================================= */

function showError() {

    otpCard.classList.remove(
        "verifying"
    );

    phone.classList.remove(
        "verifying"
    );

    mainTitle.textContent =
        "Invalid code";

    statusText.textContent =
        "Please try again";

    statusText.style.color =
        "#ff5c5c";

    phoneButton.textContent =
        "Verify";


    otpInputs.forEach(
        input => {

            input.disabled =
                false;

        }
    );


    /* Shake */

    otpCard.animate(
        [
            {
                transform:
                    "translateX(0)"
            },
            {
                transform:
                    "translateX(-8px)"
            },
            {
                transform:
                    "translateX(8px)"
            },
            {
                transform:
                    "translateX(-5px)"
            },
            {
                transform:
                    "translateX(5px)"
            },
            {
                transform:
                    "translateX(0)"
            }
        ],
        {
            duration: 400
        }
    );


    setTimeout(() => {

        otpInputs.forEach(
            input => {

                input.value = "";

                input.classList.remove(
                    "filled"
                );

            }
        );

        statusText.textContent =
            "";

        statusText.style.color =
            "";

        mainTitle.textContent =
            "Let's verify your number";

        otpInputs[0].focus();

        updateActiveBox(0);

    }, 1000);

}


/* =========================================
   RESEND
========================================= */

resendButton.addEventListener(
    "click",
    resetOTP
);


/* =========================================
   RESTART
========================================= */

restartButton.addEventListener(
    "click",
    resetOTP
);


/* =========================================
   RESET
========================================= */

function resetOTP() {

    otpCard.classList.remove(
        "verifying",
        "success"
    );

    phone.classList.remove(
        "verifying",
        "verified"
    );

    phoneLock.textContent =
        "🔒";

    phoneButton.textContent =
        "Verify";

    mainTitle.textContent =
        "Let's verify your number";

    statusText.textContent =
        "";

    statusText.style.color =
        "";

    otpContainer.classList.remove(
        "hidden"
    );

    resendRow.classList.remove(
        "hidden"
    );

    statusRow.classList.remove(
        "hidden"
    );

    successScreen.classList.add(
        "hidden"
    );

    document
        .getElementById("content")
        .classList.remove("hidden");


    otpInputs.forEach(
        input => {

            input.value = "";

            input.disabled = false;

            input.classList.remove(
                "filled"
            );

        }
    );


    otpInputs[0].focus();

    updateActiveBox(0);

}