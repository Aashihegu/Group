---
layout: post
codemirror: true
title: Data Types
description: Data Types - CS111 Review
permalink: /DT
---

| MainHub | Lessons | Game Overview |
| ------- | ------ | ------ |
| [Let's Go!](https://aashihegu1-stack.github.io/Group/MainHub) | [Let's Go!](https://aashihegu1-stack.github.io/Group/Lessons) | [Let's Go!](https://aashihegu1-stack.github.io/Group/PGO) |

---


<div id="datatype-app" style="font-family: Arial; max-width: 650px;">
  <h2>Data Types (Interactive Viewer)</h2>
  <p>Click a data type to learn more.</p>

  <div id="datatype-list"></div>
</div>

<script>
// ----------------------
// DATA TYPES TABLE (converted into objects)
// ----------------------
const dataTypes = [
  {
    type: "Number",
    example: "velocity: 3",
    usage: "Physics and movement"
  },
  {
    type: "String",
    example: `"hostile"`,
    usage: "NPC state and sprite paths"
  },
  {
    type: "Boolean",
    example: "isPaused: true",
    usage: "Game loop control flags"
  },
  {
    type: "Array",
    example: "gameObjects[]",
    usage: "Collection of sprites used"
  },
  {
    type: "JSON Object",
    example: `{ hitbox: { width: 40 } }`,
    usage: "NPC configuration"
  }
];

// ----------------------
// RENDER INTERACTIVE VIEWER
// ----------------------
const dtContainer = document.getElementById("datatype-list");

dataTypes.forEach((item, index) => {
  const wrapper = document.createElement("div");
  wrapper.style.marginBottom = "10px";

  const button = document.createElement("button");
  button.textContent = `${index + 1}. ${item.type}`;
  button.style.width = "100%";
  button.style.padding = "10px";
  button.style.textAlign = "left";
  button.style.cursor = "pointer";
  button.style.border = "1px solid #f700ff";
  button.style.background = "#c020a0";
  button.style.fontSize = "16px";

  const details = document.createElement("div");
  details.style.display = "none";
  details.style.padding = "10px";
  details.style.border = "1px solid #ddd";
  details.style.borderTop = "none";
  details.style.background = "#fff";
  details.style.lineHeight = "1.6";

  details.innerHTML = `
    <p><strong>Example:</strong> <code>${item.example}</code></p>
    <p><strong>Where Used:</strong> ${item.usage}</p>
  `;

  button.addEventListener("click", () => {
    details.style.display = details.style.display === "none" ? "block" : "none";
  });

  wrapper.appendChild(button);
  wrapper.appendChild(details);
  dtContainer.appendChild(wrapper);
});
</script>

---

⭐ **Overview: Data Types in Game Development**

Data types are the fundamental building blocks of all programming. They define *what kind of information* your code is working with and determine how that information behaves. In game development, choosing the right data type isn’t just a technical detail — it affects performance, clarity, and how easily systems interact with each other.

Below is a deeper look at the core data types you’re using, along with how they appear in real game systems.

---

## 🔢 **1. Number**
Numbers represent any kind of numeric value: speed, health, position, timers, damage, and more.

### **Example**
`velocity: 3`

### **Where It’s Used**
- Physics calculations  
- Movement speed  
- Animation timing  
- Hit detection  
- Cooldowns and timers  

Numbers are the backbone of anything that changes over time. If something moves, rotates, jumps, or counts down, a number is behind it.

---

## 📝 **2. String**
Strings store text — but in games, they’re often used for *labels*, *states*, and *paths* rather than long sentences.

### **Example**
`"hostile"`

### **Where It’s Used**
- NPC states (`"idle"`, `"patrol"`, `"hostile"`)  
- File paths for sprites or audio  
- Dialogue or UI text  
- Identifiers for items, quests, or events  

Strings help your game understand *what something is* or *what mode it’s in*.

---

## ✔️ **3. Boolean**
Booleans represent true/false values — simple but incredibly powerful for controlling game logic.

### **Example**
`isPaused: true`

### **Where It’s Used**
- Game loop control  
- Collision toggles  
- AI behavior flags  
- Visibility or invincibility states  
- Input handling  

Booleans act like switches that turn features or behaviors on and off.

---

## 📦 **4. Array**
Arrays store lists of related items. In games, they’re essential for managing groups of objects.

### **Example**
`gameObjects[]`

### **Where It’s Used**
- All active sprites in the scene  
- Lists of enemies, bullets, particles, or items  
- Pathfinding nodes  
- Inventory systems  
- Level data  

Arrays let you loop through many objects and update them efficiently each frame.

---

## 🧩 **5. JSON Object**
JSON objects store structured data — perfect for configuration, settings, and anything with multiple properties.

### **Example**
`{ hitbox: { width: 40 } }`

### **Where It’s Used**
- NPC configuration (speed, health, hitbox, AI settings)  
- Level definitions  
- Save files  
- Dialogue trees  
- Game settings  

JSON objects let you group related information together in a clean, readable format.

---

🎯 **Why Data Types Matter**

Understanding data types helps you:

- Write cleaner, more predictable code  
- Avoid bugs caused by mismatched values  
- Structure game systems more effectively  
- Communicate intent to other developers  
- Build scalable features that won’t break later  

In game development, data types aren’t just technical details — they shape how your entire game behaves. Mastering them gives you control over movement, AI, physics, UI, and every system that makes your game come alive.

---

