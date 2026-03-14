---
layout: opencs
title: Red Riding Hood Game 
permalink: /ridinghoodportfolio
codemirror: true
---

# The Red Riding Hood Game
### Made by Anika, Rashi, and Mateo! 

Our game is <span style="color:red"> Red Riding Hood </span><br>
The game consists of **two** levels! 
- Level 1: <span style="color:red">The Revelation of Red Riding Hood </span><br>
Red Riding has to collect cookies for her grandma, throughout the woods, to move on to level 2

- Level 2:<span style="color:red"> The Chase </span><br>
Red Riding has to successfully follow the path to her grandma's house, without colliding with the wolf

{% capture ridinghood_code %}
import GameControl from '{{site.baseurl}}/assets/js/GameEnginev1/essentials/GameControl.js';
import GameLevelRedRidingHood1 from '{{site.baseurl}}/assets/js/GameEnginev1/redridinghood/level1.js';
import GameLevelRedRidingHood2 from '{{site.baseurl}}/assets/js/GameEnginev1/redridinghood/level2.js';

export const gameLevelClasses = [GameLevelRedRidingHood1, GameLevelRedRidingHood2];
export { GameControl };
{% endcapture %}

{% include game-runner.html
   runner_id="red_riding_hood"
   challenge="Help Red Riding Hood collect 5 cookies!"
   code=ridinghood_code
   height="580px"
%}