---
layout: opencs
title: RPG Water Exam
permalink: /gamify/PirateMegaGame
---

<div id="gameContainer">
    <div id="promptDropDown" class="promptDropDown" style="z-index: 9999"></div>
    <!-- GameEnv will create canvas dynamically -->
</div>

<script type="module">
    // Adnventure Game assets locations
    import Core from "{{site.baseurl}}/assets/js/GameEnginev1/essentials/Game.js";
    import GameControl from "{{site.baseurl}}/assets/js/GameEnginev1/essentials/GameControl.js";
    import PMGLevel1 from "{{site.baseurl}}/assets/js/GameEnginev1/PMG-Level1.js";
    import PMGLevel2 from "{{site.baseurl}}/assets/js/GameEnginev1/PMG-Level2.js";
    import { pythonURI, javaURI, fetchOptions } from "{{site.baseurl}}/assets/js/api/config.js";

    const gameLevelClasses = [PMGLevel1, PMGLevel2];

    // Web Server Environment data
    const environment = {
        path:"{{site.baseurl}}",
        pythonURI: pythonURI,
        javaURI: javaURI,
        fetchOptions: fetchOptions,
        gameContainer: document.getElementById("gameContainer"),
        gameLevelClasses: gameLevelClasses

    }
    // Launch Adventure Game using the central core and adventure GameControl
    Core.main(environment, GameControl);
</script>
