
document.addEventListener("DOMContentLoaded", () => {
    const PROFILE_KEY = "spendwiseProfile";
    const PREFERENCES_KEY = "spendwisePreferences";

    const profileForm = document.getElementById("profileForm");
    const preferencesForm = document.getElementById("preferencesForm");

    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const occupationInput = document.getElementById("occupation");

    const currencyInput = document.getElementById("currency");
    const themeInput = document.getElementById("theme");

    const profileStatus = document.getElementById("profileStatus");
    const preferencesStatus = document.getElementById("preferencesStatus");

    const currencyLabels = {
        INR: "INR (₹)",
        USD: "USD ($)",
        EUR: "EUR (€)",
        JPY: "JPY (¥)",
        GBP: "GBP (£)"
    };

    function readStorage(key, fallback) {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : fallback;
        } catch (error) {
            console.error("Could not read saved settings:", error);
            return fallback;
        }
    }

    function writeStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error("Could not save settings:", error);
            return false;
        }
    }

    function getProfileFromForm() {
        return {
            fullName: fullNameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            occupation: occupationInput.value.trim()
        };
    }

    function getPreferencesFromForm() {
        return {
            currency: currencyInput.value,
            theme: themeInput.value
        };
    }

    function getInitials(name) {
        const words = name.trim().split(/\s+/).filter(Boolean);

        if (!words.length) {
            return "U";
        }

        return words
            .slice(0, 2)
            .map(word => word.charAt(0).toUpperCase())
            .join("");
    }

    function showStatus(element, message, isError = false) {
        element.textContent = message;
        element.classList.toggle("error", isError);
    }

    function updateProfileDisplay(profile) {
        const displayName = profile.fullName || "Your Name";
        const displayEmail = profile.email || "your@email.com";
        const initials = getInitials(profile.fullName || "User");

        document.getElementById("sidebarName").textContent = displayName;
        document.getElementById("heroName").textContent = displayName;
        document.getElementById("heroEmail").textContent = displayEmail;

        document.getElementById("sidebarAvatar").textContent = initials;
        document.getElementById("profileAvatar").textContent = initials;

        const isComplete = Boolean(
            profile.fullName &&
            profile.email &&
            fullNameInput.validity.valid &&
            emailInput.validity.valid
        );

        document.getElementById("profileCompletion").textContent =
            isComplete ? "Basic Details Complete" : "In Progress";
    }

    function updatePreferencesDisplay(preferences) {
        const currency = currencyLabels[preferences.currency]
            ? preferences.currency
            : "INR";

        const theme = preferences.theme === "dark" ? "dark" : "light";

        currencyInput.value = currency;
        themeInput.value = theme;

        document.body.classList.toggle("dark-mode", theme === "dark");

        document.getElementById("overviewCurrency").textContent =
            currencyLabels[currency];
    }

    function loadProfile() {
        const profile = readStorage(PROFILE_KEY, {});
        const preferences = readStorage(PREFERENCES_KEY, {
            currency: "INR",
            theme: "light"
        });

        fullNameInput.value = profile.fullName || "";
        emailInput.value = profile.email || "";
        phoneInput.value = profile.phone || "";
        occupationInput.value = profile.occupation || "";

        updateProfileDisplay(profile);
        updatePreferencesDisplay(preferences);
    }

    profileForm.addEventListener("submit", event => {
        event.preventDefault();

        if (!profileForm.reportValidity()) {
            return;
        }

        const profile = getProfileFromForm();

        if (!writeStorage(PROFILE_KEY, profile)) {
            showStatus(
                profileStatus,
                "Unable to save. Check your browser storage settings.",
                true
            );
            return;
        }

        updateProfileDisplay(profile);

        showStatus(
            profileStatus,
            "Your profile has been saved successfully."
        );
    });

    profileForm.addEventListener("reset", () => {
        window.setTimeout(() => {
            const savedProfile = readStorage(PROFILE_KEY, {});
            fullNameInput.value = savedProfile.fullName || "";
            emailInput.value = savedProfile.email || "";
            phoneInput.value = savedProfile.phone || "";
            occupationInput.value = savedProfile.occupation || "";

            updateProfileDisplay(savedProfile);

            showStatus(profileStatus, "Form restored to saved details.");
        }, 0);
    });

    preferencesForm.addEventListener("submit", event => {
        event.preventDefault();

        const preferences = getPreferencesFromForm();

        if (!writeStorage(PREFERENCES_KEY, preferences)) {
            showStatus(
                preferencesStatus,
                "Unable to save preferences. Check browser storage.",
                true
            );
            return;
        }

        updatePreferencesDisplay(preferences);

        showStatus(
            preferencesStatus,
            "Your preferences have been saved."
        );
    });

    // Update the appearance preview before saving.
    themeInput.addEventListener("change", () => {
        document.body.classList.toggle(
            "dark-mode",
            themeInput.value === "dark"
        );
    });

    // Update the currency preview before saving.
    currencyInput.addEventListener("change", () => {
        document.getElementById("overviewCurrency").textContent =
            currencyLabels[currencyInput.value] || currencyLabels.INR;
    });

    // Update the profile preview while typing.
    [fullNameInput, emailInput].forEach(input => {
        input.addEventListener("input", () => {
            updateProfileDisplay(getProfileFromForm());
        });
    });

    loadProfile();
});
