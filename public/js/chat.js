// js/chat.js
const form = document.getElementById("chatForm");
const promptInput = document.getElementById("prompt");
const messages = document.getElementById("messages");

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");

let chatId = null;

const actionRenderers = {
    "demo-link": renderDemoLink,
    "demo-links": renderDemoLinks,
    "features": renderFeatures,
    "pricing": renderPricing,
    "tech-stack": renderTechStack,
    "overview": renderOverview,
    "ai": ({ message }) => renderAIMessage(message)
};


window.addEventListener("DOMContentLoaded", async () => {

    try {

        const response = await fetch("/chat/new", {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error("Failed to create chat");
        }

        const data = await response.json();

        chatId = data.chatId;

        messages.innerHTML = "";

        if (data.node) {
            renderNode(data.node);
        }

    } catch (error) {

        console.error("CREATE_CHAT_ERROR:", error);

        renderAIMessage(
            "Unable to start conversation. Please refresh the page."
        );

    }

});


form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const prompt = promptInput.value.trim();

    if (!prompt) return;

    if (!chatId) {

        renderAIMessage(
            "Chat session not ready. Please refresh the page."
        );

        return;
    }

    renderUserMessage(prompt);

    promptInput.value = "";

    const thinkingMessage =
        renderAIMessage("Thinking...");

    try {

        const response =
            await fetch("/chat/message", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    chatId,

                    message: prompt

                })

            });

        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(errorText);

        }

        const data = await response.json();

        // Remove the "Thinking..." message
        thinkingMessage.remove();

        if (data.node) {
            renderNode(data.node);
            return;
        }

        if (data.action) {
            renderAction(data);
            return;
        }

        // Normal AI message
        renderAIMessage(data.message);

    } catch (error) {

        console.error(
            "SEND_MESSAGE_ERROR:",
            error
        );

        thinkingMessage.querySelector(
            ".bubble"
        ).textContent =
            "Sorry, I couldn't process your request.";

    }

});


function renderUserMessage(text) {

    messages.insertAdjacentHTML(
        "beforeend",
        `
        <div class="message user">
            <div class="bubble">${escapeHtml(text)}</div>
        </div>
        `
    );

    scrollBottom();
}


function renderAIMessage(text) {

    messages.insertAdjacentHTML(
        "beforeend",
        `
        <div class="message ai">
            <div class="avatar">AI</div>
            <div class="bubble ai-content">${formatMessage(text)}</div>
        </div>
        `
    );

    scrollBottom();

    return messages.lastElementChild;
}


function renderNode(node) {

    let html = `
        <div class="message ai node-message" id="node-${node.id}">
            <div class="avatar">AI</div>
            <div class="bubble ai-content">
    `;

    if (node.title) {
        html += `<h3>${node.title}</h3>`;
    }

    if (node.message) {
        html += `<p>${node.message}</p>`;
    }

    if (node.options?.length) {

        node.options.forEach(option => {

            html += `
            <button
                class="menu-option node-option"
                data-option-id="${option.id}"
                onclick="selectNodeOption('${node.id}','${option.id}','${option.label || option.text}')">
                ${option.label || option.text}
            </button>
            `;

        });

    }

    html += `
            </div>
        </div>
    `;

    messages.insertAdjacentHTML("beforeend", html);

    scrollBottom();
}

function lockNode(nodeId, selectedOptionId) {

    const node = document.getElementById(`node-${nodeId}`);

    if (!node) return;

    const buttons = node.querySelectorAll(".node-option");

    buttons.forEach(button => {

        button.disabled = true;

        button.title =
            "You already chose an option. Start a new chat to explore another path.";

        if (button.dataset.optionId === selectedOptionId) {
            button.classList.add("selected");
            button.innerHTML = "✓ " + button.innerHTML;
        }

    });

}

function scrollBottom() {

    messages.scrollTop =
        messages.scrollHeight;

}

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


function formatMessage(text) {

    const lines = text.split("\n");

    let html = "";

    for (let line of lines) {

        const trimmed = line.trim();

        if (!trimmed) continue;

        // MENU OPTIONS (clickable)
        if (/^\d+\.\s/.test(trimmed)) {

            const value = trimmed.replace(/^\d+\.\s/, "");

            html += `
                <button class="menu-option node-option" onclick="selectOption('${value}')">
                    ${value}
                </button>
            `;
            continue;
        }

        // bullet points
        if (/^[-•]\s/.test(trimmed)) {
            html += `<div class="bullet">• ${trimmed.replace(/^[-•]\s/, "")}</div>`;
            continue;
        }

        // normal text
        html += `<div>${trimmed}</div>`;
    }

    return html;
}

function renderDemoLinks(data) {

    let html = `
        <div class="message ai">
            <div class="avatar">AI</div>
            <div class="bubble ai-content">
                <p>${data.message}</p>
    `;

    data.demos.forEach(demo => {

        html += `
            <div class="demo-item">
                <strong>${demo.name}</strong><br>

                <a
                    href="${demo.demoUrl}"
                    target="_blank"
                    rel="noopener noreferrer">
                    View Live Demo
                </a>
            </div>
            <br>
        `;

    });

    html += `
            </div>
        </div>
    `;

    messages.insertAdjacentHTML("beforeend", html);

    scrollBottom();
}

function renderAction(data) {

    const renderer = actionRenderers[data.action];

    if (!renderer) {
        console.warn("Unknown action:", data);
        return renderAIMessage("Unknown response received.");
    }

    return renderer(data);

}

function renderDemoLink(data) {

    const html = `
        <div class="demo-item">
            <div class="avatar">AI</div>
            <div class="bubble ai-content">
                <h3>${data.name}</h3>

                <a href="${data.demoUrl}"
                   target="_blank"
                   rel="noopener noreferrer">
                    🌐 View Live Demo
                </a>
            </div>
        </div>
    `;

    messages.insertAdjacentHTML("beforeend", html);

    scrollBottom();

}

function renderFeatures(data) {
    console.log("Rendering features:", data);

    const { name, features } = data;

    let html = `
        <div class="message ai">
            <div class="avatar">AI</div>
            <div class="bubble ai-content">
                <h3>✨ ${name} Features</h3>
    `;

    if (features.frontend?.length) {

        html += `
            <h4>Frontend</h4>
            <ul>
        `;

        features.frontend.forEach(feature => {
            html += `<li>${feature}</li>`;
        });

        html += `</ul>`;
    }

    if (features.backend?.length) {

        html += `
            <h4>Backend</h4>
            <ul>
        `;

        features.backend.forEach(feature => {
            html += `<li>${feature}</li>`;
        });

        html += `</ul>`;
    }

    if (features.techStack) {

        html += `
            <h4>Tech Stack</h4>
            <p>${features.techStack}</p>
        `;
    }

    html += `
            </div>
        </div>
    `;

    messages.insertAdjacentHTML("beforeend", html);

    scrollBottom();
}

function renderTechStack(data) {

    let html = `
        <div class="message ai">
            <div class="avatar">AI</div>
            <div class="bubble ai-content">
                <h3>🛠 Tech Stack</h3>
                <p>${data.techStack}</p>
            </div>
        </div>
    `;

    messages.insertAdjacentHTML("beforeend", html);

    scrollBottom();

}

function renderPricing(data) {

    let html = `
        <div class="message ai">
            <div class="avatar">AI</div>
            <div class="bubble ai-content">
                <h3>💰 Pricing</h3>
                <p>${data.pricing}</p>
            </div>
        </div>
    `;

    messages.insertAdjacentHTML("beforeend", html);

    scrollBottom();

}

function renderOverview(data) {

    const lines = data.description
        .replace(/\r/g, "")
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

    let html = `
        <div class="message ai">
            <div class="avatar">AI</div>
            <div class="bubble ai-content">
                <h3>🌟 About ${data.name}</h3>
    `;

    let inList = false;
    let skippedTitle = false;

    for (const line of lines) {

        // Skip "Product Overview" because we already have our own title
        if (!skippedTitle && line.toLowerCase() === "product overview") {
            skippedTitle = true;
            continue;
        }

        // Bullet item
        if (line.startsWith("- ")) {

            if (!inList) {
                html += "<ul>";
                inList = true;
            }

            html += `<li>${line.substring(2)}</li>`;
            continue;
        }

        // Close list before starting a new section
        if (inList) {
            html += "</ul>";
            inList = false;
        }

        // Emoji headings
        if (/^[^\w\s]/.test(line)) {
            html += `<h4>${line}</h4>`;
            continue;
        }

        // Normal paragraph
        html += `<p>${line}</p>`;
    }

    if (inList) {
        html += "</ul>";
    }

    html += `
            </div>
        </div>
    `;

    messages.insertAdjacentHTML("beforeend", html);

    scrollBottom();
}

window.selectOption = function(option) {

    promptInput.value = option;

    form.dispatchEvent(new Event("submit"));
};

window.selectNodeOption = async function(nodeId, optionId, label) {
    // 1. Show user message immediately
    renderUserMessage (label || optionId);
    lockNode(nodeId, optionId);

    try {

        const response = await fetch("/chat/menu", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                chatId,
                optionId
            })

            
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Menu error");
        }

        if (data.node) {
            return renderNode(data.node);
        }

        if (data.action) {
            return renderAction(data);
        }

        renderAIMessage("Unknown response from server.");

    } catch (error) {

        console.error("MENU_CLICK_ERROR:", error);

        renderAIMessage ("Something went wrong loading the menu.");
    }
};

if (menuBtn && sidebar) {

    menuBtn.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "active"
            );

        }
    );

}