---
layout: post
codemirror: true
title: Input/Output
description: Input/Output - CS111 Review
permalink: /In-Out
---

| MainHub | Lessons | Game Overview |
| ------- | ------ | ------ |
| [Let's Go!](https://aashihegu1-stack.github.io/Group/MainHub) | [Let's Go!](https://aashihegu1-stack.github.io/Group/Lessons) | [Let's Go!](https://aashihegu1-stack.github.io/Group/PGO) |

---


<div id="io-app" style="font-family: Arial; max-width: 650px;">
  <h2>Input / Output (Interactive Viewer)</h2>
  <p>Click a category to explore examples and explanations.</p>

  <div id="io-list"></div>
</div>

<script>
// ----------------------
// INPUT / OUTPUT DATA
// ----------------------
const ioCategories = [
  {
    name: "Canvas Rendering",
    description: `
      <p><strong>Drawing Shapes:</strong></p>
      <pre style="background:#f0f0f0; padding:8px;">
ctx.fillRect(x, y, width, height);
ctx.drawImage(sprite, x, y);
      </pre>
      <p><strong>Use Case:</strong> Rendering sprites, backgrounds, UI elements, animations.</p>
      <p>Canvas output is the visual layer of your game — everything the player sees is drawn here.</p>
    `
  },
  {
    name: "Keyboard Event Handlers",
    description: `
      <p><strong>Key Down:</strong></p>
      <pre style="background:#f0f0f0; padding:8px;">
window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") player.jump();
});
      </pre>
      <p><strong>Key Up:</strong></p>
      <pre style="background:#f0f0f0; padding:8px;">
window.addEventListener("keyup", (e) => {
    player.stopMoving();
});
      </pre>
      <p><strong>Use Case:</strong> Movement, attacks, menu navigation, pausing the game.</p>
    `
  },
  {
    name: "GameEnv Configuration",
    description: `
      <p><strong>Example Config:</strong></p>
      <pre style="background:#f0f0f0; padding:8px;">
const gameEnv = new GameEnv({
    width: 800,
    height: 600,
    gravity: 0.4,
    debug: false
});
      </pre>
      <p><strong>Use Case:</strong> Setting world size, physics, difficulty, assets, and global rules.</p>
      <p>GameEnv acts as the input that defines how your entire game world behaves.</p>
    `
  },
  {
    name: "API Calls (Leaderboard / NPC AI)",
    description: `
      <p><strong>Leaderboard Fetch:</strong></p>
      <pre style="background:#f0f0f0; padding:8px;">
fetch("/api/leaderboard")
  .then(res => res.json())
  .then(data => updateLeaderboard(data));
      </pre>

      <p><strong>NPC AI Request:</strong></p>
      <pre style="background:#f0f0f0; padding:8px;">
fetch("/api/npc/behavior?id=pirate01")
  .then(res => res.json())
  .then(ai => npc.applyBehavior(ai));
      </pre>

      <p><strong>Use Case:</strong> Online scores, cloud saves, dynamic NPC behavior, remote configs.</p>
      <p>API calls allow your game to communicate with servers and external systems.</p>
    `
  }
];

// ----------------------
// RENDER INTERACTIVE VIEWER
// ----------------------
const ioContainer = document.getElementById("io-list");

ioCategories.forEach((item, index) => {
  const wrapper = document.createElement("div");
  wrapper.style.marginBottom = "10px";

  const button = document.createElement("button");
  button.textContent = `${index + 1}. ${item.name}`;
  button.style.width = "100%";
  button.style.padding = "10px";
  button.style.textAlign = "left";
  button.style.cursor = "pointer";
  button.style.border = "1px solid #8c00ff";
  button.style.background = "#57197d";
  button.style.fontSize = "16px";

  const details = document.createElement("div");
  details.style.display = "none";
  details.style.padding = "10px";
  details.style.border = "1px solid #ddd";
  details.style.borderTop = "none";
  details.style.background = "#fff";
  details.style.lineHeight = "1.6";
  details.innerHTML = item.description;

  button.addEventListener("click", () => {
    details.style.display = details.style.display === "none" ? "block" : "none";
  });

  wrapper.appendChild(button);
  wrapper.appendChild(details);
  ioContainer.appendChild(wrapper);
});
</script>

---

⭐ **Overview: Input / Output in Game Development**

Input/Output (I/O) is the communication layer of your game — the bridge between the player, the game world, and external systems. It determines **how your game receives information** (input) and **how it displays or sends information** (output). Without I/O, your game wouldn’t move, react, draw, or communicate.

In practice, I/O covers everything from rendering graphics to handling keyboard input to loading configuration files to making API calls. Below is a deeper look at the four major I/O systems you’re working with.

---

## 🎨 **1. Canvas Rendering (Output)**  
Canvas rendering is how your game draws everything the player sees. It’s the visual output layer responsible for:

- Sprites  
- Backgrounds  
- UI elements  
- Animations  
- Effects (particles, flashes, shadows)  

### **How It Works**
The game uses a rendering context (usually `ctx`) to draw shapes, images, and text onto the canvas every frame.

Examples include:

- `ctx.fillRect(x, y, width, height)`  
- `ctx.drawImage(sprite, x, y)`  

### **Why It Matters**
Canvas rendering is the heartbeat of your game’s visuals. Every frame, it outputs the current state of the world — positions, animations, effects — giving the player a smooth, responsive experience.

---

## ⌨️ **2. Keyboard Event Handlers (Input)**  
Keyboard events are how the player communicates with your game. They provide real‑time input that drives movement, actions, and UI navigation.

### **How It Works**
JavaScript listens for events like:

- `keydown` — when a key is pressed  
- `keyup` — when a key is released  

These events trigger functions that update the player’s state:

- Jumping  
- Moving left/right  
- Attacking  
- Pausing  
- Opening menus  

### **Why It Matters**
Without keyboard input, your game wouldn’t be interactive. Event handlers translate physical key presses into in‑game actions, making the player feel connected to the world.

---

## ⚙️ **3. GameEnv Configuration (Input)**  
GameEnv configuration is the structured input that defines how your game world behaves. It’s not player input — it’s *system input* that sets the rules of the environment.

### **What It Controls**
- Canvas size  
- Gravity  
- Debug mode  
- Physics settings  
- Difficulty  
- Asset paths  
- NPC defaults  

### **Why It Matters**
GameEnv acts as the blueprint for your game world. It ensures consistency, makes tuning easier, and allows you to adjust global behavior without rewriting code. It’s the foundation that everything else builds on.

---

## 🌐 **4. API Calls (Input + Output)**  
API calls allow your game to communicate with external systems — sending data out and receiving data back. This is where your game becomes connected, dynamic, and scalable.

### **Common Uses**
- **Leaderboards:** Fetching top scores  
- **NPC AI:** Requesting behavior profiles  
- **Cloud saves:** Storing player progress  
- **Remote configuration:** Updating difficulty or events  
- **Multiplayer:** Syncing player states  

### **Why It Matters**
API calls extend your game beyond the local machine. They enable online features, dynamic content, and smarter AI. They turn your game into a living system that can evolve over time.

---

🎯 **Why Input/Output Matters**

Input/Output is what makes your game *interactive*, *visual*, and *connected*. It allows your game to:

- Receive player actions  
- Render the world every frame  
- Load configuration and assets  
- Communicate with servers  
- Update dynamically based on external data  

Without I/O, your game would be a static script. With it, you get movement, visuals, AI, UI, and online features — everything that makes a game feel alive.

---

