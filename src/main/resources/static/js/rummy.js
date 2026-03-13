document.addEventListener('alpine:init', () => {
    Alpine.data('rummyApp', () => ({
        // 1. Load from localStorage or use defaults
        players: JSON.parse(localStorage.getItem('rummy_players')) || [
            { name: 'Player 1', history: [], tempScore: null },
            { name: 'Player 2', history: [], tempScore: null }
        ],
        dealerIndex: parseInt(localStorage.getItem('rummy_dealer')) || 0,
        maxScore: parseInt(localStorage.getItem('rummy_maxScore')) || 500,
        showSettings: false,
        winner: null,

        init() {
            // Watchers for persistence
            this.$watch('players', (val) => localStorage.setItem('rummy_players', JSON.stringify(val)));
            this.$watch('dealerIndex', (val) => localStorage.setItem('rummy_dealer', val));
            this.$watch('maxScore', (val) => localStorage.setItem('rummy_maxScore', val));
        },

        saveRound() {
            const missing = this.players.filter(p => p.tempScore === null || p.tempScore === '');
            if (missing.length > 0) return alert("Please enter a score for everyone!");

            // Update scores
            this.players = this.players.map(p => ({
                ...p,
                history: [...p.history, parseInt(p.tempScore)],
                tempScore: null
            }));

            this.dealerIndex = (this.dealerIndex + 1) % this.players.length;

            // Check if anyone hit the limit
            // In Rummy 500, the first person to hit 500 triggers the end, 
            // but the person with the HIGHEST total wins.
            const thresholdReached = this.players.some(p => this.calculateTotal(p) >= this.maxScore);
            
            if (thresholdReached) {
                this.determineWinner();
            }
        },

        determineWinner() {
            // Finds the player with the highest total score
            this.winner = this.players.reduce((prev, current) => 
                (this.calculateTotal(prev) > this.calculateTotal(current)) ? prev : current
            );
        },

        calculateTotal(player) {
            // If player is null or undefined, just return 0
            if (!player) return 0; 
            return player.history.reduce((sum, score) => sum + (parseInt(score) || 0), 0);
        },

        resetGame() {
            if (confirm('Full reset? This deletes players and scores.')) {
                localStorage.clear();
                location.reload();
            }
        },

        resetScores() {
            if (confirm('Reset scores to zero?')) {
                this.players.forEach(p => { p.history = []; p.tempScore = null; });
                this.dealerIndex = 0;
                this.winner = null;
            }
        },

        resetLastRound() {
            const hasHistory = this.players.some(p => p.history.length > 0);
            if (hasHistory && confirm('Reset the last round?')) {
                this.players.forEach(p => p.history.pop());
                this.dealerIndex = (this.dealerIndex - 1 + this.players.length) % this.players.length;
                this.winner = null;
            }
        },

        addPlayer() {
            const nextNumber = this.players.length + 1;
            this.players.push({ name: `Player ${nextNumber}`, history: [], tempScore: null });
        }
    }));
});
