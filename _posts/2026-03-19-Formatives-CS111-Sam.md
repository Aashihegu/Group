---
layout: post
codemirror: true
title: Formatives
description: Formatives - CS111 Review
permalink: /Formatives
---

| MainHub | Lessons | Game Overview |
| ------- | ------ | ------ |
| [Let's Go!](https://aashihegu1-stack.github.io/Group/MainHub) | [Let's Go!](https://aashihegu1-stack.github.io/Group/Lessons) | [Let's Go!](https://aashihegu1-stack.github.io/Group/PGO) |

This is going to go over my formatives: FA1 and FA2:

---

# 🌌 **FA1 — SpaceKingdom Deployment** {#fa1}

FA1 launched the first playable environment using the OCS GameEngine: **SpaceKingdom**, a floating sky‑realm built from a background layer and a single controllable sprite.  
This milestone focused on **world setup**, **movement physics**, and **collision foundations**.

---

## 🛰️ **Configured Entities**

| Object | Class | Role |
|:-------|:------|:-----|
| **Background** | `Background` | Sky Kingdom backdrop |
| **Player** | `Astro` | User‑controlled explorer |
| **NPC** | `Astronaut1` | Stationary guide character |
| **Barrier** | `dbarrier_1` | Physical collision boundary |

---

## 🧪 **Engineering Highlights**

- **Low‑Gravity Motion:** `STEP_FACTOR = 1000` to simulate floaty, lunar‑style movement  
- **Spawn Coordinates:** Player begins at **(100, 300)**; NPC initially at **(500, 300)**  
- **Scaling:** Player scaled to **5×**, NPC to **4×** for visual clarity  
- **Collision Layering:** Barrier uses `fromOverlay: true` to sync physics with the visual dragon overlay  

---

## 🔁 **Core Loop Logic**

```javascript
// Iteration — every object updates + renders each frame
gameObjects.forEach(obj => {
    obj.update(); // physics + movement using STEP_FACTOR
    obj.draw();   // canvas rendering
});
```

---

#  **FA2 — Interaction Systems & NPC Intelligence** {#fa2}

FA2 expanded the world with **player–NPC interaction**, **state transitions**, and **proximity‑based behavior**.  
`Astronaut1` evolved from a static sprite into a reactive character with conditional logic.

---

## 🤖 **What I Implemented**

- **Hitbox Tuning:** Began at `0.0` as a placeholder, then shaped into a functional interaction radius  
- **Proximity Detection:** NPC triggers `reaction()` when the player enters range  
- **State Logic:** NPC switches between `idle` → `interactive` depending on distance + inventory  

---

## 🧠 **Collision‑Driven Behavior**

```javascript
// Nested conditions — 3 layers of logic
handleCollision(other, direction) {
    if (other.type === "Player") {            // 1: type check
        if (this.distanceTo(other) < 50) {    // 2: proximity check
            if (player.hasItem("basket")) {   // 3: inventory check
                this.reaction("friendly");
            } else {
                this.reaction("hostile");
            }
        }
    }
}
```

---

# 📊 **Rubric Alignment — FA1 + FA2**

| CS111 Topic | FA1 | FA2 |
|:------------|:-------------|:-------------|
| **Numbers** | `STEP_FACTOR: 1000`, `SCALE_FACTOR: 5` | `hitbox.range` numeric tuning |
| **Strings** | Cloud texture paths | NPC states `"friendly"` / `"hostile"` |
| **Booleans** | `fromOverlay: true` | `isColliding` flag |
| **Arrays** | Asset lists | `gameObjects` iteration |
| **JSON Objects** | Object literal configs | NPC configuration object |
| **Mathematical Ops** | `position += velocity` | Distance calculations |
| **Boolean Expressions** | `if (isColliding && direction)` | `distanceTo() < range` |
| **Iteration** | `forEach` loop | `map()` / `filter()` for state |
| **Conditions** | Truthy overlay checks | Player type detection |
| **Nested Conditions** | Physics mapping logic | Type + range + inventory |
| **Canvas I/O** | `draw()` at 60fps | Real‑time coordinate rendering |
| **Classes** | `Background`, `Barrier` | `Pirate` / `Astro1 extends Character` |

---
