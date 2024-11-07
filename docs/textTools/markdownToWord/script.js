const { Document, Paragraph, TextRun, Packer, HeadingLevel, ExternalHyperlink } = window.docx;
const fileInput = document.getElementById('mdFile');
const preview = document.getElementById('preview');
const convertBtn = document.getElementById('convertBtn');
let markdownContent = '';

// Custom renderer for Obsidian-specific features
const renderer = new marked.Renderer();

// Handle headers in preview
renderer.heading = function (text, level) {
    return `<h${level}>${text}</h${level}>`;
};

// Handle links in preview
renderer.link = function (href, title, text) {
    return `<a href="${href}" ${title ? `title="${title}"` : ''}>${text}</a>`;
};

// Handle Obsidian checkboxes
renderer.listitem = function (text) {
    if (text.includes('[ ]')) {
        return `<li style="list-style-type: none;">
                    <input type="checkbox" disabled> ${text.replace('[ ]', '')}
                </li>`;
    }
    if (text.includes('[x]')) {
        return `<li style="list-style-type: none;">
                    <input type="checkbox" checked disabled> ${text.replace('[x]', '')}
                </li>`;
    }
    return `<li>${text}</li>`;
};

// Process Obsidian-specific markdown features
function processObsidianMarkdownBefore(text) {

    // Handle embedded content
    text = text.replace(
        /!\[(.+?)\]\((.+?)\)/g,
        '<div class="link-placeholder">Embedded content: $1</div>'
    );

    return text;
}

// Process Obsidian-specific markdown features
function processObsidianMarkdownAfter(text) {

    // Handle code blocks
    text = text.replace(
        /```(\w*)\n([\s\S]*?)```/g,
        '<div class="code-block">$2</div>'
    );

    // Handle math equations
    text = text.replace(
        /\$\$(.*?)\$\$/g,
        '<div class="link-placeholder">Math equation: $1</div>'
    );

    // Handle footnotes
    text = text.replace(
        /\[\^(.*?)\]/g,
        '<div class="link-placeholder">Footnote: $1</div>'
    );

    // Handle internal links (formatted as placeholders)
    text = text.replace(
        /\[\[(.*?)\]\]/g,
        '<div class="link-placeholder">[Internal link: $1]</div>'
    );

    return text;
}

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    markdownContent = await file.text();

    // Process Obsidian markdown features before rendering
    const processedContent = processObsidianMarkdownBefore(markdownContent);

    // Set marked options
    marked.setOptions({
        renderer: renderer,
        breaks: true,
        gfm: true
    });

    preview.innerHTML = processObsidianMarkdownAfter(marked.parse(processedContent));
    convertBtn.disabled = false;
});

function getCorrectTextStyling(text) {
    const children = [];
    let currentText = text;

    // Bold
    currentText = currentText.replace(/\*\*(.*?)\*\*/g, (match, text) => {
        children.push(new TextRun({ text, bold: true }));
        return '';
    });

    // Italic
    currentText = currentText.replace(/\*(.*?)\*/g, (match, text) => {
        children.push(new TextRun({ text, italics: true }));
        return '';
    });

    // Add remaining text
    if (currentText.trim()) {
        children.push(new TextRun(currentText));
    }
    return children;
}

// Convert markdown to DOCX paragraphs
function markdownToDocxParagraphs(markdown) {
    const paragraphs = [];
    const headings = [];
    const links = [];

    // Handle headers
    const headerRegex = /^(#{1,6})\s+(.+)$/gm;
    markdown = markdown.replace(headerRegex, (match, hashes, text) => {
        const level = hashes.length;
        console.log(level, text);
        headings.push({
            text: text.trim(),
            heading: {
                level: level === 1 ? HeadingLevel.HEADING_1 :
                    level === 2 ? HeadingLevel.HEADING_2 :
                        level === 3 ? HeadingLevel.HEADING_3 :
                            level === 4 ? HeadingLevel.HEADING_4 :
                                level === 5 ? HeadingLevel.HEADING_5 :
                                    HeadingLevel.HEADING_6
            },
            spacing: { before: 200, after: 200 }
        }
        );
        return '||oldma-heading||';
    });
    console.log(paragraphs, markdown);

    // Handle external links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    markdown = markdown.replace(linkRegex, (match, text, url) => {
        links.push(
            {
                children: [
                    new ExternalHyperlink({
                        children: [
                            new TextRun({
                                text: text,
                                style: "Hyperlink"
                            })
                        ],
                        link: url
                    })
                ]
            }
        );
        return '||oldma-linkAddress||';
    });

    // Previous Obsidian-specific conversions remain the same

    // Handle remaining content with inline formatting
    const lines = markdown.split('\n');
    while (lines.length > 0) {
        const line = lines.shift();
        if (typeof line == typeof {}) {
            paragraphs.push(new Paragraph(line));
            continue;
        }


        if (line.includes('||oldma-heading||')) {
            paragraphs.push(new Paragraph(headings.shift()));
            continue;
        } else if (line.includes('||oldma-linkAddress||')) {
            const lineParts = line.split('||oldma-linkAddress||');
            const linkAddress = links.shift();
            if (lineParts[0]) {
                const arr1 = getCorrectTextStyling(lineParts[0])
                arr1.reverse()
                arr1.forEach(item => linkAddress.children.unshift(item));
            }
            if (lineParts[1]) {
                getCorrectTextStyling(lineParts[1]).forEach(item => linkAddress.children.push(item));
            }
            paragraphs.push(new Paragraph(linkAddress));
            continue;
        }
        if (line.trim()) {
            // Handle basic inline formatting
            const children = getCorrectTextStyling(line)

            if (children.length > 0) {
                paragraphs.push(new Paragraph({ children }));
            }
        }

    }



    return paragraphs;
}

convertBtn.addEventListener('click', async () => {
    const paragraphs = markdownToDocxParagraphs(markdownContent);

    const doc = new Document({
        sections: [{
            properties: {},
            children: paragraphs
        }]
    });

    // Generate the document
    const blob = await Packer.toBlob(doc);

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'obsidian-converted.docx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
});