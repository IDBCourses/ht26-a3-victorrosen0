/*
 * IDB Programming: A3 — a musical instrument
 *
 * All of the code for your instrument goes in this file. It's split into sections:
 *   settings — the "fixed" parts of your program
 *   state    — the parts of your program that change over time
 *   sound    — the Tone.js instruments and effects
 *   update   — updates the state every 100ms, if necessary
 *   use      — uses the state to make sound and shapes every 100ms, if necessary
 *   controls — what happens when the player uses the pointer
 *   setup    — starts everything
 *
 * The pointer events change the state. update() and use() each run every
 * 100ms, in a loop:
 *   1. update: change the state, e.g. based on time or on the pointer's movement
 *   2. use:    make sound and move shapes, based on the state
 *
 * Shapes come from shape.js: createShape() makes one, and its methods
 * (setPosition, setSize, setColour ...) change it.
 *
 * Tone.js documentation: https://tonejs.github.io/docs/15.1.22/
 */

import { createShape } from "./shape.js";

// ---------- Settings ----------
// Settings variables should contain all of the "fixed" parts of your programs
// For example: which notes you can play, how fast things move, the tempo.
const note = ["A4", "E4", "C4"]; // the note played when the pointer goes down
const startColours = [[175, 90, 30], [300, 90, 70], [50, 90, 70]];
const positionsX = [0.1, 0.4, 0.7];

// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.
let shapes = [];
let active = -1; //Which shape is pressed and -1 = none.
let lastX = 0;
let lastY = 0;
let lastTime = 0;
let speeds = [];
let average = 0;  //Average speed, screens/second.
let amount = 0;  //Average speed as a number 0-1.

// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
const synths = [
  new Tone.Synth().toDestination(),
  new Tone.Synth().toDestination(),
  new Tone.Synth().toDestination(),
];
//const synth = new Tone./*Poly*/Synth(/*Tone.Synth*/).toDestination(); // can play several notes at once

// ---------- Update ----------
// Update the state. This is called every 100ms.
function update() {
  let total = 0;
  for (let i = 0; i < speeds.length; i++) {
    total = total + speeds[i];
  }

  average = 0;
  if (speeds.lenght > 0) {
    average = total / speeds.length;
  }

  amount = Math.min(average / 3, 1);  //0-1 where 2 or more screens/second is max.

  console.log(average.toFixed(3));

  setTimeout(update, 100); // call update() again in 100 milliseconds
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.
function use() {
  setTimeout(use, 100); // call use() again in 100 milliseconds
}

// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.
function shapePress(i, event) {
Tone.start();
shapes[i].element.setPointerCapture(event.pointerId);  //To keep getting events outside the shape

active = i;
lastX = event.clientX / window.innerWidth;
lastY = event.clientY / window.innerHeight;
lastTime = Date.now();
speeds = [];
average = 0;
amount = 0;
synths[i].triggerAttack(note[i]);

shapes[i].setSize(300);
shapes[i].setColour(200, 80, 50);
shapes[i].setPosition(positionsX[i], 0.2);
}

function shapeRelease(i) {
if (active !== i) {
  return;
}
synths[i].triggerRelease();
active = -1;

shapes[i].setSize(200);
shapes[i].setColour(startColours[i][0], startColours[i][1], startColours[i][2]);
shapes[i].setPosition(positionsX[i], 0.2);
}

function pointerMove(event) {
  if (active === -1) {
    return;
  }

  let normX = event.clientX / window.innerWidth;
  let normY = event.clientY / window.innerHeight;
  let now = Date.now();
  let distance = Math.hypot(normX - lastX, normY - lastY); // screens
  let seconds = (now - lastTime) / 1000;
  if (seconds === 0) {
    return; // no time has gone, therefore no speed.
  }
  let speed = distance / seconds; // screens/second
  lastX = normX;
  lastY = normY;
  lastTime = now;

  speeds.push(speed);
  setTimeout(forgetOldest, 500);
  console.log(speeds.length);
}

function forgetOldest(event) {
  speeds.shift();
}

function pointerDown1(event) { shapePress(0, event); }
function pointerDown2(event) { shapePress(1, event); }
function pointerDown3(event) { shapePress(2, event); }

function pointerUp1() { shapeRelease(0); }
function pointerUp2() { shapeRelease(1); }
function pointerUp3() { shapeRelease(2); }

  //console.log("Pointer down at", event.clientX, event.clientY);


// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  update()

  for (let i = 0; i < 3; i++) {
    shapes[i] = createShape("shape" + (i + 1));
    shapes[i].setSize(200);
    shapes[i].setColour(startColours[i][0], startColours[i][1], startColours[i][2]);
    shapes[i].setPosition(positionsX[i], 0.2);
  }

  // Put your event listener code here
 // window.addEventListener("pointerdown", pointerDown);
window.addEventListener("pointermove", pointerMove);  //So the pointer can be anywhere on the screen when pressed down on a shape.

  shapes[0].element.addEventListener("pointerdown", pointerDown1);
  shapes[0].element.addEventListener("pointerup", pointerUp1);
  shapes[0].element.addEventListener("pointercancel", pointerUp1);

  shapes[1].element.addEventListener("pointerdown", pointerDown2);
  shapes[1].element.addEventListener("pointerup", pointerUp2);
  shapes[1].element.addEventListener("pointercancel", pointerUp2);

  shapes[2].element.addEventListener("pointerdown", pointerDown3);
  shapes[2].element.addEventListener("pointerup", pointerUp3);
  shapes[2].element.addEventListener("pointercancel", pointerUp3);
}

setup(); // Always remember to call setup()!
