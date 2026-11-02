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
const notes = ["A4", "E4", "C2"]; //Shape 3 starts on lowest octave C2, then use() changes it with the speed.
const startColours = [[175, 90, 30], [300, 90, 70], [50, 90, 70]];
const positionsX = [0.1, 0.4, 0.7];

// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.
let shapes = [];  //The three shapes. Filled in setup().
let active = -1; //Which shape is pressed and -1 = none.
let lastX = 0;  //Where the pointer was at the last move (0-1 of the screen width).
let lastY = 0;  //Where the pointer was at the last move (0-1 of the screen height).
let lastTime = 0;  //Time of last move that happened (in milliseconds).
let speeds = [];  //The speeds we remember and each is removed after 500ms.
let average = 0;  //Average speed, screens/second.
let amount = 0;  //Average speed as a number 0-1.

// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
//One synth per shape, so volume, pitch and octave don't affect each other.
const synths = [
  new Tone.Synth().toDestination(),
  new Tone.Synth().toDestination(),
  new Tone.Synth().toDestination(),
];

// ---------- Update ----------
// Update the state. This is called every 100ms.
function update() {
  //Adding all the speeds, that are saved, together.
  let total = 0;
  for (let i = 0; i < speeds.length; i++) {
    total = total + speeds[i];
  }

  //Taking the average by dividing by how many there are (Empty list gives 0, not NaN).
  average = 0;
  if (speeds.length > 0) {
    average = total / speeds.length;
  }

  //Making the average into a number 0-1 to use for sound and shapes.
  amount = Math.min(average / 2, 1);  //0-1 where 2 or more screens/second is max.

  setTimeout(update, 100); // call update() again in 100 milliseconds
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.
function use() {
  //Only react when shape is pressed.
  if (active !== -1) {
    let synth = synths[active];  //Synth that belongs to the pressed shape.

    //Speed does different things for the different shapes.
    if (active === 0) {
      synth.volume.value = -30 + amount * 30;  //Volume -30dB to 0dB.
    } else if (active === 1) {
      synth.detune.value = average * 300;  //Pitch
    } else if (active === 2) {
      let octave = 2 + Math.round(amount * 3);  //Octave 2-5.
      synth.setNote("C" + octave);  //
    }

    //At the same time speed controls the visual.
    shapes[active].setSize(250 + amount * 150);  //Shapes change size with the speed.
    shapes[active].setColour(200 + amount * 120, 80, 50);  //Shapes change colour with the speed.
  }
  setTimeout(use, 100); // call use() again in 100 milliseconds
}

// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.
function shapePress(i, event) {
Tone.start();  // Browsers only allow sound after the player has pressed something.
shapes[i].element.setPointerCapture(event.pointerId);  //To keep getting events from outside the shape.

//To remember which shape is pressed and start measuring from where the pointer is now.
active = i;
lastX = event.clientX / window.innerWidth;
lastY = event.clientY / window.innerHeight;
lastTime = Date.now();

//Forgets last time so new press starts over from 0.
speeds = [];
average = 0;
amount = 0;

synths[i].detune.value = 0;  //Resets volume value so it doesn't start where it was last.
if (i === 0) {
synths[i].volume.value = -30;  //What the volume starts at in shape 1.
} else {
  synths[i].volume.value = 0;
}

synths[i].triggerAttack(notes[i]);  //Starts with held note.

//The shape reacts instantly before use() is run.
shapes[i].setSize(300);
shapes[i].setColour(200, 80, 50);
shapes[i].setPosition(positionsX[i], 0.2);
}

//Runs when pointer is canceled or released on shape i.
function shapeRelease(i) {
  //Ignores it if this shape isn't the one being pressed.
  if (active !== i) {
    return;
  }
  synths[i].triggerRelease();
  active = -1;  //No shape is pressed.

  //Sets ths pressed shape back to original setup.
  shapes[i].setSize(200);
  shapes[i].setColour(startColours[i][0], startColours[i][1], startColours[i][2]);
  shapes[i].setPosition(positionsX[i], 0.2);
}

//Runs when pointer moves to measure the speed and save it.
function pointerMove(event) {
  if (active === -1) {  //No shape is pressed and nothing to measure.
    return;
  }

  //Normalise the position so window size doesn't effect speed.
  let normX = event.clientX / window.innerWidth;
  let normY = event.clientY / window.innerHeight;
  let now = Date.now();
  let distance = Math.hypot(normX - lastX, normY - lastY); // screens
  let seconds = (now - lastTime) / 1000;
  if (seconds === 0) {
    return; // no time has gone, therefore no speed.
  }
  let speed = distance / seconds; // screens/second

  //Remembers this position and time for next move.
  lastX = normX;
  lastY = normY;
  lastTime = now;

  speeds.push(speed);  //Saves speed at the end of the array.
  setTimeout(forgetOldest, 500);  //Forget the speed after 500ms.
}

//Removes oldest speed and called in pointerMove after 500ms.
function forgetOldest() {
  speeds.shift();  //Removes first speed in the array.
}

//So each shape can pass along i.
function pointerDown1(event) { shapePress(0, event); }
function pointerDown2(event) { shapePress(1, event); }
function pointerDown3(event) { shapePress(2, event); }

function pointerUp1() { shapeRelease(0); }
function pointerUp2() { shapeRelease(1); }
function pointerUp3() { shapeRelease(2); }

// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  update()  //Starts update loop.
  use()  //Starts use loop.

  //Creates the three shapes with start size, colour and position.
  for (let i = 0; i < 3; i++) {
    shapes[i] = createShape("shape" + (i + 1));
    shapes[i].setSize(200);
    shapes[i].setColour(startColours[i][0], startColours[i][1], startColours[i][2]);
    shapes[i].setPosition(positionsX[i], 0.2);
  }

  // Put your event listener code here
  window.addEventListener("pointermove", pointerMove);  //So the pointer can be anywhere on the screen when pressed down on a shape.

  //Shape 1 pressed starts the note and realesing or canceled pointer stops it.
  shapes[0].element.addEventListener("pointerdown", pointerDown1);
  shapes[0].element.addEventListener("pointerup", pointerUp1);
  shapes[0].element.addEventListener("pointercancel", pointerUp1);

  //Shape 2 pressed starts the note and realesing or canceled pointer stops it.
  shapes[1].element.addEventListener("pointerdown", pointerDown2);
  shapes[1].element.addEventListener("pointerup", pointerUp2);
  shapes[1].element.addEventListener("pointercancel", pointerUp2);

  //Shape 3 pressed starts the note and realesing or canceled pointer stops it.
  shapes[2].element.addEventListener("pointerdown", pointerDown3);
  shapes[2].element.addEventListener("pointerup", pointerUp3);
  shapes[2].element.addEventListener("pointercancel", pointerUp3);
}

setup(); // Always remember to call setup()!
