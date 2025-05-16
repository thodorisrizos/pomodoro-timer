'use strict';


////////////////////////////////////////////////////
//  Variables
let completeSessions = 0;
let completeBreaks = 0;
let completeLongBreaks = 0;
let mode = 'work';

let deepWorkSession = 25;
let breakLength = 5;
let longBreakLength = 10;
let breakCounter = 0;
let reaminaingTime = 0;

let isSession = true; // Deep Work: true || Break or Long Break: false
let isRunning = false;
let timeLeft = 0;
let timerInterval;

const alarmAudio = new Audio('../audio/alarm1.mp3');


////////////////////////////////////////////////////
// Select Elements from DOM
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const restartButton = document.getElementById('restart');

const sessionInput = document.getElementById('sessionInput');
const breakInput = document.getElementById('breakInput');
const longBreakInput = document.getElementById('longBreakInput');

const sessionUp = document.getElementById('sessionUp');
const sessionDown = document.getElementById('sessionDown');
const breakUp = document.getElementById('breakUp');
const breakDown = document.getElementById('breakDown');
const longBreakUp = document.getElementById('longBreakUp');
const longBreakDown = document.getElementById('longBreakDown');

const deepWorkScore = document.querySelector('.deepWorkScore');
const breakScore = document.querySelector('.breakScore');
const longBreakScore = document.querySelector('.longBreakScore');

const dispMin = document.querySelector('.minutes');
const dispSec = document.querySelector('.seconds');
const title = document.getElementById('statusTitle');

const deepWorkStatus = document.querySelector('.deepWorkStatus');
const breakStatus = document.querySelector('.breakStatus');
const longBreakStatus = document.querySelector('.longBreakStatus');



////////////////////////////////////////////////////
// Event Listeners
startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
restartButton.addEventListener('click', restartTimer);

const randomInputs = [
    {element: breakInput, limit: 10, label: 'Break Length', modeAtt:'break'},
    {element: longBreakInput, limit: 20, label: 'Break Length', modeAtt:'longBreak'},
    {element: sessionInput, limit: 60, label: 'Session Length', modeAtt:'work'}
];

randomInputs.forEach(({element, limit, label, modeAtt}) => {
    element.addEventListener('input', () => {
        setBordersForInput(element, limit, label);
        if (!isRunning && mode === modeAtt) {
            timeLeft = parseInt(element.value) * 60;
            reaminaingTime = timeLeft;
            setInitialTime(timeLeft);
        }
    });
});


const arrowsClicksUp = [
    {element: breakUp, input: breakInput, change: +1, modeAtt: "break", limit: 10, label: 'Break Length'},
    {element: longBreakUp, input: longBreakInput, change: +1, modeAtt: "longBreak", limit: 20, label: 'Break Length'},
    {element: sessionUp, input: sessionInput, change: +1, modeAtt: "work", limit: 60, label: 'Session Length'},
];

const arrowsClicksDown = [
    {element: breakDown, input: breakInput, change: -1, modeAtt: "break", limit: 10, label: 'Break Length'},
    {element: longBreakDown, input: longBreakInput, change: -1, modeAtt: "longBreak", limit: 20, label: 'Break Length'},
    {element: sessionDown, input: sessionInput, change: -1, modeAtt: "work", limit: 60, label: 'Session Length'},
];

arrowsClicksUp.forEach(({element, modeAtt, input, limit, label}) => {
    element.addEventListener('click', () => {
        let val = (parseInt(input.value) >= limit) ? 0 : parseInt(input.value++);   
        if (!isRunning && mode === modeAtt) { 
            timeLeft = (val+1)*60;
            reaminaingTime = timeLeft;
            setBordersForInput(input, limit, label);
            setInitialTime(timeLeft);
        }
    });
});

arrowsClicksDown.forEach(({element, modeAtt, input, limit, label}) => {
    element.addEventListener('click', () => {
        let val = (parseInt(input.value) <= 1) ? 0 : parseInt(input.value--);   
        if (!isRunning && mode === modeAtt) { 
            timeLeft = (val-1)*60;
            reaminaingTime = timeLeft;
            setBordersForInput(input, limit, label);
            setInitialTime(timeLeft);
        }
    });
});



////////////////////////////////////////////////////
// Functions

// Function: Update Timer
function setInitialTime(seconds){
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;
    dispMin.textContent = mins.toString().padStart(2, '0');
    dispSec.textContent = secs.toString().padStart(2, '0');
}
    
// Function: Add or Remove Buttons
function switchButtons(state){
    if(state){
        startButton.classList.add('removeClass');
        pauseButton.classList.remove('removeClass');
        restartButton.classList.remove('removeClass');
    }else{
        startButton.classList.remove('removeClass');
        pauseButton.classList.add('removeClass');
        restartButton.classList.add('removeClass');
    }
}

// Function: Play Audio
function playAlarm(callback){
    mode = 'alarm';
    title.textContent = '⏰ Time\'s Up';
    alarmAudio.play();
    setTimeout(() => {
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
        callback();
    }, 9000);
}


function pomodoroTimerStart(duration, modeArg) {
    if (isRunning) return; // Prevent multiple intervals
    timeLeft = duration;
    setInitialTime(timeLeft);

    
    timerInterval = setInterval(() => {
        timeLeft--;
        setInitialTime(timeLeft);

        if(timeLeft <= 0){
            clearInterval(timerInterval);
            timeLeft = 0;
            isRunning = false

            playAlarm(() => {
                if(modeArg === 'work'){
                    completeSessions++;
                    deepWorkScore.textContent = completeSessions;
                    breakCounter++;

                    if(breakCounter <= 3){
                        mode = 'break';
                        deepWorkStatus.classList.remove('active');
                        breakStatus.classList.add('active');
                        longBreakStatus.classList.remove('active');
                        deepWorkScore.classList.remove('activeScore');
                        breakScore.classList.add('activeScore');
                        longBreakScore.classList.remove('activeScore');
                        isSession = false; // Break
                        startTimer();
                    }else{
                        mode = 'longBreak';
                        breakCounter = 0;
                        deepWorkStatus.classList.remove('active');
                        breakStatus.classList.remove('active');
                        longBreakStatus.classList.add('active');
                        deepWorkScore.classList.remove('activeScore');
                        breakScore.classList.remove('activeScore');
                        longBreakScore.classList.add('activeScore');
                        isSession = false; // Break
                        startTimer();
                    }


                }else if(modeArg === 'break'){
                    completeBreaks++;
                    breakScore.textContent = completeBreaks;
                    mode = 'work';
                    deepWorkStatus.classList.add('active');
                    breakStatus.classList.remove('active');
                    longBreakStatus.classList.remove('active');
                    deepWorkScore.classList.add('activeScore');
                    breakScore.classList.remove('activeScore');
                    longBreakScore.classList.remove('activeScore');
                    title.textContent = 'Deep Work Time!';
                    isSession = true;
                    startTimer();

                }else if(modeArg === 'longBreak'){
                    completeLongBreaks++;
                    completeBreaks++;
                    breakScore.textContent = completeBreaks;
                    longBreakScore.textContent = completeLongBreaks;
                    mode = 'work';
                    deepWorkStatus.classList.add('active');
                    breakStatus.classList.remove('active');
                    longBreakStatus.classList.remove('active');
                    deepWorkScore.classList.add('activeScore');
                    breakScore.classList.remove('activeScore');
                    longBreakScore.classList.remove('activeScore');
                    title.textContent = 'Deep Work Time!';
                    isSession = true;
                    startTimer();
                }
            });
        }
        reaminaingTime = timeLeft;
    }, 1000);
}

function startTimer(){
    if (isRunning) return; // Prevent multiple intervals
    
    // Checks if there is already value in time variable
    if(timeLeft === 0){
        // Time Based on Input Values
        timeLeft = isSession ? parseInt(sessionInput.value)*60 : ((mode === 'break') ? parseInt(breakInput.value)*60 : parseInt(longBreakInput.value)*60);
    }else{
        timeLeft = reaminaingTime || setBordersForInput(sessionInput, 60, 'ahjvsdjhvj');;
    }

    // Remove Start Button and Display Pause and Restart Buttons
    switchButtons(true);

    // Update title Content Based on the Mode: work | Break | Long Break 
    title.textContent = isSession ? 'Deep Work' : ((mode === 'break') ? 'Break Time!' : 'Long Break!');    

    // Call Timer
    pomodoroTimerStart(timeLeft, mode);

    // Timer is running
    isRunning = true;
}


function pauseTimer(){
    // Replace Pause Button with Start
    startButton.classList.remove('removeClass');
    pauseButton.classList.add('removeClass');

    // Clear a timer set
    clearInterval(timerInterval);

    // Timer is not running
    isRunning = false;
}

function restartTimer(){
    // Clear a timer set
    clearInterval(timerInterval);

    // Replace Pause and Restart Buttons with Start Button
    switchButtons(false);

    // Update the Title State
    title.textContent = isSession ? 'Ready?' : (mode === 'break' ? 'Break?' : 'Restart?');

    // Time Based on Input Values
    timeLeft = isSession ? parseInt(sessionInput.value)*60 : ((mode === 'break') ? parseInt(breakInput.value)*60 : parseInt(longBreakInput.value)*60);

    // Update the Remaining Time
    reaminaingTime = timeLeft;

    // Display the new Timer
    setInitialTime(timeLeft);

    // Timer is not running
    isRunning = false;
}


function setBordersForInput(inputId, max, message){
    let val = parseInt(inputId.value);

    if (isNaN(val) || val < 1) {
        inputId.value = 1;
        val = 1;
    } else if (val > max) {
        inputId.value = max;
        val = max;
    }

    if (!isRunning && isSession) {
        timeLeft = val * 60;
        setInitialTime(timeLeft);
        title.textContent = message;
    }

    return timeLeft;
}