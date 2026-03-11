document.addEventListener('alpine:init', () => {
    Alpine.data('rummyApp', () => ({
        // 1. Load from localStorage or use defaults
        players: JSON.parse(localStorage.getItem('rummy_players')) || [
            { name: 'Player 1', history: [], tempScore: null },
            { name: 'Player 2', history: [], tempScore: null }
        ],
        dealerIndex: parseInt(localStorage.getItem('rummy_dealer')) || 0,

        init() {
            // 2. Set up a watcher to save to local memory whenever players change
            this.$watch('players', (val) => {
                localStorage.setItem('rummy_players', JSON.stringify(val));
            });
            this.$watch('dealerIndex', (val) => {
                localStorage.setItem('rummy_dealer', val);
            });
        },

        resetScores() {
            if (confirm('Reset scores to zero?')) {
                this.players.forEach(p => { 
                    p.history = []; 
                    p.tempScore = null; 
                });
                this.dealerIndex = 0;
                // No need to manual save; the watcher handles it!
            }
        },

        saveRound() {
            const missing = this.players.filter(p => p.tempScore === null || p.tempScore === '');
            if (missing.length > 0) {
                alert("Please enter a score for everyone!");
                return;
            }
            this.players.forEach(p => {
                p.history.push(parseInt(p.tempScore));
                p.tempScore = null;
            });
            this.dealerIndex = (this.dealerIndex + 1) % this.players.length;
        },

        calculateTotal(player) {
            return player.history.reduce((sum, score) => sum + (parseInt(score) || 0), 0);
        },

        addPlayer() {
            this.players.push({ name: 'New Player', history: [], tempScore: null });
        },

        resetGame() {
            if (confirm('Full reset? This deletes players and scores.')) {
                localStorage.clear(); // Clear the memory
                location.reload();
            }
        },

        undoLastRound() {
            // Check if there is even a round to undo
            const hasHistory = this.players.some(p => p.history.length > 0);
            
            if (hasHistory && confirm('Undo the last round for everyone?')) {
                this.players.forEach(p => {
                    p.history.pop(); // Remove the last score
                });
                
                // Move dealer back one (looping to the end if at 0)
                this.dealerIndex = (this.dealerIndex - 1 + this.players.length) % this.players.length;
            }
        },
    }));
});
