// dark-mode.js (ES Module)
export function initDarkMode() {
    const darkSwitch = document.getElementById("darkSwitch");
    if (!darkSwitch) return;

    // Ambil preferensi dark mode dari localStorage
    const darkPref = localStorage.getItem("darkMode") === "true";
    document.body.classList.toggle("dark-mode", darkPref);
    darkSwitch.checked = darkPref;

    // Event listener toggle dark mode
    darkSwitch.addEventListener("change", () => {
        const isDark = darkSwitch.checked;
        document.body.classList.toggle("dark-mode", isDark);
        localStorage.setItem("darkMode", isDark);
    });
}

