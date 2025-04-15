(function () {
    const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    const importCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "a", "b"];
    let konamiIndex = 0;
    let importIndex = 0;

    function exportLocalStorage() {
        const localStorageData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            localStorageData[key] = localStorage.getItem(key);
        }

        const domain = window.location.hostname.replace(/[^a-zA-Z0-9.-]/g, "_"); // Sanitize domain name
        const fileName = `${domain}_localStorage.json`;

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorageData, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", fileName);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
    }

    function importLocalStorage(file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const data = JSON.parse(event.target.result);
                localStorage.clear();
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        localStorage.setItem(key, data[key]);
                    }
                }
                alert("LocalStorage import successful!");
            } catch (e) {
                alert("Failed to import localStorage: " + e.message);
            }
        };
        reader.readAsText(file);
    }

    function triggerFileInput() {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".json";
        fileInput.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) {
                importLocalStorage(file);
            }
        });
        fileInput.click();
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                exportLocalStorage();
                konamiIndex = 0; // Reset for future use
            }
        } else {
            konamiIndex = 0; // Reset if the sequence breaks
        }

        if (event.key === importCode[importIndex]) {
            importIndex++;
            if (importIndex === importCode.length) {
                triggerFileInput();
                importIndex = 0; // Reset for future use
            }
        } else {
            importIndex = 0; // Reset if the sequence breaks
        }
    });
})();