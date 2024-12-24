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
            renderTools(true)
        })
        .catch(error => {
            statusElement.textContent = 'Not running locally';
            descriptionElement.textContent = "⚠️You are not running this locally, some tools require you to run this locally⚠️";
            renderTools(false)
            // Optionally disable tools if not running locally
        });


});

// Load tools data
const toolsData = {
    categories: [
        {
            id: "miscTools",
            title: "Miscellaneous Tools",
            tools: [
                {
                    href: "./mqtt-receiver",
                    text: "MQTT Receiver",
                    toolId: "1",
                    isLocal: false,
                    inDevelopment: false
                },
                {
                    href: "./mqtt-receiver/windows-chat-app/",
                    text: "Windows 95 Chat (MQTT)",
                    toolId: "2",
                    isLocal: false,
                    inDevelopment: false
                },
                {
                    href: "./misc/lifeCalander/",
                    text: "Life Calander",
                    toolId: "2",
                    isLocal: false,
                    inDevelopment: false
                },
                {
                    href: "./misc/bracketing/tournament.html",
                    text: "Bracketing",
                    toolId: "6",
                    isLocal: false,
                    inDevelopment: false
                }
            ]
        },
        {
            id: "textTools",
            title: "Text Tools",
            tools: [
                {
                    href: "./textTools/character_convertor/",
                    text: "Character Convertor",
                    toolId: "3",
                    isLocal: false,
                    inDevelopment: false
                },
                {
                    href: "./textTools/CharacterCounter/",
                    text: "Character Counter",
                    toolId: "4",
                    isLocal: false,
                    inDevelopment: false
                },
                {
                    href: "./textTools/patcher/",
                    text: "Versioning / Patching Tool",
                    toolId: "5",
                    isLocal: false,
                    inDevelopment: false
                },
                {
                    href: "./textTools/markdownToWord/",
                    text: "Markdown to docx",
                    toolId: "5",
                    isLocal: false,
                    inDevelopment: true
                }
            ]
        },
        {
            id: "dataTools",
            title: "Tools for gathering data etc.",
            tools: [
                {
                    href: "./dataTools/spotify",
                    text: "Spotify Login",
                    toolId: "7",
                    isLocal: false,
                    inDevelopment: false,
                    onlineOnly: true
                },
                {
                    href: "./dataTools/spotify/playlistFetcher.html",
                    text: "Spotify Playlist",
                    toolId: "8",
                    isLocal: false,
                    inDevelopment: false,
                    onlineOnly: true
                }
            ]
        }
    ]
};

function setCategory(categoryId) {
    localStorage.setItem('openedCategory', categoryId);
}

function renderTools(online) {
    const accordion = document.getElementById('toolAccordion');
    accordion.innerHTML = '';
    const openedCategory = localStorage.getItem('openedCategory') || toolsData.categories[0].id;

    toolsData.categories.forEach((category, index) => {
        const isFirst = category.id === openedCategory;
        const html = `
            <div class="accordion-item">
                <h2 class="accordion-header" id="heading${category.id}" onclick="setCategory('${category.id}')">
                    <button class="accordion-button ${!isFirst ? 'collapsed' : ''}" type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#collapse${category.id}" 
                        aria-expanded="${isFirst}" 
                        aria-controls="collapse${category.id}">
                        ${category.title}
                    </button>
                </h2>
                <div id="collapse${category.id}" 
                    class="accordion-collapse collapse ${isFirst ? 'show' : ''}" 
                    aria-labelledby="heading${category.id}" 
                    data-bs-parent="#toolAccordion">
                    <div class="accordion-body">
                        <ul class="list-group">
                            ${category.tools.map(tool => `
                                <li>
                                    ${tool.isLocal && !online ?
                `<span class="list-group-item list-group-item-action localTool" data-tool="${tool.toolId}">${tool.text}</span>` :
                `<a href="${tool.href}" ${tool.inDevelopment == true ? 'onclick="event.preventDefault()"' : ''} class="list-group-item list-group-item-action ${tool.inDevelopment == true ? 'localTool' : ''}" data-tool="${tool.toolId}">${tool.text}</a>`
            }
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
        accordion.insertAdjacentHTML('beforeend', html);
    });
}