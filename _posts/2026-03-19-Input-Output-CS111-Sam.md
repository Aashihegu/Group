---
layout: post
codemirror: true
title: Control Structures
description: Control Structures - CS111 Review
permalink: /Control-Structures
---

<div id="control-app" style="font-family: Arial; max-width: 650px;">
  <h2>Control Structures (Interactive Viewer)</h2>
  <p>Click a category to explore examples and explanations.</p>

  <div id="control-list"></div>
</div>

<script>
// ----------------------
// CONTROL STRUCTURES DATA
// ----------------------
const controlStructures = [
  {
    name: "Iteration (Loops)",
    description: `
      <p><strong>For Loop:</strong> <code>for (let i = 0; i < 5; i++)</code></p>
      <p><strong>While Loop:</strong> <code>while (enemy.health > 0)</code></p>
      <p><strong>For...of:</strong> <code>for (const obj of gameObjects)</code></p>
      <p><strong>Use Case:</strong> Updating sprites, checking collisions, running AI logic every frame.</p>
    `
  },
  {
    name: "Conditions (If / Else)",
    description: `
      <p><strong>Basic Condition:</strong> <code>if (health <= 0)</code></p>
      <p><strong>If / Else:</strong> <code>if (isPaused) { ... } else { ... }</code></p>
      <p><strong>Else If:</strong> <code>else if (state === "hostile")</code></p>
      <p><strong>Use Case:</strong> Game state changes, AI decisions, input handling.</p>
    `
  },
  {
    name: "Nested Conditions",
    description: `
      <p><strong>Nested If:</strong></p>
      <pre style="background:#f0f0f0; padding:8px;">
if (enemy.isHostile) {
    if (distance < 50) {
        enemy.attack();
    }
}
      </pre>
      <p><strong>Use Case:</strong> Complex decision-making like AI behavior, proximity checks, and layered logic.</p>
    `
  }
];

// ----------------------
// RENDER INTERACTIVE VIEWER
// ----------------------
const controlContainer = document.getElementById("control-list");

controlStructures.forEach((item, index) => {
  const wrapper = document.createElement("div");
  wrapper.style.marginBottom = "10px";

  const button = document.createElement("button");
  button.textContent = `${index + 1}. ${item.name}`;
  button.style.width = "100%";
  button.style.padding = "10px";
  button.style.textAlign = "left";
  button.style.cursor = "pointer";
  button.style.border = "1px solid #00ddff";
  button.style.background = "#4692a7";
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
  controlContainer.appendChild(wrapper);
});
</script>

---

⭐ **Overview: Control Structures in Programming**

Control structures are the decision‑making and flow‑controlling tools of programming. They determine **how**, **when**, and **how many times** code runs. Without them, a program would simply execute line‑by‑line with no ability to react, repeat, or branch — which would make games, AI, physics, and interactive systems impossible.

In game development especially, control structures shape everything from enemy behavior to movement loops to UI logic. They allow your code to respond dynamically to the player and the game world.

Below are the three core control structures you’re working with: **iteration**, **conditions**, and **nested conditions**.

---

## 🔁 **1. Iteration (Loops)**  
Iteration allows code to repeat actions multiple times. Instead of writing the same line of code over and over, loops let you automate repetition — essential in a game that updates dozens of objects every frame.

### **Common Loop Types**
- **For loop:** Runs a set number of times  
  `for (let i = 0; i < 5; i++)`
- **While loop:** Runs as long as a condition is true  
  `while (enemy.health > 0)`
- **For...of loop:** Iterates through arrays  
  `for (const obj of gameObjects)`

### **Where It Matters in Games**
- Updating all sprites each frame  
- Checking collisions across many objects  
- Running AI logic  
- Animating sequences  
- Processing inventory or level data  

Iteration is the engine that keeps your game world moving.

---

## 🔍 **2. Conditions (If / Else)**  
Conditions allow your code to make decisions. They check whether something is true or false and choose what to do next. This is the foundation of game logic — everything from health checks to AI reactions relies on conditions.

### **Common Condition Patterns**
- **Basic check:**  
  `if (health <= 0)`
- **If / else:**  
  `if (isPaused) { ... } else { ... }`
- **Else if:**  
  `else if (state === "hostile")`

### **Where It Matters in Games**
- Game state transitions (menu, pause, combat)  
- AI behavior (attack, flee, patrol)  
- Input handling  
- Trigger zones and events  
- Health, damage, and win/lose conditions  

Conditions give your game the ability to *react*.

---

## 🧠 **3. Nested Conditions**  
Nested conditions are conditions *inside* other conditions. They allow for more complex decision‑making — the kind of layered logic that real gameplay requires.

### **Example**
```js
if (enemy.isHostile) {
    if (distance < 50) {
        enemy.attack();
    }
}
```

### **Where It Matters in Games**
- AI decision trees  
- Proximity checks  
- Multi‑step logic (e.g., “if the player is close AND the enemy is hostile…”)  
- Handling multiple states at once  
- Complex interactions between objects  

Nested conditions let your game make smarter, more nuanced decisions.

---

🎯 **Why Control Structures Matter**

Control structures are the backbone of dynamic, interactive programming. They allow your game to:

- Repeat actions efficiently  
- Respond to player input  
- Make decisions based on game state  
- Handle complex AI behavior  
- Update dozens of objects every frame  
- Create branching logic and varied outcomes  

Without control structures, your game would be static and predictable. With them, you can build systems that feel alive, responsive, and intelligent.

---
