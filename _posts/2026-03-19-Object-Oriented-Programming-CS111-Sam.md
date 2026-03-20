---
layout: post
codemirror: true
title: Object Oriented Programming
description: Object Oriented Programming- CS111 Review
permalink: /OOP
---

| MainHub | Lessons | Game Overview |
| ------- | ------ | ------ |
| [Let's Go!](https://aashihegu1-stack.github.io/Group/MainHub) | [Let's Go!](https://aashihegu1-stack.github.io/Group/Lessons) | [Let's Go!](https://aashihegu1-stack.github.io/Group/PGO) |

---


<div id="oop-app" style="font-family: Arial; max-width: 650px;">
  <h2>Object-Oriented Programming </h2>
  <p>Click a concept to learn more.</p>

  <div id="oop-list"></div>
</div>

<script>
// ----------------------
// OOP DATA
// ----------------------
const oopConcepts = [
  {
    name: "Encapsulation",
    description:
      "Encapsulation means bundling data and methods that operate on that data into a single unit (a class). It also restricts direct access to some components, improving security and reducing complexity."
  },
  {
    name: "Inheritance",
    description:
      "Inheritance allows one class to acquire the properties and methods of another class. It promotes code reuse and establishes relationships between classes."
  },
  {
    name: "Polymorphism",
    description:
      "Polymorphism allows methods to behave differently based on the object calling them. It enables one interface to be used for different underlying forms."
  },
  {
    name: "Abstraction",
    description:
      "Abstraction hides complex implementation details and exposes only the essential features. It simplifies how objects are used and understood."
  }
];

// ----------------------
// RENDER OOP VIEWER
// ----------------------
const oopContainer = document.getElementById("oop-list");

oopConcepts.forEach((concept, index) => {
  const item = document.createElement("div");
  item.style.marginBottom = "10px";

  const button = document.createElement("button");
  button.textContent = `${index + 1}. ${concept.name}`;
  button.style.width = "100%";
  button.style.padding = "10px";
  button.style.textAlign = "left";
  button.style.cursor = "pointer";
  button.style.border = "1px solid #fa9406";
  button.style.background = "#cc6516";
  button.style.fontSize = "16px";

  const details = document.createElement("div");
  details.textContent = concept.description;
  details.style.display = "none";
  details.style.padding = "10px";
  details.style.border = "1px solid #ddd";
  details.style.borderTop = "none";
  details.style.background = "#fff";

  button.addEventListener("click", () => {
    details.style.display = details.style.display === "none" ? "block" : "none";
  });

  item.appendChild(button);
  item.appendChild(details);
  oopContainer.appendChild(item);
});
</script>

### Inheritance Hierarchy
```text
GameObject        ← Level 1: shared position and draw logic
  └── Character   ← Level 2: adds movement and gravity
        ├── Player  ← Level 3: handles user keyboard input
        └── Pirate    ← Level 3: handles hostile logic
```
### Used In Code!

```javascript
class Pirate extends Character {
    constructor(data, gameEnv) {
        super(data, gameEnv);  // passes setup data to parent class
        this.type = "Pirate";
        this.isHostile = true; // boolean flag
    }

    handleCollision(other, direction) { // 2 parameters
        if (other instanceof Player) {       // condition
            if (this.distanceTo(other) < 50) { // nested condition
                this.reaction("hostile");
            }
        }
    }

    update() {
        super.update(); // calls parent update, then adds wolf behavior
        this.checkProximity();
    }
}
```

---

# 🏴‍☠️ ## Explanation of the Pirate Class

---

## 🔷 **1. Class Declaration**

```js
class Pirate extends Character {
```

- `Pirate` is a new class.
- It **extends** `Character`, meaning it inherits all the properties and methods from the `Character` class.
- This is **inheritance**, one of the core pillars of OOP.

---

## 🔷 **2. Constructor**

```js
constructor(data, gameEnv) {
    super(data, gameEnv);  // passes setup data to parent class
    this.type = "Pirate";
    this.isHostile = true; // boolean flag
}
```

### What happens here:

- The constructor runs when a new Pirate is created.
- `super(data, gameEnv)` calls the parent `Character` constructor so the Pirate gets:
  - position  
  - sprite  
  - movement logic  
  - collision setup  
  - any other shared character features  

### Then you add Pirate‑specific properties:

- `this.type = "Pirate"`  
  Helps identify the object in the game.

- `this.isHostile = true`  
  Marks this character as an enemy.

This is **encapsulation** — the Pirate stores its own data and behavior.

---

## 🔷 **3. Collision Handling**

```js
handleCollision(other, direction) {
    if (other instanceof Player) {       // condition
        if (this.distanceTo(other) < 50) { // nested condition
            this.reaction("hostile");
        }
    }
}
```

### What this does:

1. This method runs whenever the Pirate collides with something.
2. `other instanceof Player`  
   Checks if the Pirate collided with the player.
3. `this.distanceTo(other) < 50`  
   Makes sure the player is close enough to trigger aggression.
4. `this.reaction("hostile")`  
   Tells the Pirate to react aggressively — maybe an animation, sound, or attack.

This is **polymorphism** — the Pirate overrides the parent’s collision behavior with its own.

---

## 🔷 **4. Update Loop**

```js
update() {
    super.update(); // calls parent update, then adds pirate behavior
    this.checkProximity();
}
```

### What this does:

- `super.update()`  
  Runs the normal character update logic (movement, animation, physics).
- `this.checkProximity()`  
  Adds Pirate‑specific behavior each frame — likely checking if the player is near.

This is a common OOP pattern:  
**extend the parent behavior without replacing it.**

---

# 🧠 **In Summary**

| Feature | What It Demonstrates |
|--------|------------------------|
| `extends Character` | Inheritance |
| `super()` | Using parent class setup |
| `handleCollision()` override | Polymorphism |
| Pirate‑specific properties | Encapsulation |
| `update()` override | Custom behavior layered on top of parent logic |


---
