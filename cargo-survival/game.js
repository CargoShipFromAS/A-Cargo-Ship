class SurvivalGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = {
            day: 1,
            disastersSurvived: 0,
            totalDisasters: 25,
            health: 100,
            sanity: 100,
            food: 100,
            water: 100,
            shipCondition: 100,
            currentDisaster: null,
            inventory: {
                medicalKits: 1,
                repairKits: 1,
                emergencyRations: 2,
                freshWater: 3
            },
            isAlive: true
        };

        this.disasters = this.generateDisasters();
        this.shipImage = this.createShipImage();
        this.stormParticles = [];
        
        this.initializeEventListeners();
        this.updateUI();
        this.gameLoop();
    }

    createShipImage() {
        const ship = document.createElement('canvas');
        ship.width = 200;
        ship.height = 80;
        const ctx = ship.getContext('2d');
        
        // Draw ship hull
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(20, 40);
        ctx.lineTo(180, 40);
        ctx.lineTo(160, 60);
        ctx.lineTo(40, 60);
        ctx.closePath();
        ctx.fill();
        
        // Draw ship deck
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(30, 20, 140, 20);
        
        // Draw ship cabin
        ctx.fillStyle = '#A52A2A';
        ctx.fillRect(100, 10, 40, 10);
        
        // Draw containers
        ctx.fillStyle = '#FF6B35';
        ctx.fillRect(40, 15, 20, 15);
        ctx.fillStyle = '#4ECDC4';
        ctx.fillRect(70, 15, 20, 15);
        ctx.fillStyle = '#45B7D1';
        ctx.fillRect(130, 15, 20, 15);
        
        return ship;
    }

    generateDisasters() {
        return [
            {
                name: "Mega Storm",
                description: "A massive storm with waves taller than the ship!",
                type: "storm",
                visual: "storm",
                effects: { health: -15, sanity: -10, shipCondition: -20 },
                duration: 3
            },
            {
                name: "Engine Fire",
                description: "Fire in the engine room! Smoke everywhere!",
                type: "fire",
                visual: "fire",
                effects: { health: -20, shipCondition: -25, sanity: -15 },
                duration: 2
            },
            {
                name: "Food Crisis",
                description: "Storm contaminated the food supplies!",
                type: "hunger",
                visual: "hunger",
                effects: { food: -40, health: -10, sanity: -10 },
                duration: 2
            },
            {
                name: "Water Shortage",
                description: "Water purification system failed!",
                type: "thirst",
                visual: "thirst",
                effects: { water: -50, health: -15, sanity: -10 },
                duration: 2
            },
            {
                name: "Pirates Attack",
                description: "Pirates are boarding the ship!",
                type: "pirates",
                visual: "pirates",
                effects: { health: -25, sanity: -20, shipCondition: -15 },
                duration: 3
            },
            {
                name: "Crew Mutiny",
                description: "The crew is losing their minds!",
                type: "mutiny",
                visual: "mutiny",
                effects: { sanity: -30, health: -10 },
                duration: 2
            },
            {
                name: "Toxic Spill",
                description: "Hazardous materials are leaking!",
                type: "toxic",
                visual: "toxic",
                effects: { health: -30, sanity: -15 },
                duration: 3
            },
            {
                name: "Navigation Failure",
                description: "All navigation systems are down!",
                type: "lost",
                visual: "lost",
                effects: { sanity: -25, food: -20, water: -20 },
                duration: 2
            }
        ];
    }

    initializeEventListeners() {
        document.getElementById('nextDisaster').addEventListener('click', () => this.triggerNextDisaster());
        document.getElementById('useMedical').addEventListener('click', () => this.useItem('medicalKits', { health: 30 }));
        document.getElementById('useRepair').addEventListener('click', () => this.useItem('repairKits', { shipCondition: 25 }));
        document.getElementById('useRations').addEventListener('click', () => this.useItem('emergencyRations', { food: 40 }));
        document.getElementById('useWater').addEventListener('click', () => this.useItem('freshWater', { water: 50 }));
    }

    triggerNextDisaster() {
        if (!this.gameState.isAlive) return;

        if (this.gameState.disastersSurvived >= this.gameState.totalDisasters) {
            this.showVictory();
            return;
        }

        // Random disaster
        const disaster = this.disasters[Math.floor(Math.random() * this.disasters.length)];
        this.gameState.currentDisaster = { ...disaster, active: true, timer: disaster.duration };
        
        // Apply disaster effects
        this.applyEffects(disaster.effects);
        
        // Show disaster message
        this.showDisasterMessage(disaster.name, disaster.description);
        
        // Update game state
        this.gameState.day++;
        this.gameState.disastersSurvived++;
        
        this.updateUI();
        this.checkGameOver();
    }

    applyEffects(effects) {
        Object.keys(effects).forEach(stat => {
            this.gameState[stat] = Math.max(0, Math.min(100, this.gameState[stat] + effects[stat]));
        });
    }

    useItem(itemType, effects) {
        if (this.gameState.inventory[itemType] > 0) {
            this.gameState.inventory[itemType]--;
            this.applyEffects(effects);
            this.updateUI();
            this.showMessage(`Used ${itemType.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        }
    }

    showDisasterMessage(title, description) {
        const messageEl = document.getElementById('disasterMessage');
        messageEl.innerHTML = `
            <h2>${title}</h2>
            <p>${description}</p>
            <div style="margin-top: 10px; font-size: 0.9em; color: #f39c12;">
                Effects applied to your ship and crew...
            </div>
        `;
        messageEl.style.display = 'block';
        
        // Add visual effects
        this.canvas.classList.add('shake');
        
        setTimeout(() => {
            messageEl.style.display = 'none';
            this.canvas.classList.remove('shake');
        }, 3000);
    }

    showMessage(text) {
        const messageEl = document.getElementById('disasterMessage');
        messageEl.innerHTML = `<p>${text}</p>`;
        messageEl.style.display = 'block';
        messageEl.style.borderColor = '#27ae60';
        
        setTimeout(() => {
            messageEl.style.display = 'none';
            messageEl.style.borderColor = '#e74c3c';
        }, 2000);
    }

    updateUI() {
        // Update stats
        document.getElementById('day').textContent = this.gameState.day;
        document.getElementById('disasters').textContent = `${this.gameState.disastersSurvived}/${this.gameState.totalDisasters}`;
        
        // Update bars
        this.updateBar('health', this.gameState.health);
        this.updateBar('sanity', this.gameState.sanity);
        this.updateBar('food', this.gameState.food);
        this.updateBar('water', this.gameState.water);
        this.updateBar('ship', this.gameState.shipCondition);
        
        // Update inventory
        document.getElementById('medicalKits').textContent = this.gameState.inventory.medicalKits;
        document.getElementById('repairKits').textContent = this.gameState.inventory.repairKits;
        document.getElementById('rations').textContent = this.gameState.inventory.emergencyRations;
        document.getElementById('freshWater').textContent = this.gameState.inventory.freshWater;
        
        // Update button states
        document.getElementById('useMedical').disabled = this.gameState.inventory.medicalKits === 0;
        document.getElementById('useRepair').disabled = this.gameState.inventory.repairKits === 0;
        document.getElementById('useRations').disabled = this.gameState.inventory.emergencyRations === 0;
        document.getElementById('useWater').disabled = this.gameState.inventory.freshWater === 0;
    }

    updateBar(stat, value) {
        const bar = document.getElementById(`${stat}Bar`);
        const text = document.getElementById(`${stat}Text`);
        bar.style.width = `${value}%`;
        text.textContent = `${value}%`;
        
        // Color coding
        if (value < 25) {
            bar.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
        } else if (value < 50) {
            bar.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
        }
    }

    checkGameOver() {
        if (this.gameState.health <= 0 || this.gameState.shipCondition <= 0) {
            this.gameState.isAlive = false;
            this.showGameOver();
        }
    }

    showGameOver() {
        const messageEl = document.getElementById('disasterMessage');
        messageEl.innerHTML = `
            <h2 style="color: #e74c3c">💀 GAME OVER 💀</h2>
            <p>You survived ${this.gameState.disastersSurvived} disasters over ${this.gameState.day} days.</p>
            <button onclick="location.reload()" class="action-btn" style="margin-top: 15px;">Play Again</button>
        `;
        messageEl.style.display = 'block';
        messageEl.style.borderColor = '#e74c3c';
    }

    showVictory() {
        const messageEl = document.getElementById('disasterMessage');
        messageEl.innerHTML = `
            <h2 style="color: #27ae60">🎉 VICTORY! 🎉</h2>
            <p>You survived all 25 disasters and reached safe waters!</p>
            <p>Final Score: ${this.gameState.health + this.gameState.sanity + this.gameState.shipCondition}</p>
            <button onclick="location.reload()" class="action-btn success" style="margin-top: 15px;">Play Again</button>
        `;
        messageEl.style.display = 'block';
        messageEl.style.borderColor = '#27ae60';
    }

    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw ocean
        this.drawOcean();
        
        // Draw ship
        this.drawShip();
        
        // Draw current disaster effects
        if (this.gameState.currentDisaster?.active) {
            this.drawDisasterEffects(this.gameState.currentDisaster.visual);
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }

    drawOcean() {
        // Gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a2980');
        gradient.addColorStop(1, '#26d0ce');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Waves
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, 400 + i * 10);
            for (let x = 0; x < this.canvas.width; x += 20) {
                this.ctx.lineTo(x, 400 + i * 10 + Math.sin((x + Date.now() * 0.001) * 0.1) * 5);
            }
            this.ctx.stroke();
        }
    }

    drawShip() {
        const shipX = this.canvas.width / 2 - 100;
        const shipY = this.canvas.height / 2 - 40;
        
        // Draw ship with condition effects
        const alpha = 0.5 + (this.gameState.shipCondition / 100) * 0.5;
        this.ctx.globalAlpha = alpha;
        this.ctx.drawImage(this.shipImage, shipX, shipY);
        this.ctx.globalAlpha = 1.0;
        
        // Draw damage effects if ship is damaged
        if (this.gameState.shipCondition < 50) {
            this.ctx.fillStyle = 'rgba(231, 76, 60, 0.3)';
            this.ctx.fillRect(shipX, shipY, 200 * (this.gameState.shipCondition / 100), 80);
        }
    }

    drawDisasterEffects(type) {
        switch (type) {
            case 'storm':
                this.drawStorm();
                break;
            case 'fire':
                this.drawFire();
                break;
            case 'pirates':
                this.drawPirates();
                break;
            case 'toxic':
                this.drawToxic();
                break;
        }
    }

    drawStorm() {
        // Rain
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.canvas.width;
            const y = (Date.now() * 0.1 + i * 10) % this.canvas.height;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + 2, y + 10);
            this.ctx.stroke();
        }
        
        // Lightning flashes
        if (Math.random() < 0.02) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    drawFire() {
        // Fire and smoke
        for (let i = 0; i < 20; i++) {
            const x = 400 + Math.random() * 100;
            const y = 200 + Math.random() * 50;
            
            // Smoke
            this.ctx.fillStyle = `rgba(100, 100, 100, ${Math.random() * 0.5})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, Math.random() * 20 + 5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Fire
            this.ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, ${Math.random() * 0.7})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y + 10, Math.random() * 15 + 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawPirates() {
        // Pirate ship in distance
        this.ctx.fillStyle = '#8B0000';
        this.ctx.fillRect(50, 100, 120, 40);
        this.ctx.fillRect(80, 80, 60, 20);
        
        // Jolly Roger flag
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(140, 60, 2, 40);
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(142, 60, 30, 30);
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(157, 70, 8, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawToxic() {
        // Toxic green fog
        this.ctx.fillStyle = 'rgba(50, 200, 50, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Toxic bubbles
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.ctx.fillStyle = `rgba(50, 200, 50, ${Math.random() * 0.5})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, Math.random() * 15 + 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new SurvivalGame();
});
