---
layout: post
codemirror: true
title: Operators
description: Operators - CS111 Review
permalink: /Operators
---


<div id="operators-app" style="font-family: Arial; max-width: 650px;">
  <h2>Operators (Interactive Viewer)</h2>
  <p>Click a category to explore examples and explanations.</p>

  <div id="operators-list"></div>
</div>

<script>
// ----------------------
// OPERATORS DATA
// ----------------------
const operatorCategories = [
  {
    name: "String Operations",
    description: `
      <p><strong>Concatenation:</strong> <code>"Hello" + " World"</code> → "Hello World"</p>
      <p><strong>Template Literals:</strong> <code>\`Player: \${name}\`</code></p>
      <p><strong>Length:</strong> <code>"hostile".length</code> → 7</p>
      <p><strong>Accessing Characters:</strong> <code>"wolf"[0]</code> → "w"</p>
      <p><strong>Use Case:</strong> Building UI text, NPC states, file paths, and debug logs.</p>
    `
  },
  {
    name: "Mathematical Operations",
    description: `
      <p><strong>Addition:</strong> <code>speed + 1</code></p>
      <p><strong>Subtraction:</strong> <code>health - 10</code></p>
      <p><strong>Multiplication:</strong> <code>velocity * 2</code></p>
      <p><strong>Division:</strong> <code>distance / time</code></p>
      <p><strong>Modulo:</strong> <code>frame % 60</code> → useful for timing</p>
      <p><strong>Use Case:</strong> Movement, physics, timers, damage, cooldowns.</p>
    `
  },
  {
    name: "Boolean Expressions",
    description: `
      <p><strong>Comparison:</strong> <code>health > 0</code></p>
      <p><strong>Equality:</strong> <code>state === "hostile"</code></p>
      <p><strong>Logical AND:</strong> <code>isAlive && isVisible</code></p>
      <p><strong>Logical OR:</strong> <code>isPaused || isMenuOpen</code></p>
      <p><strong>Negation:</strong> <code>!isAttacking</code></p>
      <p><strong>Use Case:</strong> AI decisions, collisions, game loop control, input handling.</p>
    `
  }
];

// ----------------------
// RENDER INTERACTIVE VIEWER
// ----------------------
const opContainer = document.getElementById("operators-list");

operatorCategories.forEach((category, index) => {
  const wrapper = document.createElement("div");
  wrapper.style.marginBottom = "10px";

  const button = document.createElement("button");
  button.textContent = `${index + 1}. ${category.name}`;
  button.style.width = "100%";
  button.style.padding = "10px";
  button.style.textAlign = "left";
  button.style.cursor = "pointer";
  button.style.border = "1px solid #ffea04";
  button.style.background = "#cfa530";
  button.style.fontSize = "16px";

  const details = document.createElement("div");
  details.style.display = "none";
  details.style.padding = "10px";
  details.style.border = "1px solid #ddd";
  details.style.borderTop = "none";
  details.style.background = "#fff";
  details.style.lineHeight = "1.6";
  details.innerHTML = category.description;

  button.addEventListener("click", () => {
    details.style.display = details.style.display === "none" ? "block" : "none";
  });

  wrapper.appendChild(button);
  wrapper.appendChild(details);
  opContainer.appendChild(wrapper);
});
</script>

---

⭐ **Overview: Operators in Programming**

Operators are the tools that allow code to *do things* — combine values, compare them, transform them, or make decisions based on them. They’re the small symbols and expressions that power movement, logic, AI behavior, UI updates, and nearly every calculation inside a game.

Even though operators look simple, they’re essential for building dynamic, interactive systems. Understanding them helps you write cleaner logic, avoid bugs, and express ideas more clearly in code.

Below are the three major categories of operators you’re using: **string operations**, **mathematical operations**, and **boolean expressions**.

---

## 📝 **1. String Operations**
Strings represent text, but in game development they’re often used for *labels*, *states*, and *paths*. Operators let you combine and manipulate these strings to build dynamic messages or control game logic.

### **Common String Operations**
- **Concatenation:**  
  `"Player " + name` → `"Player Samag"`
- **Template literals:**  
  `` `Health: ${hp}` ``
- **Length:**  
  `"hostile".length` → `7`
- **Character access:**  
  `"wolf"[0]` → `"w"`

### **Where They Matter in Games**
- NPC states (`"idle"`, `"hostile"`, `"patrol"`)
- File paths for sprites and audio
- UI text and debug logs
- Dialogue systems

Strings help your game *describe* what’s happening.

---

## 🔢 **2. Mathematical Operations**
Math operators control movement, physics, timing, and any system that changes over time. They’re the backbone of gameplay mechanics.

### **Common Math Operators**
- **Addition:** `speed + 1`
- **Subtraction:** `health - 10`
- **Multiplication:** `velocity * 2`
- **Division:** `distance / time`
- **Modulo:** `frame % 60` (useful for timing events)

### **Where They Matter in Games**
- Movement and acceleration  
- Gravity and physics  
- Damage calculations  
- Animation timing  
- Cooldowns and timers  

If something moves, rotates, jumps, or ticks — math operators are behind it.

---

## ✔️ **3. Boolean Expressions**
Boolean expressions evaluate to **true** or **false**, making them essential for decision‑making. They determine whether an action should happen, whether a character should attack, or whether the game should pause.

### **Common Boolean Expressions**
- **Comparison:** `health > 0`
- **Equality:** `state === "hostile"`
- **Logical AND:** `isAlive && isVisible`
- **Logical OR:** `isPaused || isMenuOpen`
- **Negation:** `!isAttacking`

### **Where They Matter in Games**
- AI behavior  
- Collision detection  
- Game loop control  
- Input handling  
- Trigger zones and events  

Booleans are the switches that turn game logic on and off.

---

🎯 **Why Operators Matter**

Operators are the glue that connects your data and your logic. They allow your game to:

- React to player input  
- Update physics and movement  
- Make decisions through AI  
- Display dynamic text  
- Control timing and animation  
- Evaluate conditions and states  

Even though operators are small symbols, they shape how your entire game behaves. Mastering them gives you precise control over gameplay, performance, and the flow of your code.

---
