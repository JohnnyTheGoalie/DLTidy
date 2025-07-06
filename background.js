let pendingDownload = null;
//Intercept downloads
browser.downloads.onCreated.addListener(async (downloadItem) => {
    //Check if the extension is enabled
    const { settings } = await browser.storage.local.get("settings");

    if (!settings?.enabled) {
        console.log("Extension is disabled, skipping download interception.");
        return;
    }
   
    //Skip downloads created by an extension
    if (downloadItem.byExtensionId) return;

    const filename = downloadItem.filename.split("\\").pop();
    const url = downloadItem.url;

    //Cancel download
    await browser.downloads.cancel(downloadItem.id);
    pendingDownload = { filename, url };

    browser.windows.create({
        url: browser.runtime.getURL("prompt.html"),
        type: "popup",
        width: 400,
        height: 200,
        left: Math.round((screen.width - 400) / 2),
        top: Math.round((screen.height - 200) / 2)
    });
});

//Handle popup
browser.runtime.onMessage.addListener(async (message) => {
    if (!pendingDownload || !message.choice) return;

    const isTemp = message.choice === "temp";
    const { filename, url} = pendingDownload;

    const downloadOptions = {
        url: url,
        conflictAction: "uniquify"
    };

    try {
        if (isTemp) {
            const tempPath = `clutter/${filename}`;
            downloadOptions.filename = tempPath;
            console.log("Temporary download path:", tempPath, filename);
            try {
                const downloadId = await browser.downloads.download(downloadOptions);

                //Create a record in local storage
                const now = Date.now();
                const newRecord = {
                id: downloadId,
                filename: tempPath,
                created: now
                };

                const result = await browser.storage.local.get("tempDownloads");
                const downloadsList = result.tempDownloads || [];

                downloadsList.push(newRecord);
                await browser.storage.local.set({ tempDownloads: downloadsList });

            } catch (err) {
                console.error("Clutter folder missing or download failed:", err);
                alert("Please create a folder named 'clutter' in your Downloads directory.");
            }
            }
        else {
            console.log("Permanent download path:", downloadOptions);
            await browser.downloads.download(downloadOptions);
            }
        } catch (err) {
            console.error("Download failed:", err);
        }
    pendingDownload = null;
});

//Cleanup the files
async function cleanOldTempDownloads(days = 7) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const result = await browser.storage.local.get("tempDownloads");
    const entries = result.tempDownloads || [];

    const stillValid = [];

    for (const entry of entries) {
        if (entry.created < cutoff) {
        try {
            await browser.downloads.removeFile(entry.id);
            console.log("Removed old file:", entry.filename);
        } catch (err) {
            console.warn("Failed to delete:", entry.filename, err);
        }
        } else {
        stillValid.push(entry); // keep recent ones
        }
    }

    await browser.storage.local.set({ tempDownloads: stillValid });
}

browser.alarms.create("cleanTempDownloads", {
    periodInMinutes: 60
});

browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "cleanTempDownloads") {
        cleanOldTempDownloads();
    }
});
cleanOldTempDownloads();