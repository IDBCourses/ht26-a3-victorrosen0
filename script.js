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
const startColour = [[175, 90, 30], [300, 90, 70], [50, 90, 70]];
const positionsX = [0.1, 0.4, 0.7];

// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.
let shapes = [];

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
  setTimeout(update, 100); // call update() again in 100 milliseconds
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.
function use() {
  setTimeout(use, 100); // call use() again in 100 milliseconds
}

// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.
function pointerDown(event) {
  Tone.start(); // browsers only allow sound after the player has pressed something

  console.log("Pointer down at", event.clientX, event.clientY);
 // synth.triggerAttackRelease(note, "8n"); // play the note for an eighth note
}

function pointerDown1(event) {
  console.log("shape1 clicked");
  synths[0].triggerAttack(note[0]);
  shapes[0].setSize(300);
  shapes[0].setColour(200, 80, 50);
  shapes[0].setPosition(0.1, 0.2);
}

function pointerDown2(event) {
  console.log("shape2 clicked");
  synths[1].triggerAttack(note[1]);
  shapes[1].setSize(300);
  shapes[1].setColour(200, 80, 50);
  shapes[1].setPosition(0.4, 0.2);
}

function pointerDown3(event) {
  console.log("shape3 clicked");
  synths[2].triggerAttack(note[2]);
  shapes[2].setSize(300);
  shapes[2].setColour(200, 80, 50);
  shapes[2].setPosition(0.7, 0.2);
}

function pointerUp1(event) {
  synths[0].triggerRelease()
  shapes[0].setSize(200);
  shapes[0].setColour(175,90, 30);
  shapes[0].setPosition(0.1, 0.2);

}

function pointerUp2(event) {
  synths[1].triggerRelease()
  shapes[1].setSize(200);
  shapes[1].setColour(300, 90, 70);
  shapes[1].setPosition(0.4, 0.2);
}

function pointerUp3(event) {
  synths[2].triggerRelease()
  shapes[2].setSize(200);
  shapes[2].setColour(50, 90, 70);
  shapes[2].setPosition(0.7, 0.2);
}

// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  //update(); // start the update loop
  //use(); // start the use loop

  for (let i = 0; i < 3; i++) {
    shapes[i] = createShape("shape" + (i + 1));
    shapes[i].setSize(200);
    shapes[i].setColour(startColour[i][0], startColour[i][1], startColour[i][2]);
    shapes[i].setPosition(positionsX[i], 0.2);
  }

  // Put your event listener code here
  window.addEventListener("pointerdown", pointerDown);

  shapes[0].element.addEventListener("pointerdown", pointerDown1);
  shapes[0].element.addEventListener("pointerup", pointerUp1);
  shapes[0].element.addEventListener("pointerleave", pointerUp1);

  shapes[1].element.addEventListener("pointerdown", pointerDown2);
  shapes[1].element.addEventListener("pointerup", pointerUp2);
  shapes[1].element.addEventListener("pointerleave", pointerUp2);

  shapes[2].element.addEventListener("pointerdown", pointerDown3);
  shapes[2].element.addEventListener("pointerup", pointerUp3);
  shapes[2].element.addEventListener("pointerleave", pointerUp3);
}

setup(); // Always remember to call setup()!
