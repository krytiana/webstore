// js/chat.js
const form = document.getElementById("chatForm");
const promptInput = document.getElementById("prompt");
const messages = document.getElementById("messages");

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");

let chatId = null;

/*
|--------------------------------------------------------------------------
| Create Chat On Page Load
|--------------------------------------------------------------------------
*/

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

        if (data.messages?.length) {

            data.messages.forEach(message => {

                if (message.role === "assistant") {
                    addAIMessage(message.content);
                } else {
                    addUserMessage(message.content);
                }

            });

        }

    } catch (error) {

        console.error("CREATE_CHAT_ERROR:", error);

        addAIMessage(
            "Unable to start conversation. Please refresh the page."
        );

    }

});

/*
|--------------------------------------------------------------------------
| Send Message
|--------------------------------------------------------------------------
*/

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const prompt = promptInput.value.trim();

    if (!prompt) return;

    if (!chatId) {

        addAIMessage(
            "Chat session not ready. Please refresh the page."
        );

        return;
    }

    addUserMessage(prompt);

    promptInput.value = "";

    const loadingMessage =
        addAIMessage("Thinking...");

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

        const data =
            await response.json();

        loadingMessage.querySelector(
            ".bubble"
        ).textContent = data.message;

    } catch (error) {

        console.error(
            "SEND_MESSAGE_ERROR:",
            error
        );

        loadingMessage.querySelector(
            ".bubble"
        ).textContent =
            "Sorry, I couldn't process your request.";

    }

});

/*
|--------------------------------------------------------------------------
| UI Helpers
|--------------------------------------------------------------------------
*/

function addUserMessage(text) {

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

function addAIMessage(text) {

    messages.insertAdjacentHTML(
        "beforeend",
        `
        <div class="message ai">
            <div class="avatar">AI</div>
            <div class="bubble ai-content">${formatAI(text)}</div>
        </div>
        `
    );

    scrollBottom();

    return messages.lastElementChild;
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


function formatAI(text) {

    const lines = text.split("\n");

    let html = "";

    for (let line of lines) {

        const trimmed = line.trim();

        if (!trimmed) continue;

        // MENU OPTIONS (clickable)
        if (/^\d+\.\s/.test(trimmed)) {

            const value = trimmed.replace(/^\d+\.\s/, "");

            html += `
                <button class="menu-option" onclick="selectOption('${value}')">
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

window.selectOption = function(option) {

    promptInput.value = option;

    form.dispatchEvent(new Event("submit"));
};
/*
|--------------------------------------------------------------------------
| Mobile Menu
|--------------------------------------------------------------------------
*/

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