---
layout: post
codemirror: true
title: Coding-Practices
description: Coding-Practices - CS111 Review
permalink: /Coding-Practices
---

<div id="coding-app" style="font-family: Arial; max-width: 650px;">
  <h2>Coding Practices (Interactive Viewer)</h2>
  <p>Click a topic to explore examples and explanations.</p>

  <div id="coding-list"></div>
</div>

<script>
// ----------------------
// CODING PRACTICES DATA
// ----------------------
const codingPractices = [
  {
    name: "Single Responsibility Principle",
    description: `
      <p>The Single Responsibility Principle (SRP) states that each class or method should have <strong>one clear purpose</strong>.</p>

      <p><strong>Examples in your engine:</strong></p>
      <ul>
        <li><code>update()</code> – movement, physics, AI</li>
        <li><code>draw()</code> – rendering only</li>
        <li><code>handleCollision()</code> – collision responses</li>
        <li>Callbacks – event-specific logic</li>
      </ul>

      <p><strong>Why it matters:</strong> SRP keeps your code clean, testable, and easy to maintain.</p>
    `
  },
  {
    name: "Data-Driven Design",
    description: `
      <p>Data-driven design means using <strong>Object Literals</strong> and configuration data to build game objects instead of hardcoding behavior.</p>

      <p><strong>Example (GameBuilder):</strong></p>
      <pre style="background:#f0f0f0; padding:8px;">
GameBuilder.create({
    type: "Enemy",
    sprite: "wolf.png",
    speed: 2.5,
    health: 40
});
      </pre>

      <p><strong>Why it matters:</strong> You can change behavior without rewriting code — perfect for balancing, prototyping, and level design.</p>
    `
  },
  {
    name: "Object-Oriented Programming",
    description: `
      <p>OOP organizes your game into <strong>classes</strong> with shared behavior and inheritance hierarchies.</p>

      <p><strong>Core elements in your engine:</strong></p>
      <ul>
        <li><strong>GameObject</strong> – the base class for all objects</li>
        <li><strong>Character → Enemy → Boss</strong> – inheritance chain</li>
        <li>Shared lifecycle methods: <code>update()</code>, <code>draw()</code>, <code>handleCollision()</code></li>
      </ul>

      <p><strong>Why it matters:</strong> OOP reduces duplication and makes complex behavior easier to manage.</p>
    `
  },
  {
    name: "State Management",
    description: `
      <p>State management controls the <strong>flow of the game</strong> and determines what logic runs at any moment.</p>

      <p><strong>Common states:</strong></p>
      <ul>
        <li>INTRO</li>
        <li>MENU</li>
        <li>PLAYER_TURN</li>
        <li>BOSS_TURN</li>
        <li>PAUSED</li>
        <li>WIN / LOSE</li>
      </ul>

      <p><strong>Example:</strong></p>
      <pre style="background:#f0f0f0; padding:8px;">
if (gameState === "PAUSED") {
    return; // stop updating
}
      </pre>

      <p><strong>Why it matters:</strong> State management keeps your game predictable and prevents logic from running at the wrong time.</p>
    `
  }
];

// ----------------------
// RENDER INTERACTIVE VIEWER
// ----------------------
const codingContainer = document.getElementById("coding-list");

codingPractices.forEach((topic, index) => {
  const wrapper = document.createElement("div");
  wrapper.style.marginBottom = "10px";

  const button = document.createElement("button");
  button.textContent = `${index + 1}. ${topic.name}`;
  button.style.width = "100%";
  button.style.padding = "10px";
  button.style.textAlign = "left";
  button.style.cursor = "pointer";
  button.style.border = "1px solid #ff0000";
  button.style.background = "#eb6767";
  button.style.fontSize = "16px";

  const details = document.createElement("div");
  details.style.display = "none";
  details.style.padding = "10px";
  details.style.border = "1px solid #ddd";
  details.style.borderTop = "none";
  details.style.background = "#fff";
  details.style.lineHeight = "1.6";
  details.innerHTML = topic.description;

  button.addEventListener("click", () => {
    details.style.display = details.style.display === "none" ? "block" : "none";
  });

  wrapper.appendChild(button);
  wrapper.appendChild(details);
  codingContainer.appendChild(wrapper);
});
</script>

---

⭐ **Overview: Coding Practices in Game Development**

Coding practices are the habits and architectural choices that keep a game project maintainable, scalable, and easy to reason about. They’re not tied to a specific language or engine — they’re universal principles that help developers avoid chaos as a project grows.

In your engine, four practices stand out as especially important:

- **Single Responsibility Principle**  
- **Data‑Driven Design**  
- **Object‑Oriented Programming**  
- **State Management**

Together, these practices create a codebase that is predictable, modular, and easy to extend — exactly what you want when building a game with many moving parts.

---

## 🧩 **1. Single Responsibility Principle (SRP)**  
The Single Responsibility Principle states that **every class and method should have one clear job**. When each piece of code focuses on a single purpose, the entire system becomes easier to understand and maintain.

### **How SRP Appears in Your Engine**
Each lifecycle method handles one domain:

- **`update()`** → movement, physics, AI  
- **`draw()`** → rendering only  
- **`handleCollision()`** → collision responses  
- **Callbacks** → event‑specific logic (e.g., onDeath, onPickup)

### **Why SRP Matters**
- Reduces bugs caused by tangled logic  
- Makes code easier to test and debug  
- Encourages clean, readable classes  
- Allows you to modify one behavior without breaking others  

SRP is the foundation of clean game architecture.

---

## 🧱 **2. Data‑Driven Design**  
Data‑driven design means using **configuration objects** (Object Literals) to define behavior instead of hardcoding values. Your engine’s `GameBuilder` is a perfect example of this.

### **Example**
```js
GameBuilder.create({
    type: "Enemy",
    sprite: "wolf.png",
    speed: 2.5,
    health: 40
});
```

### **Why Data‑Driven Design Matters**
- Designers can tweak values without touching code  
- You can create many variations of objects quickly  
- Balancing and prototyping become dramatically easier  
- Behavior becomes flexible and reusable  

This approach turns your game into a system that can be shaped by data rather than rewritten code.

---

## 🧬 **3. Object‑Oriented Programming (OOP)**  
OOP organizes your game into **classes** that share behavior through inheritance. It’s the backbone of your engine’s architecture.

### **Core OOP Concepts in Your Engine**
- **Base class:** `GameObject`  
- **Inheritance chains:**  
  - `Character → Enemy → Boss`  
  - `Platform → MovingPlatform`  
  - `Background → ParallaxLayer`  
- **Shared lifecycle:**  
  - `update()`  
  - `draw()`  
  - `handleCollision()`

### **Why OOP Matters**
- Reduces duplicated code  
- Makes complex behavior easier to manage  
- Allows you to override only what you need  
- Creates predictable, reusable patterns  

OOP gives your game structure and consistency.

---

## 🔄 **4. State Management**  
State management controls **what the game is doing at any given moment**. It prevents logic from running when it shouldn’t and keeps the game loop predictable.

### **Common Game States**
- `INTRO`  
- `MENU`  
- `PLAYER_TURN`  
- `BOSS_TURN`  
- `PAUSED`  
- `WIN` / `LOSE`

### **Example**
```js
if (gameState === "PAUSED") {
    return; // stop updating
}
```

### **Why State Management Matters**
- Prevents unintended behavior (e.g., enemies moving while paused)  
- Keeps the game loop clean and predictable  
- Makes transitions (levels, menus, cutscenes) easy to manage  
- Allows complex systems to coexist without interfering  

State management is the traffic controller of your game.

---

🎯 **Why These Coding Practices Matter Together**

When combined, these four practices create a powerful development environment:

- **SRP** keeps each piece of code focused  
- **Data‑Driven Design** makes your game flexible  
- **OOP** provides structure and reuse  
- **State Management** keeps the game loop under control  

This is the foundation of professional‑quality game architecture — modular, scalable, and easy to extend as your game grows.

---




