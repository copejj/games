// src/main/resources/static/js/rummy.js
document.addEventListener('alpine:init', () => {
    Alpine.data('rummyApp', () => ({
        players: [
            { name: 'Player 1', history: [], tempScore: null },
            { name: 'Player 2', history: [], tempScore: null }
        ],
        dealerIndex: 0,

        resetScores() {
            if (confirm('Reset scores to zero?')) {
                this.players.forEach(p => { 
                    p.history = []; 
                    p.tempScore = null; 
                });
                this.dealerIndex = 0;
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
            return player.history.reduce((sum, score) => sum + score, 0);
        },

        addPlayer() {
            this.players.push({ name: '', history: [], tempScore: null });
        },

        resetGame() {
            if (confirm('Full reset? This deletes players and scores.')) {
                location.reload(); // Quick way to reset everything to default state
            }
        }
    }));
});
