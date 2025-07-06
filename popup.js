document.addEventListener("DOMContentLoaded", async () => {
    const storage = await browser.storage.local.get("settings");
    const settings = storage.settings || {};

    const radios = document.querySelectorAll('input[name="default"]');
    const enableCheckbox = document.getElementById("enabledToggle");

    // Set default radio selection
    const defaultChoice = settings.defaultChoice || "temp";
    const selectedRadio = document.querySelector(`input[name="default"][value="${defaultChoice}"]`);
    if (selectedRadio) selectedRadio.checked = true;

    // Set checkbox (enabled by default unless explicitly false)
    enableCheckbox.checked = settings.enabled !== false;

    // Save when radio changes
    radios.forEach((radio) => {
        radio.addEventListener("change", async () => {
            const newSettings = {
                ...settings,
                defaultChoice: radio.value,
                enabled: enableCheckbox.checked
            };
            await browser.storage.local.set({ settings: newSettings });
        });
    });

    // Save when checkbox toggles
    enableCheckbox.addEventListener("change", async () => {
        const newSettings = {
            ...settings,
            enabled: enableCheckbox.checked,
            defaultChoice:
                (document.querySelector('input[name="default"]:checked') || {}).value || "temp"
        };
        await browser.storage.local.set({ settings: newSettings });
    });
});
