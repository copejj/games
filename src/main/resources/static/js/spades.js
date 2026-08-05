document.addEventListener('alpine:init', () => {
    Alpine.data('spadesApp', () => ({
        // 1. Enhanced initialization with real-time error field indicators
        teams: JSON.parse(localStorage.getItem('spades_teams')) || [
            { name: 'Team 1', p1_name: 'Player 1', p2_name: 'Player 2', history: [], bagHistory: [], p1_bid: '', p1_tricks: '', p2_bid: '', p2_tricks: '', team_bid: '', team_tricks: '', errorMessage: '' },
            { name: 'Team 2', p1_name: 'Player 3', p2_name: 'Player 4', history: [], bagHistory: [], p1_bid: '', p1_tricks: '', p2_bid: '', p2_tricks: '', team_bid: '', team_tricks: '', errorMessage: '' }
        ],
        settings: JSON.parse(localStorage.getItem('spades_settings')) || { minBidFour: true, bagsPenalty: true, nilAllowed: true },
        dealerPosition: localStorage.getItem('spades_dealer') || '0_1',
        maxScore: parseInt(localStorage.getItem('spades_maxScore')) || 500,
        showSettings: false,
        winner: null,

        init() {
            this.$watch('teams', val => localStorage.setItem('spades_teams', JSON.stringify(val)));
            this.$watch('settings', val => localStorage.setItem('spades_settings', JSON.stringify(val)));
            this.$watch('dealerPosition', val => localStorage.setItem('spades_dealer', val));
            this.$watch('maxScore', val => localStorage.setItem('spades_maxScore', val));
        },

        isDealer(teamIdx, playerNum) {
            return this.dealerPosition === `${teamIdx}_${playerNum}`;
        },
        rotateDealer() {
            // Rotation path: Team 0 P1 -> Team 1 P1 -> Team 0 P2 -> Team 1 P2 -> Repeat
            const mapping = { '0_1': '1_1', '1_1': '0_2', '0_2': '1_2', '1_2': '0_1' };
            this.dealerPosition = mapping[this.dealerPosition] || '0_1';
        },

        // 2. Real-time dynamic change validation pipeline
        validateBids(team) {
            // Reset message placeholder
            team.errorMessage = '';
            if (!this.settings.minBidFour) return;

            if (this.settings.nilAllowed) {
                // If either input is completely blank, both players haven't input a bid yet
                if (team.p1_bid === '' || team.p2_bid === '') return;

                let p1B = parseInt(team.p1_bid, 10);
                let p2B = parseInt(team.p2_bid, 10);

                if (isNaN(p1B) || isNaN(p2B)) return;

                // Simultaneous Nil Block
                if (p1B === 0 && p2B === 0) {
                    team.errorMessage = "Partners cannot both bid NIL.";
                    return;
                }
                // Nil Rule + Under-4 Partner Block
                if ((p1B === 0 && p2B < 4) || (p2B === 0 && p1B < 4)) {
                    team.errorMessage = "If a partner bids NIL, the other must bid 4 or higher.";
                    return;
                }
                // Standard combined under-4 contract block
                if (p1B > 0 && p2B > 0 && (p1B + p2B < 4)) {
                    team.errorMessage = `Combined team bid must equal 4 or more. Currently: ${p1B + p2B}.`;
                    return;
                }
            } else {
                // Evaluation route for "No Nil Mode"
                if (team.team_bid === '') return;
                let tBid = parseInt(team.team_bid, 10);
                if (!isNaN(tBid) && tBid < 4) {
                    team.errorMessage = "Total team bid must equal 4 or more.";
                }
            }
        },

        saveRound() {
            let totalMatchTricks = 0;
            let roundResults = [];

            // Block saving if any team currently displays an error message configuration
            for (let i = 0; i < this.teams.length; i++) {
                this.validateBids(this.teams[i]); // Force validation catch check
                if (this.teams[i].errorMessage) {
                    return alert(`Please correct the bidding errors on ${this.teams[i].name} before applying scores.`);
                }

                // Track total trick inputs matching standard Spades properties
                const team = this.teams[i];
                if (this.settings.nilAllowed) {
                    let p1T = parseInt(team.p1_tricks, 10);
                    let p2T = parseInt(team.p2_tricks, 10);
                    if (isNaN(p1T) || isNaN(p2T)) return alert(`Please fill out all trick inputs for ${team.name}`);
                    totalMatchTricks += (p1T + p2T);
                } else {
                    let tTricks = parseInt(team.team_tricks, 10);
                    if (isNaN(tTricks)) return alert(`Please fill out trick inputs for ${team.name}`);
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
                    p1_bid: '', p1_tricks: '', p2_bid: '', p2_tricks: '', team_bid: '', team_tricks: '',
                    errorMessage: '' // Flush out error tags cleanly
                };
            });

            this.rotateDealer();
            if (this.teams.some(t => this.calculateTotalScore(t) >= this.maxScore)) {
                this.determineWinner();
            }
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

                // [Validation logic for minBidFour omitted for length - keep yours as is]

                // Case A: Player 1 is Nil
                if (p1B === 0 && p2B > 0) {
                    roundScore += (p1T === 0) ? 100 : -100;
                    // Partner's contract is evaluated completely independently
                    if (p2T >= p2B) {
                        roundScore += p2B * 10;
                        if (this.settings.bagsPenalty) {
                            roundBags += (p2T - p2B); // Only partner's overtricks count as bags!
                        }
                    } else {
                        roundScore -= p2B * 10;
                    }
                }
                // Case B: Player 2 is Nil
                else if (p2B === 0 && p1B > 0) {
                    roundScore += (p2T === 0) ? 100 : -100;
                    if (p1T >= p1B) {
                        roundScore += p1B * 10;
                        if (this.settings.bagsPenalty) {
                            roundBags += (p1T - p1B); // Only partner's overtricks count as bags!
                        }
                    } else {
                        roundScore -= p1B * 10;
                    }
                }
                // Case C: Normal Bids
                else {
                    let combinedBid = p1B + p2B;
                    let combinedTricks = p1T + p2T;
                    if (combinedTricks >= combinedBid) {
                        roundScore += combinedBid * 10;
                        if (this.settings.bagsPenalty) {
                            roundBags += (combinedTricks - combinedBid); // Keep points clean of bag counts
                        }
                    } else {
                        roundScore -= combinedBid * 10;
                    }
                }
            } else {
                // No Nil Mode Evaluation
                let tBid = parseInt(team.team_bid);
                let tTricks = parseInt(team.team_tricks);

                if (isNaN(tBid) || isNaN(tTricks)) {
                    alert(`Please fill out all inputs for ${team.name}`);
                    return null;
                }

                if (tTricks >= tBid) {
                    roundScore += tBid * 10;
                    if (this.settings.bagsPenalty) {
                        roundBags += (tTricks - tBid);
                    }
                } else {
                    roundScore -= tBid * 10;
                }
            }

            return { roundScore, roundBags };
        },

        calculateTotalScore(team) {
            if (!team) return 0;
            let rawPoints = team.history.reduce((sum, score) => sum + (parseInt(score) || 0), 0);
            if (!this.settings.bagsPenalty) return rawPoints;

            let netBags = team.bagHistory.reduce((sum, bags) => sum + (parseInt(bags) || 0), 0);
            let penaltiesCount = Math.floor(netBags / 10);

            // Add the single bag points here so they are cleanly coupled with the penalty logic
            return rawPoints + netBags - (penaltiesCount * 110);
            // (+1 point per bag minus 110 points when rolling over gives a clean, true -100 point penalty drop)
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
            this.dealerPosition = '0_1'; // Reset dealer to Team 0 Player 1
        },

        resetLastRound() {
            const hasHistory = this.teams.some(t => t.history.length > 0);
            if (hasHistory && confirm('Reset the last round?')) {
                this.teams.forEach(t => {
                    t.history.pop();
                    t.bagHistory.pop();
                });
                const reverseMapping = { '1_1': '0_1', '0_2': '1_1', '1_2': '0_2', '0_1': '1_2' };
                this.dealerPosition = reverseMapping[this.dealerPosition] || '0_1';
                this.winner = null;
            }
        }
    }));
});
