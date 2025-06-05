document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('plasmaCanvas');
    const ctx = canvas.getContext('2d');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let particles = [];
    const maxParticles = 400; // Adjusted for performance and density
    let isMouseMoving = false;
    let mouseMoveTimer;
    let lastPulseTime = 0;
    const pulseInterval = 1000; // Pulse every 1 second when idle

    // Set canvas size on load and resize
    const setCanvasSize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    setCanvasSize(); // Initial set
    window.addEventListener('resize', setCanvasSize);

    // Mouse movement listener
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMouseMoving = true;
        clearTimeout(mouseMoveTimer);
        mouseMoveTimer = setTimeout(() => {
            isMouseMoving = false;
            lastPulseTime = performance.now(); // Reset pulse timer when mouse stops
        }, 150); // Consider mouse stopped if no movement for 150ms
    });

    // Particle class for the lightning-like effects
    class Particle {
        constructor(x, y, color, speedMultiplier = 1, trailLength = 10) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 1.5 + 0.5;
            this.color = color;
            this.speedX = (Math.random() - 0.5) * 2 * speedMultiplier;
            this.speedY = (Math.random() - 0.5) * 2 * speedMultiplier;
            this.alpha = 1;
            this.life = 0;
            this.maxLife = Math.random() * 80 + 50; // Longer life for smoother trails
            this.history = [{ x: this.x, y: this.y }]; // To draw trails
            this.trailLength = trailLength;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.alpha -= 1 / this.maxLife;
            this.size = this.baseSize * (this.alpha > 0 ? this.alpha : 0);
            this.life++;

            // Add current position to history
            this.history.push({ x: this.x, y: this.y });
            if (this.history.length > this.trailLength) {
                this.history.shift(); // Remove oldest point
            }

            // Random subtle direction change (lightning feel)
            if (Math.random() < 0.02) { // Lower chance to change direction
                this.speedX += (Math.random() - 0.5) * 0.5;
                this.speedY += (Math.random() - 0.5) * 0.5;
            }
        }

        draw() {
            ctx.globalAlpha = this.alpha;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.size / 2; // Line width based on particle size for tapering

            if (this.history.length > 1) {
                ctx.beginPath();
                ctx.moveTo(this.history[0].x, this.history[0].y);
                for (let i = 1; i < this.history.length; i++) {
                    ctx.lineTo(this.history[i].x, this.history[i].y);
                }
                ctx.stroke();
            }
            ctx.globalAlpha = 1; // Reset alpha
        }
    }

    let lastPoint = { x: mouseX, y: mouseY }; // Track the last point for line drawing

    function animatePlasma() {
        // Clear canvas with a very subtle fade out
        ctx.fillStyle = 'rgba(13, 13, 26, 0.08)'; // More transparent for clean trails
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let currentX = mouseX;
        let currentY = mouseY;

        // Generate color from deep purple to light blue, subtly neon
        const timeFactor = performance.now() * 0.0005;
        const baseHue = 270; // Purple base
        const range = 120; // Towards blue (270 + 120 = 390 = 30 deg hue)
        const hue = (baseHue + Math.sin(timeFactor) * range) % 360;
        const color = `hsl(${hue}, 85%, 70%)`; // Higher saturation, brighter for neon

        // Create new particles along the path
        if (isMouseMoving) {
            const distance = Math.hypot(currentX - lastPoint.x, currentY - lastPoint.y);
            const particleDensity = Math.max(1, Math.floor(distance / 10)); // Adjust density based on movement speed
            for (let i = 0; i < particleDensity; i++) {
                const ratio = i / particleDensity;
                const px = lastPoint.x + (currentX - lastPoint.x) * ratio;
                const py = lastPoint.y + (currentY - lastPoint.y) * ratio;
                particles.push(new Particle(px, py, color, 1.5, 15)); // Faster, longer trails when moving
            }
        } else {
            // When idle, emit particles in a pulsating spiral from the mouse position
            const pulseRadius = 50 + Math.sin((performance.now() - lastPulseTime) * 0.005) * 40; // Pulsating size
            const pulseAngle = (performance.now() - lastPulseTime) * 0.008;

            const x = mouseX + Math.cos(pulseAngle) * pulseRadius;
            const y = mouseY + Math.sin(pulseAngle) * pulseRadius;
            particles.push(new Particle(x, y, color, 0.5, 20)); // Slower, longer trails when idle
        }
        
        // Update and draw existing particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].alpha <= 0) { // Remove fully faded particles
                particles.splice(i, 1);
                i--;
            }
        }

        // Limit the total number of particles
        if (particles.length > maxParticles) {
            particles.splice(0, particles.length - maxParticles);
        }

        lastPoint = { x: currentX, y: currentY }; // Update last point

        requestAnimationFrame(animatePlasma);
    }

    animatePlasma();


    // --- Fake Mining Logic (Purely Front-end Simulation) ---
    const miningRateDisplay = document.getElementById('miningRate');
    const totalMinedDisplay = document.getElementById('totalMined');
    const pendingPayoutDisplay = document.getElementById('pendingPayout');
    const startMiningBtn = document.getElementById('startMiningBtn');
    const claimMiningBtn = document.getElementById('claimMiningBtn');
    const walletConnectBtns = document.querySelectorAll('.wallet-btn');
    const walletStatus = document.getElementById('walletStatus');
    const referralLinkDisplay = document.getElementById('referralLink');
    const idoAmountInput = document.getElementById('idoAmount');
    const buyaUSDBtn = document.getElementById('buyaUSDBtn');
    const idoStatus = document.getElementById('idoStatus');

    let isMining = false;
    let minedAmount = 0;
    let currentMiningRate = 0; // aUSD per second (e.g., 0.0001 aUSD/sec)
    let pendingClaim = 0;
    let userWalletConnected = false;
    let referralMultiplier = 1.0; // Base multiplier for mining rate

    const BASE_MINING_RATE_PER_SEC = 0.00005; // 0.00005 aUSD per second = ~4.32 aUSD per day
    const REFERRAL_BONUS_PER_REFERRAL = 0.00001; // Increase rate by this much per referral
    const MIN_REFERRALS_FOR_BONUS = 5; // Example: need at least 5 referrals for bonus

    // --- Wallet Connection Simulation ---
    walletConnectBtns.forEach(button => {
        button.addEventListener('click', () => {
            const walletType = button.dataset.wallet;
            walletStatus.textContent = `Connecting to ${walletType} wallet...`;
            // Simulate async connection
            setTimeout(() => {
                userWalletConnected = true;
                walletStatus.textContent = `Connected to ${walletType} wallet. Address: ${generateFakeSolanaAddress()}`;
                referralLinkDisplay.textContent = `https://anarchydollar.com/mine?ref=${generateFakeReferralCode()}`;
                claimMiningBtn.disabled = false; // Enable claim button after connection
                // Simulate a few referrals for bonus
                setTimeout(() => {
                    referralMultiplier += (Math.random() * 10 + MIN_REFERRALS_FOR_BONUS) * REFERRAL_BONUS_PER_REFERRAL; // Simulating referrals
                    updateMiningRateDisplay();
                }, 2000);

            }, 2000);
        });
    });

    // --- Mining Simulation ---
    startMiningBtn.addEventListener('click', () => {
        if (!userWalletConnected) {
            walletStatus.textContent = "Please connect your wallet first!";
            return;
        }
        if (!isMining) {
            isMining = true;
            startMiningBtn.textContent = "Mining...";
            startMiningBtn.disabled = true;
            claimMiningBtn.disabled = false;
            currentMiningRate = BASE_MINING_RATE_PER_SEC * referralMultiplier;
            miningRateDisplay.textContent = `${currentMiningRate.toFixed(7)} aUSD/sec`;
            
            // Start interval for mining rewards
            const miningInterval = setInterval(() => {
                const newMined = currentMiningRate * 1; // Mined per second
                minedAmount += newMined;
                pendingClaim += newMined;

                totalMinedDisplay.textContent = `${minedAmount.toFixed(7)} aUSD`;
                pendingPayoutDisplay.textContent = `${pendingClaim.toFixed(7)} aUSD`;

                // Stop mining after a while for demonstration or if tab is inactive
                if (!isMining) {
                    clearInterval(miningInterval);
                    startMiningBtn.textContent = "Start Mining";
                    startMiningBtn.disabled = false;
                }
            }, 1000); // Update every second
        }
    });

    claimMiningBtn.addEventListener('click', () => {
        if (pendingClaim > 0) {
            // Simulate blockchain transaction for claiming
            walletStatus.textContent = `Claiming ${pendingClaim.toFixed(7)} aUSD... (Transaction pending)`;
            setTimeout(() => {
                minedAmount += pendingClaim; // Add to total if not already counted
                pendingClaim = 0;
                totalMinedDisplay.textContent = `${minedAmount.toFixed(7)} aUSD`;
                pendingPayoutDisplay.textContent = `${pendingClaim.toFixed(7)} aUSD`;
                walletStatus.textContent = "Claim successful! aUSD added to your wallet.";
                // In a real scenario, this would send to the connected wallet
            }, 3000);
        }
    });

    // --- IDO Simulation ---
    buyaUSDBtn.addEventListener('click', () => {
        const amountUSD = parseFloat(idoAmountInput.value);
        if (isNaN(amountUSD) || amountUSD < 100 || amountUSD > 15000) {
            idoStatus.textContent = "Please enter a valid amount between 100 and 15,000 USD.";
            idoStatus.style.color = '#ff0000';
            return;
        }

        if (!userWalletConnected) {
            idoStatus.textContent = "Please connect your wallet first to participate in IDO!";
            idoStatus.style.color = '#ff0000';
            return;
        }

        idoStatus.textContent = `Processing purchase of ${amountUSD.toFixed(2)} aUSD... (Transaction pending)`;
        idoStatus.style.color = '#00ffff';

        setTimeout(() => {
            // Simulate successful purchase and transfer to wallet
            const receivedaUSD = amountUSD; // 1 aUSD = 1 USD
            minedAmount += receivedaUSD; // Add to user's total for demo
            totalMinedDisplay.textContent = `${minedAmount.toFixed(7)} aUSD`;
            idoStatus.textContent = `Purchase successful! ${receivedaUSD.toFixed(2)} aUSD sent to your wallet.`;
            idoStatus.style.color = '#00ff00';
            idoAmountInput.value = '';
        }, 4000);
    });


    function generateFakeSolanaAddress() {
        const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let address = '';
        for (let i = 0; i < 44; i++) {
            address += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return address;
    }

    function generateFakeReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    function updateMiningRateDisplay() {
        currentMiningRate = BASE_MINING_RATE_PER_SEC * referralMultiplier;
        miningRateDisplay.textContent = `${currentMiningRate.toFixed(7)} aUSD/sec (Ref. Bonus: x${referralMultiplier.toFixed(2)})`;
    }

    // Initial display update
    updateMiningRateDisplay();
});