const { Document, Paragraph, TextRun, Packer, HeadingLevel, ExternalHyperlink, ImageRun } = window.docx;
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

async function fetchImageAsBase64(url) {
    try {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        const base64 = btoa(
            new Uint8Array(response.data).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ""
            )
        );
        return `data:${response.headers["content-type"]};base64,${base64}`;
    } catch (error) {
        console.warn(`CORS issue or fetch error for URL: ${url}`, error);
        return null; // Return null to indicate failure
    }
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
async function markdownToDocxParagraphs(markdown) {
    const paragraphs = [];
    const headings = [];
    const links = [];
    const bulletPoints = [];
    const images = [];

    // Handle images first (separately from bullet points)
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    markdown = markdown.replace(imageRegex, (match, altText, imageUrl) => {
        images.push({ altText, url: imageUrl });
        return '||image-placeholder||';
    });

    // Handle bullet points first - with nested markdown parsing
    const bulletPointRegex = /^(\s*-\s+)(.+)$/gm;
    markdown = markdown.replace(bulletPointRegex, (match, bulletPrefix, text) => {
        const tempLinks = [];
        const nestedLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const processedText = text.replace(nestedLinkRegex, (linkMatch, linkText, linkUrl) => {
            tempLinks.push({
                type: 'link',
                text: linkText,
                url: linkUrl
            });
            return '||oldma-nested-linkAddress||';
        });

        bulletPoints.push({
            type: 'bullet',
            text: processedText,
            links: tempLinks,
            indent: bulletPrefix.length - 3 // Calculate indentation level
        });
        return '||oldma-bulletpoint||';
    });

    // Handle headers 
    const headerRegex = /^(#{1,6})\s+(.+)$/gm;
    markdown = markdown.replace(headerRegex, (match, hashes, text) => {
        const level = hashes.length;
        headings.push({
            type: 'heading',
            text: text.trim(),
            level: level === 1 ? HeadingLevel.HEADING_1 :
                level === 2 ? HeadingLevel.HEADING_2 :
                    level === 3 ? HeadingLevel.HEADING_3 :
                        level === 4 ? HeadingLevel.HEADING_4 :
                            level === 5 ? HeadingLevel.HEADING_5 :
                                HeadingLevel.HEADING_6
        });
        return '||oldma-heading||';
    });

    // Handle external links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    markdown = markdown.replace(linkRegex, (match, text, url) => {
        links.push({
            type: 'link',
            text: text,
            url: url
        });
        return '||oldma-linkAddress||';
    });

    // Process remaining content
    const lines = markdown.split('\n');
    while (lines.length > 0) {
        const line = lines.shift();

        // Preserve empty lines
        if (line.trim() === '') {
            paragraphs.push(new Paragraph({}));
            continue;
        }

        // Handle images
        if (line.includes('||image-placeholder||')) {
            const imageInfo = images.shift();
            const base64Image = await fetchImageAsBase64(imageInfo.url);

            if (base64Image) {
                console.log(`Successfully fetched image: ${imageInfo.url}`);
                // Successfully fetched image, insert it
                paragraphs.push(
                    new Paragraph({
                        children: [
                            new ImageRun({
                                data: base64Image,
                                transformation: { width: 300, height: 200 },
                            }),
                        ],
                    })
                );
            } else {
                console.log(`Failed to fetch image: ${imageInfo.url}`);
                // Failed to fetch image, insert a hyperlink instead
                paragraphs.push(
                    new Paragraph({
                        children: [
                            new TextRun(`Image could not be embedded. Access it here: `),
                            new ExternalHyperlink({
                                children: [
                                    new TextRun({
                                        text: `[${imageInfo.altText || "Image"}]`,
                                        style: "Hyperlink",
                                    }),
                                ],
                                link: imageInfo.url,
                            }),
                        ],
                    })
                );
            }
            continue;
        }

        // Handle bullet points
        if (line.includes('||oldma-bulletpoint||')) {
            const bulletInfo = bulletPoints.shift();
            const bulletChildren = [];

            // Handle text before first link
            let currentText = bulletInfo.text;

            // Process nested links
            while (currentText.includes('||oldma-nested-linkAddress||')) {
                const linkIndex = currentText.indexOf('||oldma-nested-linkAddress||');

                // Add text before link
                if (linkIndex > 0) {
                    const beforeLinkText = currentText.slice(0, linkIndex);
                    bulletChildren.push(...getCorrectTextStyling(beforeLinkText));
                }

                const linkInfo = bulletInfo.links.shift();
                bulletChildren.push(
                    new ExternalHyperlink({
                        children: [
                            new TextRun({
                                text: linkInfo.text,
                                style: "Hyperlink"
                            })
                        ],
                        link: linkInfo.url
                    })
                );

                currentText = currentText.slice(linkIndex + 28);
            }

            if (currentText.trim()) {
                bulletChildren.push(...getCorrectTextStyling(currentText));
            }

            paragraphs.push(
                new Paragraph({
                    bullet: { level: 0 }, // You can adjust level based on bulletInfo.indent if needed
                    children: bulletChildren
                })
            );
            continue;
        }

        // Handle headings
        if (line.includes('||oldma-heading||')) {
            const headingInfo = headings.shift();
            paragraphs.push(
                new Paragraph({
                    heading: headingInfo.level,
                    children: [
                        new TextRun({
                            text: headingInfo.text,
                            size: headingInfo.level === HeadingLevel.HEADING_1 ? 32 :
                                headingInfo.level === HeadingLevel.HEADING_2 ? 28 :
                                    headingInfo.level === HeadingLevel.HEADING_3 ? 24 : 22
                        })
                    ]
                })
            );
            continue;
        }

        // Handle links
        const linkCount = (line.match(/\|\|oldma-linkAddress\|\|/g) || []).length;
        if (line.includes('||oldma-linkAddress||')) {
            const lineChildren = [];
            let currentLine = line;

            for (let i = 0; i < linkCount; i++) {
                const linkInfo = links.shift();
                const linkIndex = currentLine.indexOf('||oldma-linkAddress||');

                if (linkIndex > 0) {
                    const beforeLinkText = currentLine.slice(0, linkIndex);
                    lineChildren.push(...getCorrectTextStyling(beforeLinkText));
                }

                lineChildren.push(
                    new ExternalHyperlink({
                        children: [
                            new TextRun({
                                text: linkInfo.text,
                                style: "Hyperlink",
                            })
                        ],
                        link: linkInfo.url
                    })
                );

                currentLine = currentLine.slice(linkIndex + 21);
            }

            if (currentLine.trim()) {
                lineChildren.push(...getCorrectTextStyling(currentLine));
            }

            paragraphs.push(new Paragraph({ children: lineChildren }));
            continue;
        }

        // Handle regular text with inline formatting
        const children = getCorrectTextStyling(line);
        if (children.length > 0) {
            paragraphs.push(new Paragraph({ children }));
        }
    }

    return paragraphs;
}

convertBtn.addEventListener('click', async () => {
    const paragraphs = await markdownToDocxParagraphs(markdownContent);
    console.log("ready to assemble");

    const doc = new Document({
        sections: [{
            properties: {},
            children: paragraphs
        }]
    });
    console.log("assembled");

    // Generate the document
    const blob = await Packer.toBlob(doc);

    console.log("generated");

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'obsidian-converted.docx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    console.log("downloaded");
});