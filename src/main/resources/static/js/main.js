function rummyApp() {
    return {
        // This will now automatically save/load from the browser's memory
        players: this.$persist([
            { name: 'Player 1', history: [], tempScore: null },
            { name: 'Player 2', history: [], tempScore: null }
        ]),
        
        // ... rest of your functions (addPlayer, commitScore, etc.)
    }
}

document.addEventListener('alpine:init', () => {
    Alpine.data('rummyApp', () => ({
        // Use Alpine.$persist when in an external file
        players: Alpine.$persist([
            { name: 'Player 1', history: [], tempScore: null },
            { name: 'Player 2', history: [], tempScore: null }
        ]),

        addPlayer() {
            this.players.push({ name: 'New Player', history: [], tempScore: null });
        },

        commitScore(player) {
            if (player.tempScore !== null && player.tempScore !== '') {
                player.history.push(player.tempScore);
                player.tempScore = null;
            }
        },

        calculateTotal(player) {
			const historyTotal = player.history.reduce((sum, score) => sum + (parseInt(score) || 0), 0);
			const currentEntry = parseInt(player.tempScore) || 0;
			
			return historyTotal + currentEntry;
        },

		resetGame() {
			if (confirm('Are you sure? This will wipe all scores for the current game.')) {
				// Resetting to the initial state
				this.players = [
					{ name: 'Player 1', history: [], tempScore: null },
					{ name: 'Player 2', history: [], tempScore: null }
				];
				// Alpine.$persist will automatically update localStorage with this new array
			}
		}
    }));
});
