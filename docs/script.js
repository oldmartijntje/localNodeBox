document.addEventListener('DOMContentLoaded', function () {
    const statusElement = document.getElementById('status');
    const descriptionElement = document.getElementById('description');
    const toolLinks = document.querySelectorAll('.localTool');

    // Ping the local server to check if it's running
    fetch('http://localhost:3030/ping')
        .then(response => {
            if (response.ok) {
                statusElement.textContent = 'Running locally';
            } else {
                throw new Error('Not running locally');
            }
        })
        .catch(error => {
            statusElement.textContent = 'Not running locally';
            descriptionElement.textContent = "⚠️You are not running this locally, some tools require you to run this locally⚠️";
            // Optionally disable tools if not running locally
            toolLinks.forEach(link => {
                link.classList.add('disabled');
            });
        });
});
