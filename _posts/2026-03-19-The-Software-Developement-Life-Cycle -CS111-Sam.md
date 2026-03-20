---
layout: post
codemirror: true
title: Software Developement Life Cycle 
description: The Software Developement Life Cycle - CS111 Review
permalink: /SDLC
---


<div id="sdlc-app" style="font-family: Arial; max-width: 600px;">
  <h2>Software Development Life Cycle Short Form</h2>
  <p>Click a phase to learn more.</p>

  <div id="sdlc-list"></div>
</div>

<script>
// SDLC data
const sdlcPhases = [
  {
    name: "Planning",
    description: "Understand the problem, define goals, estimate time and cost, and assess risks."
  },
  {
    name: "Requirements Analysis",
    description: "Gather functional and non-functional requirements, meet stakeholders, and define use cases."
  },
  {
    name: "Design",
    description: "Create system architecture, database design, UI/UX mockups, and choose technologies."
  },
  {
    name: "Implementation (Coding)",
    description: "Develop features, follow coding standards, integrate modules, and perform unit testing."
  },
  {
    name: "Testing",
    description: "Perform functional, integration, performance, and security testing. Fix bugs."
  },
  {
    name: "Deployment",
    description: "Release the software, configure servers, monitor performance, and support users."
  },
  {
    name: "Maintenance",
    description: "Fix bugs, add features, update dependencies, and improve performance over time."
  }
];

// Render the list
const container = document.getElementById("sdlc-list");

sdlcPhases.forEach((phase, index) => {
  const item = document.createElement("div");
  item.style.marginBottom = "10px";

  const button = document.createElement("button");
  button.textContent = `${index + 1}. ${phase.name}`;
  button.style.width = "100%";
  button.style.padding = "10px";
  button.style.textAlign = "left";
  button.style.cursor = "pointer";
  button.style.border = "1px solid #ed2828";
  button.style.background = "#720e0e";
  button.style.fontSize = "16px";

  const details = document.createElement("div");
  details.textContent = phase.description;
  details.style.display = "none";
  details.style.padding = "10px";
  details.style.border = "1px solid #12fc6c";
  details.style.borderTop = "none";
  details.style.background = "#1a7d2c";

  button.addEventListener("click", () => {
    details.style.display = details.style.display === "none" ? "block" : "none";
  });

  item.appendChild(button);
  item.appendChild(details);
  container.appendChild(item);
});
</script>




---

## 🧭 The Software Development Life Cycle (Long Form)

The **Software Development Life Cycle (SDLC)** is a structured process used to design, build, test, and deliver high‑quality software. Think of it as the roadmap that guides a project from the first spark of an idea all the way to deployment and long‑term maintenance.

Below is a breakdown of the major phases and what each one accomplishes.

---

## 💡 1. **Planning**
This is where everything starts.

**Goal:** Understand the problem and determine whether the project is feasible.

**Key activities:**
- Identify the purpose of the software  
- Estimate time, cost, and resources  
- Define high‑level goals and constraints  
- Assess risks  

This phase sets the tone for the entire project.

---

## 📋 2. **Requirements Analysis**
Now the team figures out *exactly* what the software must do.

**Key activities:**
- Meet with stakeholders  
- Document functional requirements (what the system should do)  
- Document non‑functional requirements (performance, security, usability, etc.)  
- Create use cases or user stories  

This becomes the blueprint for the rest of development.

---

## 🧱 3. **Design**
This is where the “how” gets defined.

**Key activities:**
- System architecture design  
- Database design  
- UI/UX mockups  
- Technology stack selection  
- Define modules, components, and data flow  

The design phase translates requirements into a technical plan.

---

## 💻 4. **Implementation (Coding)**
Developers finally start writing the actual code.

**Key activities:**
- Build features according to the design  
- Follow coding standards  
- Integrate modules  
- Perform unit testing  

This is usually the longest phase — and where debugging becomes your best frenemy.

---

## 🧪 5. **Testing**
Before releasing the software, it must be validated.

**Key activities:**
- Functional testing  
- Integration testing  
- Performance testing  
- Security testing  
- Bug fixing  

The goal is to ensure the software works as intended and is stable.

---

## 🚀 6. **Deployment**
Once the software passes testing, it’s released to users.

**Key activities:**
- Deploy to production  
- Configure servers or cloud environments  
- Monitor for issues  
- Provide initial support  

Deployment can be a one‑time event or continuous (CI/CD pipelines).

---

## 🔧 7. **Maintenance**
After release, the software enters its longest phase.

**Key activities:**
- Fix bugs discovered by users  
- Add new features  
- Update dependencies  
- Improve performance  
- Patch security vulnerabilities  

Maintenance keeps the software relevant and functional over time.

---

# 🌀 SDLC Models (How teams structure the phases)
Different teams follow different models depending on their needs:

| Model | Description |
|-------|-------------|
| **Waterfall** | Linear, each phase completed before the next. |
| **Agile** | Iterative, flexible, frequent releases. |
| **Spiral** | Risk‑driven, combines iterative development with risk analysis. |
| **V‑Model** | Testing is planned in parallel with development. |
| **Iterative** | Build small versions and improve over time. |

---

But what does the SDLC actually do?
- Ensures high‑quality software  
- Reduces project risks  
- Improves communication  
- Helps manage time and cost  
- Creates predictable, repeatable processes  

---

