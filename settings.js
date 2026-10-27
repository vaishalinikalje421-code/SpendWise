
document.addEventListener("DOMContentLoaded", () => {
    const currencySelect = document.getElementById("currency");
    const darkModeToggle = document.getElementById("darkMode");
    const budgetAlerts = document.getElementById("budgetAlerts");
    const weeklySummary = document.getElementById("weeklySummary");
    const transactionReminders = document.getElementById("transactionReminders");

    const saveButton = document.getElementById("saveSettings");
    const resetButton = document.getElementById("resetSettings");
    const message = document.getElementById("settingsMessage");
    const themeToggle = document.getElementById("themeToggle");

    const STORAGE_KEY = "spendwisePreferences";

    const defaults = {
        currency: "INR",
        darkMode: false,
        budgetAlerts: true,
        weeklySummary: true,
        transactionReminders: false
    };

    function loadPreferences() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

            return {
                ...defaults,
                ...saved
            };
        } catch (error) {
            console.error("Could not load preferences:", error);
            return { ...defaults };
        }
    }

    function savePreferences(preferences) {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(preferences)
            );
            return true;
        } catch (error) {
            console.error("Could not save preferences:", error);
            showMessage("Could not save settings. Please try again.", true);
            return false;
        }
    }

    function showMessage(text, isError = false) {
        message.textContent = text;
        message.style.color = isError ? "#d93025" : "#24864a";
    }

    function applyTheme(isDark) {
        document.body.classList.toggle("dark-mode", isDark);

        // Keep the theme toggle consistent with the dashboard.
        if (themeToggle) {
            themeToggle.textContent = isDark ? "☀️" : "🌙";
            themeToggle.setAttribute(
                "aria-label",
                isDark ? "Switch to light mode" : "Switch to dark mode"
            );
        }
    }

    function getPreferencesFromForm() {
        return {
            ...loadPreferences(),
            currency: currencySelect.value,
            darkMode: darkModeToggle.checked,
            budgetAlerts: budgetAlerts.checked,
            weeklySummary: weeklySummary.checked,
            transactionReminders: transactionReminders.checked
        };
    }

    function displayPreferences(preferences) {
        currencySelect.value = preferences.currency;
        darkModeToggle.checked = preferences.darkMode;
        budgetAlerts.checked = preferences.budgetAlerts;
        weeklySummary.checked = preferences.weeklySummary;
        transactionReminders.checked = preferences.transactionReminders;

        applyTheme(preferences.darkMode);
    }

    // Load saved preferences when the page opens.
    const preferences = loadPreferences();
    displayPreferences(preferences);

    // Update the preview when the dark mode switch changes.
    darkModeToggle.addEventListener("change", () => {
        applyTheme(darkModeToggle.checked);
        showMessage("Theme preview updated. Save to keep your changes.");
    });

    // Save all settings.
    saveButton.addEventListener("click", () => {
        const preferences = getPreferencesFromForm();

        if (savePreferences(preferences)) {
            applyTheme(preferences.darkMode);
            showMessage("Settings saved successfully!");
        }
    });

    // Restore default settings.
    resetButton.addEventListener("click", () => {
        displayPreferences({ ...defaults });

        if (savePreferences({ ...defaults })) {
            showMessage("Settings restored to defaults.");
        }
    });

    // Allow the top-right theme button to work on this page too.
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            darkModeToggle.checked = !darkModeToggle.checked;
            applyTheme(darkModeToggle.checked);

            const preferences = getPreferencesFromForm();

            if (savePreferences(preferences)) {
                showMessage("Theme preference saved.");
            }
        });
    }
});
