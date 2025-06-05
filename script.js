document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('quantumPlasmaCanvas'); // Changed ID to match HTML
    const ctx = canvas.getContext('2d');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let particles = [];
    const maxParticles = 500; // Increased for more density and cleaner trails
    let isMouseMoving = false;
    let mouseMoveTimer;
    let lastPulseTime = 0;
    const pulseInterval = 1000; // Pulse every 1 second when idle
    let currentTrailPoint = { x: mouseX, y: mouseY }; // Starting point for continuous trail

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

    // Particle class for the digital lightning-like effects
    class Particle {
        constructor(x, y, color, speedMultiplier = 1) {
            this.x = x;
            this.y = y;
            this.baseSize = Math.random() * 1.5 + 0.5;
            this.size = this.baseSize;
            this.color = color;
            this.speedX = (Math.random() - 0.5) * 3 * speedMultiplier; // Faster initial burst
            this.speedY = (Math.random() - 0.5) * 3 * speedMultiplier; // Faster initial burst
            this.alpha = 1; // Start fully visible
            this.life = 0;
            this.maxLife = Math.random() * 70 + 40; // Adjusted life for smoother trails
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.alpha -= 1 / this.maxLife; // Fade out linearly
            this.size = this.baseSize * (this.alpha > 0 ? this.alpha : 0); // Size reduces with alpha
            this.life++;

            // Subtle direction change for digital "spark" feel
            if (Math.random() < 0.03) { // Small chance to change direction
                this.speedX += (Math.random() - 0.5) * 0.8;
                this.speedY += (Math.random() - 0.5) * 0.8;
            }
        }

        draw() {
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1; // Reset alpha
        }
    }

    function animateQuantumPlasma() {
        // Clear canvas with a very subtle fade out
        ctx.fillStyle = 'rgba(13, 13, 26, 0.05)'; // More transparent for clean trails, less "scribble"
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Generate color from deep purple to light blue, subtly neon
        const hueValue = (performance.now() * 0.002) % 360;
        const color = `hsl(${hueValue}, 90%, 65%)`; // Vibrant, changing color

        // Update currentTrailPoint to smoothly follow mouse
        currentTrailPoint.x += (mouseX - currentTrailPoint.x) * 0.1;
        currentTrailPoint.y += (mouseY - currentTrailPoint.y) * 0.1;

        // Draw the thick base line at the cursor tip
        ctx.strokeStyle = color;
        ctx.lineWidth = 4; // Thicker line at the head
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(currentTrailPoint.x, currentTrailPoint.y);
        ctx.lineTo(currentTrailPoint.x - (mouseX - currentTrailPoint.x) * 0.5, currentTrailPoint.y - (mouseY - currentTrailPoint.y) * 0.5); // Short segment
        ctx.stroke();

        // Emit fine lines/particles from the thick line's base spreading outwards
        for (let i = 0; i < 5; i++) { // More fine lines
            const offsetAngle = Math.random() * Math.PI * 2;
            const offsetDist = Math.random() * 10;
            const px = currentTrailPoint.x + Math.cos(offsetAngle) * offsetDist;
            const py = currentTrailPoint.y + Math.sin(offsetAngle) * offsetDist;
            particles.push(new Particle(px, py, color, isMouseMoving ? 1.8 : 0.7)); // Faster when moving
        }

        // When idle, emit particles in a pulsating spiral from the mouse position
        if (!isMouseMoving) {
            const pulseRadius = 50 + Math.sin((performance.now() - lastPulseTime) * 0.005) * 40;
            const pulseAngle = (performance.now() - lastPulseTime) * 0.008;

            const x = mouseX + Math.cos(pulseAngle) * pulseRadius;
            const y = mouseY + Math.sin(pulseAngle) * pulseRadius;
            particles.push(new Particle(x, y, color, 0.5)); // Slower particles for idle spiral
        }
        
        // Update and draw existing particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
                i--;
            }
        }

        // Limit the total number of particles
        if (particles.length > maxParticles) {
            particles.splice(0, particles.length - maxParticles);
        }

        requestAnimationFrame(animateQuantumPlasma);
    }

    animateQuantumPlasma();


    // --- Fake Mining Logic (Purely Front-end Simulation) ---
    // Moved to mining.html, but the logic functions are here for completeness if dynamic load is needed
    // In index.html, these elements are now in the 'mining' section which can be navigated to.
    const miningRateDisplay = document.getElementById('miningRate');
    const totalMinedDisplay = document.getElementById('totalMined');
    const startMiningBtn = document.getElementById('startMiningBtn');
    const walletConnectBtns = document.querySelectorAll('.wallet-btn');
    const walletStatus = document.getElementById('walletStatus');
    const referralLinkDisplay = document.getElementById('referralLink');
    const idoAmountInput = document.getElementById('idoAmount');
    const buyaUSDBtn = document.getElementById('buyaUSDBtn');
    const idoStatus = document.getElementById('idoStatus');
    const headerLogo = document.querySelector('.header-logo');
    const heroSection = document.getElementById('home');

    // Dynamically insert the aUSD logo in the hero section based on the generated image
    // Note: You'll need to create an actual image file for aUSD_logo_full.png
    const mainLogoDiv = document.createElement('div');
    mainLogoDiv.className = 'main-logo';
    heroSection.insertBefore(mainLogoDiv, heroSection.querySelector('.hero-subtitle'));


    let isMining = false;
    let minedAmount = 0;
    let currentMiningRate = 0; // aUSD per second (e.g., 0.0001 aUSD/sec)
    let userWalletConnected = false;
    let referralMultiplier = 1.0; // Base multiplier for mining rate

    const BASE_MINING_RATE_PER_SEC = 0.00005; // 0.00005 aUSD per second = ~4.32 aUSD per day
    const REFERRAL_BONUS_PER_REFERRAL = 0.00001; // Increase rate by this much per referral

    // --- Wallet Connection Simulation (Enhanced) ---
    const connectWallet = async (walletType) => {
        walletStatus.textContent = `Initiating Quantum Link with ${walletType}...`;
        walletStatus.style.color = '#00ffff';

        try {
            let provider;
            if (walletType === 'phantom' && window.phantom?.solana) {
                provider = window.phantom.solana;
            } else if (walletType === 'solflare' && window.solflare?.isSolflare) {
                provider = window.solflare;
            } else if (walletType === 'backpack' && window.backpack?.solana) {
                provider = window.backpack.solana;
            } else {
                walletStatus.textContent = `Error: ${walletType} wallet not detected. Please install it.`;
                walletStatus.style.color = '#ff0000';
                return;
            }

            // Request connection from the wallet
            const resp = await provider.connect();
            const publicKey = resp.publicKey.toString(); // Get connected public key

            userWalletConnected = true;
            walletStatus.textContent = `Quantum Link Established! Connected to ${walletType}. Address: ${publicKey.substring(0, 6)}...${publicKey.slice(-6)}`;
            walletStatus.style.color = '#00ff00';
            
            // Simulate referral link generation
            referralLinkDisplay.textContent = `https://anarchydollar.com/mine?ref=${generateFakeReferralCode()}`;
            
            // Simulate referral bonus calculation
            setTimeout(() => {
                referralMultiplier = 1.0 + (Math.random() * 5 + 1) * REFERRAL_BONUS_PER_REFERRAL; // Simulating a few referrals for bonus
                updateMiningRateDisplay();
            }, 1000);

        } catch (error) {
            walletStatus.textContent = `Quantum Link Failed: ${error.message || 'Connection denied/failed.'}`;
            walletStatus.style.color = '#ff0000';
            userWalletConnected = false;
        }
    };

    walletConnectBtns.forEach(button => {
        button.addEventListener('click', () => {
            const walletType = button.dataset.wallet;
            connectWallet(walletType);
        });
    });

    // --- Mining Simulation ---
    startMiningBtn.addEventListener('click', () => {
        if (!userWalletConnected) {
            walletStatus.textContent = "Initiate Quantum Link first to activate mining protocols!";
            walletStatus.style.color = '#ff0000';
            return;
        }
        if (!isMining) {
            isMining = true;
            startMiningBtn.textContent = "Quantum Mining Active...";
            startMiningBtn.disabled = true;
            currentMiningRate = BASE_MINING_RATE_PER_SEC * referralMultiplier;
            miningRateDisplay.textContent = `${currentMiningRate.toFixed(7)} aUSD/sec`;
            
            const miningInterval = setInterval(() => {
                const newMined = currentMiningRate * 1; // Mined per second
                minedAmount += newMined;
                totalMinedDisplay.textContent = `${minedAmount.toFixed(7)} aUSD`;

                if (!isMining) {
                    clearInterval(miningInterval);
                    startMiningBtn.textContent = "Start Mining";
                    startMiningBtn.disabled = false;
                }
            }, 1000); // Update every second
        }
    });

    // --- IDO Simulation ---
    buyaUSDBtn.addEventListener('click', () => {
        const amountUSD = parseFloat(idoAmountInput.value);
        if (isNaN(amountUSD) || amountUSD < 100 || amountUSD > 15000) {
            idoStatus.textContent = "Invalid contribution. Limits: 100-15,000 USD.";
            idoStatus.style.color = '#ff0000';
            return;
        }

        if (!userWalletConnected) {
            idoStatus.textContent = "Connect your Quantum Wallet to participate in the IDO!";
            idoStatus.style.color = '#ff0000';
            return;
        }

        idoStatus.textContent = `Initiating Quantum Acquisition for ${amountUSD.toFixed(2)} aUSD... (Transaction pending)`;
        idoStatus.style.color = '#00ffff';

        setTimeout(() => {
            const receivedaUSD = amountUSD; // 1 aUSD = 1 USD
            minedAmount += receivedaUSD; // Add to user's total for demo
            totalMinedDisplay.textContent = `${minedAmount.toFixed(7)} aUSD`;
            idoStatus.textContent = `Acquisition successful! ${receivedaUSD.toFixed(2)} aUSD secured.`;
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
        miningRateDisplay.textContent = `${currentMiningRate.toFixed(7)} aUSD/sec (Referral Nexus: x${referralMultiplier.toFixed(2)})`;
    }

    // Initial display update
    updateMiningRateDisplay();
});