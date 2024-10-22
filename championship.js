document.addEventListener('DOMContentLoaded', function() {
    console.log("Championship page loaded");

    const players = [
        'User', 'Magnus', 'Kasparov', 'Carlsen', 'Capablanca', 
        'Fischer', 'Alekhine', 'Tal', 'Botvinnik', 'Lasker', 
        'Anand', 'Karpov', 'Spassky', 'Petrosian', 'Kramnik', 'Morphy'
    ];

    let championshipInProgress = false;
    let currentFixtures = [];
    let currentRound = '';

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function generateFixtures(players) {
        shuffleArray(players);
        currentFixtures = [];
        for (let i = 0; i < players.length / 2; i++) {
            currentFixtures.push([players[i], players[players.length - 1 - i]]);
        }
        return currentFixtures.map(match => `<span>${match[0]}</span><span>vs</span><span>${match[1]}</span>`);
    }

    function updateRound(playerCount) {
        switch (playerCount) {
            case 16:
                currentRound = 'Round of 16 (RO16)';
                break;
            case 8:
                currentRound = 'Quarter-finals (QF)';
                break;
            case 4:
                currentRound = 'Semi-finals (SF)';
                break;
            case 2:
                currentRound = 'Final';
                break;
            case 1:
                currentRound = 'Championship Complete';
                break;
            default:
                currentRound = 'Unknown Round';
        }
        localStorage.setItem('currentRound', currentRound);
    }

    function showFixtures() {
        const fixturesList = document.getElementById('fixtures-list');
        const roundIndicator = document.getElementById('round-indicator');
        currentFixtures = [];
        for (let i = 0; i < players.length; i += 2) {
            currentFixtures.push([players[i], players[i + 1]]);
        }
        updateRound(players.length);
        roundIndicator.textContent = currentRound;
        fixturesList.innerHTML = currentFixtures.map(match => 
            `<li><span>${match[0]}</span><span>vs</span><span>${match[1]}</span></li>`
        ).join('');
        
        // Save current state
        localStorage.setItem('savedFixtures', JSON.stringify(currentFixtures));
        localStorage.setItem('savedPlayers', JSON.stringify(players));
    }

    function updateFixtures() {
        const roundResults = JSON.parse(localStorage.getItem('roundResults'));
        if (roundResults && roundResults.length > 0) {
            // Update players based on round results
            players.length = 0; // Clear the players array
            roundResults.forEach(result => {
                players.push(result.winner);
            });
            
            if (players.length > 1) {
                shuffleArray(players);
                localStorage.setItem('remainingPlayers', JSON.stringify(players));
                showFixtures();
            } else {
                // Championship is over
                const winner = players[0];
                document.getElementById('fixtures-list').innerHTML = `<h2>${winner} is the Champion!</h2>`;
                updateRound(1);
                document.getElementById('round-indicator').textContent = currentRound;
                document.getElementById('play-btn').style.display = 'none';
                localStorage.removeItem('championshipInProgress');
                localStorage.removeItem('savedFixtures');
                localStorage.removeItem('savedPlayers');
                localStorage.removeItem('currentRound');
            }
            
            localStorage.removeItem('roundResults'); // Clear the results after processing
        }
    }

    function startChampionship() {
        console.log("Starting championship");
        updateRound(16);
        localStorage.setItem('remainingPlayers', JSON.stringify(players));
        showFixtures();
        championshipInProgress = true;
        localStorage.setItem('championshipInProgress', 'true');
    }

    function showExitModal() {
        document.getElementById('exit-modal').classList.remove('hidden');
    }

    function hideExitModal() {
        document.getElementById('exit-modal').classList.add('hidden');
    }

    document.getElementById('exit-btn').addEventListener('click', showExitModal);

    document.getElementById('save-progress-btn').addEventListener('click', function() {
        console.log("Save progress clicked");
        localStorage.setItem('championshipInProgress', 'true');
        localStorage.setItem('savedFixtures', JSON.stringify(currentFixtures));
        hideExitModal();
        window.location.href = 'competition.html';
    });

    document.getElementById('lose-progress-btn').addEventListener('click', function() {
        console.log("Lose progress clicked");
        localStorage.removeItem('championshipInProgress');
        localStorage.removeItem('savedFixtures');
        hideExitModal();
        window.location.href = 'competition.html';
    });

    document.getElementById('cancel-btn').addEventListener('click', hideExitModal);

    document.getElementById('play-btn').addEventListener('click', function() {
        console.log("Play button clicked");
        window.location.href = 'game.html';
    });

    // Check if returning from results page or resuming championship
    if (localStorage.getItem('roundResults')) {
        updateFixtures();
    } else if (localStorage.getItem('championshipInProgress') === 'true') {
        console.log("Championship in progress, resuming");
        championshipInProgress = true;
        const savedFixtures = localStorage.getItem('savedFixtures');
        const savedPlayers = localStorage.getItem('savedPlayers');
        const savedRound = localStorage.getItem('currentRound');
        if (savedFixtures && savedPlayers && savedRound) {
            currentFixtures = JSON.parse(savedFixtures);
            players.length = 0;
            players.push(...JSON.parse(savedPlayers));
            currentRound = savedRound;
            showFixtures();
        } else {
            startChampionship();
        }
    } else {
        console.log("New championship starting");
        startChampionship();
    }

    // Ensure the modal is hidden initially
    hideExitModal();
});
