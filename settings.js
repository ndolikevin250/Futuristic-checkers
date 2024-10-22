document.addEventListener('DOMContentLoaded', function() {
    const settingsButton = document.getElementById('settings-btn');
    const saveButton = document.getElementById('save-btn');
    const backButton = document.getElementById('back-btn');
    const difficultySelect = document.getElementById('difficulty-select');

    // Check if we are on the settings page
    if (difficultySelect) {
        // Load saved difficulty level from localStorage
        const savedDifficulty = localStorage.getItem('gameDifficulty');
        if (savedDifficulty) {
            difficultySelect.value = savedDifficulty; // Set the dropdown to the saved difficulty
        } else {
            difficultySelect.value = 'easy'; // Set default to 'easy' if no saved value
        }

        saveButton.addEventListener('click', function() {
            const selectedDifficulty = difficultySelect.value;
            localStorage.setItem('gameDifficulty', selectedDifficulty); // Save the selected difficulty to localStorage
            window.location.href = 'index.html'; // Redirect back to the main game page
        });

        backButton.addEventListener('click', function() {
            window.location.href = 'index.html'; // Redirect back to the main game page without saving
        });
    }

    if (settingsButton) {
        settingsButton.addEventListener('click', function() {
            window.location.href = 'settings.html'; // Redirect to settings.html
        });
    }
});
