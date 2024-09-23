document.addEventListener('DOMContentLoaded', function () {
    const statusElement = document.getElementById('status');
    const toolLinks = document.querySelectorAll('.tool');

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
            // Disable some tools if not running locally
            toolLinks.forEach(link => {
                const toolId = link.getAttribute('data-tool');
                if (toolId === '2' || toolId === '4') {
                    link.classList.add('disabled');
                }
            });
        });
});
