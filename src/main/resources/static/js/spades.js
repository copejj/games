document.addEventListener('alpine:init', () => {
    Alpine.data('spadesApp', () => ({
        teams: JSON.parse(localStorage.getItem('spades_teams')) || [
            { 
                name: 'Team 1', 
                p1_name: 'Player 1', 
                p2_name: 'Player 2', 
                history: [], bagHistory: [], p1_bid: '', p1_tricks: '', p2_bid: '', p2_tricks: '', team_bid: '', team_tricks: '' 
            },
            { 
                name: 'Team 2', 
                p1_name: 'Player 3', 
                p2_name: 'Player 4', 
                history: [], bagHistory: [], p1_bid: '', p1_tricks: '', p2_bid: '', p2_tricks: '', team_bid: '', team_tricks: '' 
            }
        ],
        settings: JSON.parse(localStorage.getItem('spades_settings')) || { minBidFour: true, bagsPenalty: true, nilAllowed: true },
        dealerIndex: parseInt(localStorage.getItem('spades_dealer')) || 0,
        maxScore: parseInt(localStorage.getItem('spades_maxScore')) || 500,
        showSettings: false,
        winner: null,

        init() {
            this.$watch('teams', val => localStorage.setItem('spades_teams', JSON.stringify(val)));
            this.$watch('settings', val => localStorage.setItem('spades_settings', JSON.stringify(val)));
            this.$watch('dealerIndex', val => localStorage.setItem('spades_dealer', val));
            this.$watch('maxScore', val => localStorage.setItem('spades_maxScore', val));
        },

        saveRound() {
            let totalMatchTricks = 0;
            let roundResults = [];

            for (let i = 0; i < this.teams.length; i++) {
                const team = this.teams[i];
                if (this.settings.nilAllowed) {
                    let p1T = parseInt(team.p1_tricks);
                    let p2T = parseInt(team.p2_tricks);
                    if (isNaN(p1T) || isNaN(p2T)) { return alert(`Please fill out all trick inputs for ${team.name}`); }
                    totalMatchTricks += (p1T + p2T);
                } else {
                    let tTricks = parseInt(team.team_tricks);
                    if (isNaN(tTricks)) { return alert(`Please fill out trick inputs for ${team.name}`); }
                    totalMatchTricks += tTricks;
                }
            }

            if (totalMatchTricks !== 13) {
                return alert(`Mathematical Conflict: Combined tricks captured across both teams equals ${totalMatchTricks}. It must equal exactly 13.`);
            }

            for (let i = 0; i < this.teams.length; i++) {
                let res = this.calculateTeamRound(this.teams[i]);
                if (res === null) return; 
                roundResults.push(res);
            }

            this.teams = this.teams.map((t, idx) => {
                const res = roundResults[idx];
                return {
                    ...t,
                    history: [...t.history, res.roundScore],
                    bagHistory: [...t.bagHistory, res.roundBags],
                    p1_bid: '', p1_tricks: '', p2_bid: '', p2_tricks: '', team_bid: '', team_tricks: ''
                };
            });

            this.dealerIndex = (this.dealerIndex + 1) % this.teams.length;
            if (this.teams.some(t => this.calculateTotalScore(t) >= this.maxScore)) { this.determineWinner(); }
        },

        calculateTeamRound(team) {
            let roundScore = 0;
            let roundBags = 0;

            if (this.settings.nilAllowed) {
                let p1B = (team.p1_bid === '0' || team.p1_bid === 0) ? 0 : parseInt(team.p1_bid);
                let p2B = (team.p2_bid === '0' || team.p2_bid === 0) ? 0 : parseInt(team.p2_bid);
                let p1T = parseInt(team.p1_tricks);
                let p2T = parseInt(team.p2_tricks);

                if (isNaN(p1B) || isNaN(p1T) || isNaN(p2B) || isNaN(p2T)) {
                    alert(`Please fill out all inputs for ${team.name}`);
                    return null;
                }

                if (this.settings.minBidFour) {
                    if ((p1B === 0 && p2B < 4 && p2B !== 0) || (p2B === 0 && p1B < 4 && p1B !== 0)) {
                        alert(`Validation Error on ${team.name}: If a player bids NIL, their partner must bid 4 or higher.`);
                        return null;
                    }
                    if (p1B === 0 && p2B === 0) {
                        alert(`Validation Error on ${team.name}: Partners cannot both bid NIL.`);
                        return null;
                    }
                    if (p1B > 0 && p2B > 0 && (p1B + p2B < 4)) {
                        alert(`Validation Error on ${team.name}: Combined team bid must equal 4 or more.`);
                        return null;
                    }
                }

                if (p1B === 0 && p2B > 0) {
                    roundScore += (p1T === 0) ? 100 : -100;
                    let totalTeamTricks = p1T + p2T;
                    if (totalTeamTricks >= p2B) {
                        roundScore += p2B * 10;
                        if (this.settings.bagsPenalty) { roundScore += (totalTeamTricks - p2B); roundBags += (totalTeamTricks - p2B); }
                    } else { roundScore -= p2B * 10; }
                }
                else if (p2B === 0 && p1B > 0) {
                    roundScore += (p2T === 0) ? 100 : -100;
                    let totalTeamTricks = p1T + p2T;
                    if (totalTeamTricks >= p1B) {
                        roundScore += p1B * 10;
                        if (this.settings.bagsPenalty) { roundScore += (totalTeamTricks - p1B); roundBags += (totalTeamTricks - p1B); }
                    } else { roundScore -= p1B * 10; }
                }
                else {
                    let combinedBid = p1B + p2B;
                    let combinedTricks = p1T + p2T;
                    if (combinedTricks >= combinedBid) {
                        roundScore += combinedBid * 10;
                        if (this.settings.bagsPenalty) { roundScore += (combinedTricks - combinedBid); roundBags += (combinedTricks - combinedBid); }
                    } else { roundScore -= combinedBid * 10; }
                }
            } else {
                let tBid = parseInt(team.team_bid);
                let tTricks = parseInt(team.team_tricks);

                if (isNaN(tBid) || isNaN(tTricks)) { alert(`Please fill out all inputs for ${team.name}`); return null; }
                if (this.settings.minBidFour && tBid < 4) { alert(`Validation Error on ${team.name}: Total team bid must equal 4 or more.`); return null; }

                if (tTricks >= tBid) {
                    roundScore += tBid * 10;
                    if (this.settings.bagsPenalty) { roundScore += (tTricks - tBid); roundBags += (tTricks - tBid); }
                } else { roundScore -= tBid * 10; }
            }
            return { roundScore, roundBags };
        },

        calculateTotalScore(team) {
            if (!team) return 0;
            let rawPoints = team.history.reduce((sum, score) => sum + (parseInt(score) || 0), 0);
            if (!this.settings.bagsPenalty) return rawPoints;

            let netBags = team.bagHistory.reduce((sum, bags) => sum + (parseInt(bags) || 0), 0);
            let penaltiesCount = Math.floor(netBags / 10);
            return rawPoints - (penaltiesCount * 100);
        },

        calculateCurrentBags(team) {
            if (!team || !this.settings.bagsPenalty) return 0;
            let totalBagsEver = team.bagHistory.reduce((sum, bags) => sum + (parseInt(bags) || 0), 0);
            return totalBagsEver % 10;
        },

        determineWinner() {
            this.winner = this.teams.reduce((prev, current) => 
                (this.calculateTotalScore(prev) > this.calculateTotalScore(current)) ? prev : current
            );
        },

        resetGame() {
            if (confirm('Full reset? This deletes all Spades teams, settings, and scores.')) {
                localStorage.clear();
                location.reload();
            }
        },

        resetScores() {
            if (confirm('Reset scores to zero?')) {
                this.teams.forEach(t => {
                    t.history = []; t.bagHistory = [];
                    t.p1_bid = ''; t.p1_tricks = '';
                    t.p2_bid = ''; t.p2_tricks = '';
                    t.team_bid = ''; t.team_tricks = '';
                });
                this.dealerIndex = 0;
                this.winner = null;
            }
        },

        resetLastRound() {
            const hasHistory = this.teams.some(t => t.history.length > 0);
            if (hasHistory && confirm('Reset the last round?')) {
                this.teams.forEach(t => {
                    t.history.pop();
                    t.bagHistory.pop();
                });
                this.dealerIndex = (this.dealerIndex - 1 + this.teams.length) % this.teams.length;
                this.winner = null;
            }
        }
    }));
});
