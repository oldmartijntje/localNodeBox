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
                    isLocal: false,
                    inDevelopment: false
                },
                {
                    href: "./mqtt-receiver/windows-chat-app/",
                    text: "Windows 95 Chat (MQTT)",
                    isLocal: false,
                    inDevelopment: false
                },
                {
                    href: "./misc/lifeCalander/",
                    text: "Life Calander",
                    isLocal: false,
                    inDevelopment: false
                },
                {
                    href: "./misc/bracketing/tournament.html",
                    text: "Bracketing",
                    isLocal: false,
                    inDevelopment: false
                },
                {
                    href: "./misc/mqttLobby/tic-tac-toe/intercept.html",
                    text: "MQTT Lobby Intercepter",
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
                    isLocal: false,
                    inDevelopment: false
                },
                {
                    href: "./textTools/CharacterCounter/",
                    text: "Character Counter",
                    isLocal: false,
                    inDevelopment: false
                },
                {
                    href: "./textTools/patcher/",
                    text: "Versioning / Patching Tool",
                    isLocal: false,
                    inDevelopment: false
                },
                {
                    href: "./textTools/markdownToWord/",
                    text: "Markdown to docx",
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
                    isLocal: false,
                    inDevelopment: false,
                    onlineOnly: true
                },
                {
                    href: "./dataTools/spotify/playlistFetcher.html",
                    text: "Spotify Playlist",
                    isLocal: false,
                    inDevelopment: false,
                    onlineOnly: true
                }
            ]
        },
        {
            id: "games",
            title: "Games",
            tools: [
                {
                    href: "./misc/randomGame/pong-game.html",
                    text: "Epic Pong Game (vs AI)",
                    isLocal: false,
                    inDevelopment: false
                },
                {
                    href: "./misc/mqttLobby/tic-tac-toe/index.html",
                    text: "Tic Tac Toe online (MQTT)",
                    isLocal: false,
                    inDevelopment: false
                },
                {
                    href: "./misc/timelineSortingGame/index.html",
                    text: "Timeline sorting game",
                    isLocal: false,
                    inDevelopment: false
                }
            ]
        },
        {
            id: "education",
            title: "Educational Tools",
            tools: [
                {
                    href: "./educationalTools/math/snijpunt.html",
                    text: "Line Intersection Excersise",
                    isLocal: false,
                    inDevelopment: false
                }
            ]
        }
    ]
};

function setCategory(categoryId) {
    localStorage.setItem('localNodeBox.index.openedCategory', categoryId);
}

function renderTools(online) {
    const accordion = document.getElementById('toolAccordion');
    accordion.innerHTML = '';
    const openedCategory = localStorage.getItem('localNodeBox.index.openedCategory') || toolsData.categories[0].id;
    let i = 0;
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
                            ${category.tools.map(tool => {
            i++;
            return `<li>
                                    ${tool.isLocal && !online ?
                    `<span class="list-group-item list-group-item-action localTool" data-tool="${i}">${tool.text}</span>` :
                    `<a href="${tool.href}" ${tool.inDevelopment == true ? 'onclick="event.preventDefault()"' : ''} class="list-group-item list-group-item-action ${tool.inDevelopment == true ? 'localTool' : ''}" data-tool="${i}">${tool.text}</a>`
                }
                                </li>
                            `}).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
        accordion.insertAdjacentHTML('beforeend', html);
    });
}