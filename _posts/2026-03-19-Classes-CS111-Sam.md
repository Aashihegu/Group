---
layout: post
codemirror: true
title: Classes
description: Classes - CS111 Review
permalink: /Classes
---

<div id="classes-app" style="font-family: Arial; max-width: 650px;">
  <h2>Classes (Interactive Viewer)</h2>
  <p>Click a topic to explore examples and explanations.</p>

  <div id="classes-list"></div>
</div>

<script>
// ----------------------
// CLASSES DATA
// ----------------------
const classTopics = [
  {
    name: "Extending Base Classes",
    description: `
      <p>In your game engine, new objects are created by extending built‑in base classes such as:</p>
      <ul>
        <li><strong>Character</strong> – players, NPCs, enemies</li>
        <li><strong>Enemy</strong> – hostile AI with attack logic</li>
        <li><strong>Platform</strong> – ground, obstacles, moving platforms</li>
        <li><strong>Background</strong> – parallax layers, scenery</li>
      </ul>

      <p><strong>Example:</strong></p>
      <pre style="background:#f0f0f0; padding:8px;">
class Wolf extends Character {
    constructor(data, gameEnv) {
        super(data, gameEnv);
        this.type = "Wolf";
    }
}
      </pre>

      <p><strong>Use Case:</strong> Reusing engine logic while adding custom behavior.</p>
    `
  },
  {
    name: "Overriding Lifecycle Methods",
    description: `
      <p>Lifecycle methods define how an object behaves each frame. You can override them to customize behavior:</p>

      <p><strong>update()</strong> – movement, AI, physics</p>
      <p><strong>draw()</strong> – custom rendering</p>
      <p><strong>handleCollision()</strong> – reactions to collisions</p>

      <p><strong>Example:</strong></p>
      <pre style="background:#f0f0f0; padding:8px;">
update() {
    super.update();
    this.checkProximityToPlayer();
}

handleCollision(other) {
    if (other instanceof Player) {
        this.attack();
    }
}
      </pre>

      <p><strong>Use Case:</strong> Adding unique behavior while keeping engine defaults.</p>
    `
  },
  {
    name: "Constructor Chaining with super(data, gameEnv)",
    description: `
      <p>Every custom class must call <code>super(data, gameEnv)</code> so the engine can:</p>
      <ul>
        <li>Initialize position</li>
        <li>Load sprites</li>
        <li>Register physics</li>
        <li>Attach to the game world</li>
      </ul>

      <p><strong>Example:</strong></p>
      <pre style="background:#f0f0f0; padding:8px;">
constructor(data, gameEnv) {
    super(data, gameEnv); // required
    this.health = 50;
    this.speed = 2.5;
}
      </pre>

      <p><strong>Use Case:</strong> Ensuring your object is fully integrated with the engine.</p>
    `
  }
];

// ----------------------
// RENDER INTERACTIVE VIEWER
// ----------------------
const classContainer = document.getElementById("classes-list");

classTopics.forEach((topic, index) => {
  const wrapper = document.createElement("div");
  wrapper.style.marginBottom = "10px";

  const button = document.createElement("button");
  button.textContent = `${index + 1}. ${topic.name}`;
  button.style.width = "100%";
  button.style.padding = "10px";
  button.style.textAlign = "left";
  button.style.cursor = "pointer";
  button.style.border = "1px solid #e600ff";
  button.style.background = "#9d309d";
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
  classContainer.appendChild(wrapper);
});
</script>

---

⭐ **Overview: Classes in Game Development**

Classes are the blueprint system of object‑oriented programming. They define what an object *is*, what data it holds, and how it behaves. In game development, classes allow you to build structured, reusable, and modular systems — characters, enemies, platforms, backgrounds, UI elements, and more.

Your engine uses a class‑based architecture where every game object extends a base class and participates in a shared lifecycle. Understanding how classes work — especially inheritance, method overriding, and constructor chaining — is essential for building custom behaviors that integrate smoothly with the engine.

Below is a detailed breakdown of the three major class concepts you’re working with.

---

## 🧬 **1. Extending Base Classes**

In your engine, every object begins by extending a built‑in base class. These base classes provide core functionality such as:

- Position and movement  
- Physics and collision  
- Sprite loading and rendering  
- Lifecycle hooks (`update`, `draw`, etc.)  
- Registration inside the game world  

### **Common Base Classes**
- **Character** — players, NPCs, animals, humanoids  
- **Enemy** — hostile AI with attack logic  
- **Platform** — ground, obstacles, moving platforms  
- **Background** — parallax layers, scenery, skyboxes  

### **Why This Matters**
By extending a base class, you inherit all of its built‑in behavior. This means you don’t have to rewrite physics, rendering, or collision logic — you only add what makes your object unique.

### **Example**
```js
class Wolf extends Character {
  constructor(data, gameEnv) {
    super(data, gameEnv);
    this.type = "Wolf";
  }
}
```

This Wolf automatically gains movement, collisions, and rendering from `Character` without extra code.

---

## 🔄 **2. Overriding Lifecycle Methods**

Every game object participates in a shared lifecycle. The engine calls certain methods every frame or during specific events. You can override these methods to customize behavior.

### **Key Lifecycle Methods**
- **update()** — movement, AI, physics, timers  
- **draw()** — custom rendering, effects, UI overlays  
- **handleCollision()** — reactions to collisions with players, enemies, platforms, etc.  

### **Why This Matters**
Overriding lets you keep the engine’s default behavior while adding your own. You can:

- Add AI logic  
- Trigger animations  
- Modify physics  
- React to player proximity  
- Handle special collision cases  

### **Example**
```js
update() {
  super.update();          // keep engine behavior
  this.howlCooldown--;     // custom behavior
}

handleCollision(other) {
  if (other instanceof Player) {
    this.attack();
  }
}
```

This pattern keeps your code clean and predictable.

---

## 🧱 **3. Constructor Chaining with `super(data, gameEnv)`**

Every custom class must call `super(data, gameEnv)` inside its constructor. This is how the engine initializes the object.

### **What `super()` Does**
- Registers the object in the game world  
- Loads sprites and animations  
- Sets initial position and size  
- Applies physics settings  
- Connects the object to the engine’s update/draw loop  

Without calling `super()`, your object won’t function correctly — it won’t render, collide, or update.

### **Example**
```js
constructor(data, gameEnv) {
  super(data, gameEnv);  // required for engine integration
  this.health = 50;
  this.speed = 2.5;
}
```

### **Why This Matters**
Constructor chaining ensures your custom class is fully compatible with the engine’s systems. It’s the handshake between your code and the engine.

---

🎯 **Why Classes Matter in Your Game Engine**

Classes give your game:

- **Structure** — clear definitions for each object  
- **Reusability** — shared logic through inheritance  
- **Customization** — override only what you need  
- **Consistency** — every object follows the same lifecycle  
- **Scalability** — easy to add new enemies, NPCs, platforms, etc.  

This architecture lets you build complex behaviors without rewriting core systems. It’s the foundation of clean, maintainable game code.

---



