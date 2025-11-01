/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// System prompt: guide the assistant to only answer L'Oréal product / routine / recommendation questions
const systemPrompt = `You are a helpful assistant specialized in L'Or\eacute;al products, routines, and beauty recommendations. Only answer questions directly related to L'Or\eacute;al brands, products, skincare, makeup, haircare, routines, and usage recommendations. If asked about unrelated topics, politely refuse and offer to help with L'Or\eacute;al product questions instead. Keep answers concise, customer-focused, and friendly. Do not provide medical or legal advice; when relevant, recommend consulting a professional.`;

// Conversation history (maintains context across turns)
const messages = [{ role: "system", content: systemPrompt }];

// Configuration: Set your Worker URL here for GitHub Pages deployment
// For local development, this can be overridden by secrets.js
const WORKER_URL_DEFAULT =
  "https://loreal-chatbot-worker.jnmarsh2005.workers.dev";

// Optional variables coming from secrets.js (for local development)
// secrets.js may define: const WORKER_URL = 'https://<your-worker>.workers.dev'; to override the default
const WORKER =
  typeof WORKER_URL !== "undefined" ? WORKER_URL : WORKER_URL_DEFAULT;

// initial UI greeting
appendSystemGreeting();

function appendSystemGreeting() {
  chatWindow.innerHTML = "";
  appendMessage(
    "ai",
    "👋 Hello! I can help with L'Oréal products, routines, and recommendations. Ask me about a product, routine step, or what suits your skin/hair type."
  );
}

/* Append a message to the chat window */
function appendMessage(role, text, latestUserQuestion = null) {
  const wrapper = document.createElement("div");
  wrapper.className = "msg " + (role === "user" ? "user" : "ai");

  if (latestUserQuestion && role === "ai") {
    const q = document.createElement("div");
    q.className = "latest-question";
    q.textContent = latestUserQuestion;
    wrapper.appendChild(q);
  }

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  wrapper.appendChild(bubble);

  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = userInput.value.trim();
  if (!input) return;

  // Add user message to UI & history
  appendMessage("user", input);
  messages.push({ role: "user", content: input });

  // Clear input
  userInput.value = "";

  // Show a placeholder AI message while waiting
  const thinking = document.createElement("div");
  thinking.className = "msg ai";
  thinking.innerHTML = `<div class="bubble">Thinking…</div>`;
  chatWindow.appendChild(thinking);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Send to Cloudflare Worker endpoint
  if (!WORKER || WORKER.includes("REPLACE_ME")) {
    // Remove thinking
    thinking.remove();
    appendMessage(
      "ai",
      "Worker endpoint not configured. Please set WORKER_URL in secrets.js to your deployed Cloudflare Worker URL."
    );
    return;
  }

  try {
    const resp = await fetch(WORKER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!resp.ok) {
      throw new Error(`Worker error: ${resp.status} ${resp.statusText}`);
    }

    const data = await resp.json();

    // Remove thinking
    thinking.remove();

    // OpenAI response parsing (safety for different shapes)
    let assistantText = "";
    if (data?.choices && data.choices[0]?.message?.content) {
      assistantText = data.choices[0].message.content;
    } else if (data?.choices && data.choices[0]?.text) {
      assistantText = data.choices[0].text;
    } else if (typeof data === "string") {
      assistantText = data;
    } else {
      assistantText =
        "Sorry — I could not understand the response from the worker.";
    }

    // Add assistant message to history & UI (display user's latest question above)
    messages.push({ role: "assistant", content: assistantText });
    appendMessage("ai", assistantText, input);
  } catch (err) {
    thinking.remove();
    console.error(err);
    appendMessage(
      "ai",
      "There was an error contacting the worker: " + String(err)
    );
  }
});

/* Optional: helper to reset conversation (keeps system prompt) */
function resetConversation() {
  messages.length = 0;
  messages.push({ role: "system", content: systemPrompt });
  chatWindow.innerHTML = "";
  appendSystemGreeting();
}

// expose reset for debug in dev console
window.resetConversation = resetConversation;
