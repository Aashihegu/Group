---
layout: post
codemirror: true
title: Pirate Game Overview
description: Pirate Game Overview - CS111 Review
permalink: /PGO
---

| MainHub | Lessons | Game Overview |
| ------- | ------ | ------ |
| [Let's Go!](https://aashihegu1-stack.github.io/Group/MainHub) | [Let's Go!](https://aashihegu1-stack.github.io/Group/Lessons) | [Let's Go!](https://aashihegu1-stack.github.io/Group/PGO) |

---

This is my main overview for the PirateMegaGame. It has examples of what I used for certain topics that align with CS 111 Requirements:

You can reference the code here:

| Level 1 | Level 2 | Level 3 | Issues/Documentation |
| ------- | ------ | ------ | ------ |
| [View!](https://github.com/aashihegu1-stack/Group/blob/main/assets/js/GameEnginev1/GameLevelPirateHunt.js) | [View!](https://github.com/aashihegu1-stack/Group/blob/main/assets/js/GameEnginev1/GameLevelPirateMegaGame2.js) | [View!](https://github.com/aashihegu1-stack/Group/blob/main/assets/js/GameEnginev1/GameLevelPirateBoss.js) | [View!](https://github.com/aashihegu1-stack/Group/issues/4) | 


And you can play the game here:

<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
    <a href="https://aashihegu1-stack.github.io/Group/gamify/PirateMegaGame" style="text-decoration: none;">
        <div style="background-color: #ff002f; color: black; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
            Play
        </div>
    </a>
</div>

<div style="font-family: Arial; max-width: 700px; margin: 0 auto;">
  <h2 style="margin-bottom: 10px;">☠️🦜 Game Object Class Overview</h2>
  <p style="margin-top: 0;">A clean breakdown of how each object fits into the engine's class hierarchy.</p>

  <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 16px;">
    <thead>
      <tr style="background: #f3f3f3;">
        <th style="padding: 10px; border: 1px solid #ff0051;">Game Object</th>
        <th style="padding: 10px; border: 1px solid #ff0051;">Class</th>
        <th style="padding: 10px; border: 1px solid #ff0051;">Role</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 10px; border: 1px solid #ff0051;"><strong>McArchie</strong></td>
        <td style="padding: 10px; border: 1px solid #ff0051;"><code>Player extends Character</code></td>
        <td style="padding: 10px; border: 1px solid #ff0051;">Player-controlled character</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ff0051;"><strong>Pirate</strong></td>
        <td style="padding: 10px; border: 1px solid #ff0051;"><code>Pirate extends Character</code></td>
        <td style="padding: 10px; border: 1px solid #ff0051;">"Enemy" NPC with reaction logic</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ff0051;"><strong>Map</strong></td>
        <td style="padding: 10px; border: 1px solid #ff0051;"><code>Background extends GameObject</code></td>
        <td style="padding: 10px; border: 1px solid #ff0051;">Layered scrolling environment</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ff0051;"><strong>Shields</strong></td>
        <td style="padding: 10px; border: 1px solid #ff0051;"><code>Barrier extends GameObject</code></td>
        <td style="padding: 10px; border: 1px solid #ff0051;">Collision boundaries</td>
      </tr>
    </tbody>
  </table>
</div>


<div id="cs111-app" style="font-family: Arial; max-width: 900px; color: #e6e6e6; margin: 0 auto;">

  <h2 style="margin-bottom: 10px; color: #fff;">🎓 CS111 Requirements — Interactive Map</h2>
  <p style="margin-top: 0; color: #bbb;">Click any section to expand and learn more.</p>

  <style>
    .section {
      background: #111;
      border: 1px solid #333;
      margin-bottom: 10px;
      border-radius: 6px;
      overflow: hidden;
      transition: 0.3s ease;
    }
    .section-header {
      padding: 12px 15px;
      cursor: pointer;
      font-size: 17px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #ff0051;
      background: #000;
    }
    .section-header:hover {
      background: #0a0a0a;
    }
    .section-content {
      display: none;
      padding: 15px;
      background: #181818;
      color: #ddd;
      line-height: 1.6;
      border-top: 1px solid #333;
    }
    .tag {
      display: inline-block;
      background: #222;
      padding: 4px 8px;
      border-radius: 4px;
      margin: 3px 0;
      border: 1px solid #444;
      font-size: 14px;
      color: #f38fce;
    }
  </style>

  <script>
    function toggleSection(id) {
      const el = document.getElementById(id);
      el.style.display = el.style.display === "block" ? "none" : "block";
    }
  </script>

  <!-- OOP / CLASSES -->
  <div class="section">
    <div class="section-header" onclick="toggleSection('oop')">
      🧬 Object-Oriented Programming
      <span>▼</span>
    </div>
    <div class="section-content" id="oop">
      <p><span class="tag">Inheritance</span> `GameObject → Character → Player/Pirate`</p>
      <p><span class="tag">Writing Classes</span> Custom subclasses like `Player` and `Pirate`</p>
      <p><span class="tag">Method Overriding</span> Custom `update()`, `draw()`, `handleCollision()`</p>
      <p><span class="tag">Constructor Chaining</span> `super(data, gameEnv)` ensures engine initialization</p>
    </div>
  </div>

  <!-- CONTROL STRUCTURES -->
  <div class="section">
    <div class="section-header" onclick="toggleSection('control')">
      🔁 Control Structures
      <span>▼</span>
    </div>
    <div class="section-content" id="control">
      <p><span class="tag">Iteration</span> `forEach` loops in update + cleanup</p>
      <p><span class="tag">Conditionals</span> Collision checks, AI decisions, state transitions</p>
      <p><span class="tag">Nested Conditions</span> NPC type → proximity → inventory (3 layers)</p>
    </div>
  </div>

  <!-- DATA TYPES -->
  <div class="section">
    <div class="section-header" onclick="toggleSection('datatypes')">
      🔢 Data Types
      <span>▼</span>
    </div>
    <div class="section-content" id="datatypes">
      <p><span class="tag">Numbers</span> `x`, `y`, `velocity`, `score`</p>
      <p><span class="tag">Strings</span> Names, sprite paths, game states</p>
      <p><span class="tag">Booleans</span> `isPaused`, `isJumping`, `isVulnerable`</p>
      <p><span class="tag">Arrays</span> `gameObjects[]`, level arrays</p>
      <p><span class="tag">JSON Objects</span> NPC config + GameLevel setup</p>
    </div>
  </div>

  <!-- OPERATORS -->
  <div class="section">
    <div class="section-header" onclick="toggleSection('operators')">
      ➗ Operators
      <span>▼</span>
    </div>
    <div class="section-content" id="operators">
      <p><span class="tag">Math Ops</span> `+=`, `*`, `Math.pow()`</p>
      <p><span class="tag">String Ops</span> Template literals for sprite paths</p>
      <p><span class="tag">Boolean Expressions</span> `&&`, `||`, `!`</p>
    </div>
  </div>

  <!-- INPUT / OUTPUT -->
  <div class="section">
    <div class="section-header" onclick="toggleSection('io')">
      🎨 Input / Output
      <span>▼</span>
    </div>
    <div class="section-content" id="io">
      <p><span class="tag">Canvas Rendering</span> `draw()` via `requestAnimationFrame`</p>
      <p><span class="tag">Keyboard Events</span> `keydown` / `keyup` for movement</p>
      <p><span class="tag">GameEnv Config</span> Object literal world configuration</p>
    </div>
  </div>

  <!-- SOFTWARE PRACTICES -->
  <div class="section">
    <div class="section-header" onclick="toggleSection('practices')">
      🧪 Software Engineering Practices
      <span>▼</span>
    </div>
    <div class="section-content" id="practices">
      <p><span class="tag">Single Responsibility</span> Each method handles one behavior</p>
      <p><span class="tag">Data-Driven Design</span> GameBuilder uses Object Literals</p>
      <p><span class="tag">Instantiation</span> Level config spawns all objects</p>
      <p><span class="tag">Documentation</span> Inline comments everywhere</p>
      <p><span class="tag">Testing</span> Objects validated before merge</p>
      <p><span class="tag">SDLC Practices</span> Kanban, feature branches, selective PRs</p>
    </div>
  </div>

</div>