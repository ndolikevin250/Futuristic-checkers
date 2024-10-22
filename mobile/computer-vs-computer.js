const VERSION = "1.0.0";
let lastCheckedVersion = localStorage.getItem('lastCheckedVersion') || VERSION;

async function checkForUpdates() {
    try {
        const response = await fetch('version.json');
        const data = await response.json();
        if (data.version !== lastCheckedVersion) {
            alert(`A new version (${data.version}) is available. Please refresh the page to update.`);
            localStorage.setItem('lastCheckedVersion', data.version);
        }
    } catch (error) {
        console.error('Failed to check for updates:', error);
    }
}

window.addEventListener('load', checkForUpdates);

let gameState = [];
let currentPlayer = 'computer0';
let board = document.getElementById('board');
let isPaused = false;
let gameInterval;

// Web Audio API context
let audioContext;

function initializeAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(frequency, duration) {
    if (!audioContext) initializeAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

function playCaptureSound() {
    playSound(500, 0.1);
}

function playKingSound() {
    playSound(300, 0.3);
}

// ... (rest of the computer-vs-computer.js code remains the same)
