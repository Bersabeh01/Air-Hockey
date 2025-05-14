# Air-Hockey
It's modern implementation of Air Hockey with smooth controls and fair AI
1. HTML (index.html)
This file sets up the basic structure of the game:

Canvas (<canvas>) – Where the game is drawn.

Buttons – Start, Stop, and Restart controls.

Scoreboard – Displays player scores.

2. CSS (styles.css)
Styles the game with:

A dark-themed background.

Neon-blue borders for the hockey table.

Styled buttons and score display.

3. JavaScript (list.js)
The core game logic is here:

Game Elements
Canvas & Context – Used for drawing.

Paddles (Player & AI) – Circular paddles controlled by the player (bottom) and AI (top).

Puck – The ball that players hit.

Score Tracking – Variables score1 (player) and score2 (AI).

Physics & Movement
Paddle Movement (Player)

Follows the mouse/touch position smoothly.

Restricted to the bottom half of the table.

AI Movement

Predicts where the puck is going (predictX, predictY) and moves toward that position.

Stays in its own half.

Puck Movement

Bounces off walls (with slight energy loss * 0.98).

Detects goals (when the puck enters the semicircular goals).

Collision Detection
When the puck hits a paddle:

The angle of collision is calculated (Math.atan2).

The puck bounces away with increased speed (* 1.05).

The puck is slightly pushed out to prevent sticking.

Game Loop
requestAnimationFrame(gameLoop) ensures smooth animation.

Steps per frame:

Update positions (paddles, puck).

Check collisions & goals.

Redraw everything.

Controls
Mouse/Touch – Moves the player paddle.

Buttons:

Start → Begins the game loop.

Stop → Pauses the game.

Restart → Resets scores and positions.

Scoring
If the puck enters:

Top goal (AI side) → Player scores (score1++).

Bottom goal (Player side) → AI scores (score2++).

Key Improvements from Original Code
Smooth Paddle Movement

The player paddle now follows the cursor/touch position smoothly (no keyboard lag).

Better AI

Predicts puck movement instead of just chasing it.

Prevents "corner trapping" by recalculating target positions.

Improved Physics

Puck loses a tiny bit of speed on bounces (* 0.98).

Gains speed when hit (* 1.05).

Touch Support

Works on mobile devices via touchmove events.

Optimized Rendering

Uses requestAnimationFrame for smoother gameplay.

How the Game Works
Start the game → The puck moves randomly.

Move your paddle → Touch/mouse controls the bottom paddle.

Hit the puck → Try to score in the AI’s goal (top semicircle).

AI defends → The top paddle moves smartly to block shots.

Score points → First to 5 (or any target) wins!

Potential Enhancements
Multiplayer Mode (2 players).

Difficulty Levels (adjust AI_SPEED).

Sound Effects (on hit, goal).

Mobile Optimizations (better touch controls).
