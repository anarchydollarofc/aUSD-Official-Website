import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('quantumPlasmaCanvas'); // Changed ID to match HTML
    const ctx = canvas.getContext('2d');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let particles = [];
    const maxParticles = 600; // Increased for more density and smoother trails
    let isMouseMoving = false;
    let mouseMoveTimer;
    let lastPulseTime = 0;
    const pulseInterval = 1500; // Pulse every 1.5 seconds when idle
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
            this.speedX = (Math.random() - 0.5) * 4 * speedMultiplier; // Faster initial burst
            this.speedY = (Math.random() - 0.5) * 4 * speedMultiplier; // Faster initial burst
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
            if (Math.random() < 0.05) { // Small chance to change direction
                this.speedX += (Math.random() - 0.5) * 1;
                this.speedY += (Math.random() - 0.5) * 1;
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
        ctx.fillStyle = 'rgba(13, 13, 26, 0.03)'; // Even more transparent for cleaner trails, almost no "scribble"
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Generate color from deep purple to light blue, subtly neon
        const timeFactor = performance.now() * 0.0005;
        const baseHue = 270; // Purple base
        const range = 120; // Towards blue (270 + 120 = 390 = 30 deg hue)
        const hue = (baseHue + Math.sin(timeFactor) * range) % 360;
        const color = `hsl(${hue}, 90%, 65%)`; // Vibrant, changing color

        // Update currentTrailPoint to smoothly follow mouse
        currentTrailPoint.x += (mouseX - currentTrailPoint.x) * 0.2; // Faster follow, smoother
        currentTrailPoint.y += (mouseY - currentTrailPoint.y) * 0.2;

        // Draw the thick base line at the cursor tip
        ctx.strokeStyle = color;
        ctx.lineWidth = 6; // Thicker line at the head for emphasis
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(currentTrailPoint.x, currentTrailPoint.y);
        ctx.lineTo(currentTrailPoint.x - (mouseX - currentTrailPoint.x) * 0.2, currentTrailPoint.y - (mouseY - currentTrailPoint.y) * 0.2); // Shorter, more defined segment
        ctx.stroke();

        // Emit fine lines/particles from the thick line's base spreading outwards
        for (let i = 0; i < 10; i++) { // Even more fine lines for denser, lightning-like effect
            const offsetAngle = Math.random() * Math.PI * 2;
            const offsetDist = Math.random() * 20;
            const px = currentTrailPoint.x + Math.cos(offsetAngle) * offsetDist;
            const py = currentTrailPoint.y + Math.sin(offsetAngle) * offsetDist;
            particles.push(new Particle(px, py, color, isMouseMoving ? 3 : 1.5)); // Even faster, more spread when moving
        }

        // When idle, emit particles in a pulsating spiral from the mouse position
        if (!isMouseMoving) {
            const pulseRadius = 50 + Math.sin((performance.now() - lastPulseTime) * 0.005) * 40;
            const pulseAngle = (performance.now() - lastPulseTime) * 0.008;

            const x = mouseX + Math.cos(pulseAngle) * pulseRadius;
            const y = mouseY + Math.sin(pulseAngle) * pulseRadius;
            particles.push(new Particle(x, y, color, 1.2)); // Slightly faster particles for idle spiral
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


    // --- REAL WALLET CONNECTION AND TRANSACTION LOGIC (for IDO) ---
    // Make sure these are your actual addresses!
    const MY_RECEIVING_SOL_ADDRESS = new PublicKey("nxLHh8p2azzBJeuZCCRqSWoDA4h9ipGq6XumLVwmdYB"); // Your actual Solflare main wallet address (where SOL/USDC will go)
    const aUSD_MINT_ADDRESS_DEVNET = new PublicKey("57Xmt89NZHqf8zLFkPmQPu9KetsosEhzef3R2DUpSCjX"); // Your aUSD Token Mint Address

    const connection = new Connection("https://api.devnet.solana.com", 'confirmed'); // Connect to Devnet

    const miningRateDisplay = document.getElementById('miningRate');
    const totalMinedDisplay = document.getElementById('totalMined');
    const startMiningBtn = document.getElementById('startMiningBtn');
    const connectPhantomBtn = document.getElementById('connectPhantomBtn'); // Specific IDs for buttons
    const connectSolflareBtn = document.getElementById('connectSolflareBtn');
    const connectBackpackBtn = document.getElementById('connectBackpackBtn');
    const walletStatus = document.getElementById('walletStatus');
    const referralLinkDisplay = document.getElementById('referralLink');
    const idoAmountInput = document.getElementById('idoAmount');
    const buyaUSDBtn = document.getElementById('buyaUSDBtn');
    const idoStatus = document.getElementById('idoStatus');
    const headerLogoText = document.querySelector('.header-logo-text'); // For the text logo
    const mainLogoText = document.querySelector('.main-logo-text'); // For the main hero logo text
    const whitepaperToggleBtns = document.querySelectorAll('.read-more-toggle'); // Whitepaper toggle buttons

    // Set data-text for header logo animation
    if (headerLogoText) {
        headerLogoText.setAttribute('data-text', headerLogoText.textContent);
    }
    if (mainLogoText) {
        mainLogoText.setAttribute('data-text', mainLogoText.textContent);
    }


    let isMining = false;
    let minedAmount = 0; // Simulated mined amount
    let currentMiningRate = 0; // aUSD per second (simulated)
    let userWalletPublicKey = null; // Stores connected wallet's public key
    let referralMultiplier = 1.0; // Base multiplier for mining rate
    let lastMiningActivationTime = 0;
    const MINING_REACTIVATION_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

    const BASE_MINING_RATE_PER_SEC = 0.00005; // 0.00005 aUSD per second = ~4.32 aUSD per day
    const REFERRAL_BONUS_PER_REFERRAL_UNIT = 0.00001; // Increase rate by this much per referral unit

    // --- Wallet Connection Logic (Real Connection) ---
    const getProvider = (walletType) => {
        if (walletType === 'phantom' && window.phantom?.solana?.isPhantom) {
            return window.phantom.solana;
        } else if (walletType === 'solflare' && window.solflare?.isSolflare) {
            return window.solflare;
        } else if (walletType === 'backpack' && window.backpack?.solana?.isBackpack) {
            return window.backpack.solana;
        }
        return null;
    };

    walletConnectBtns.forEach(button => {
        button.addEventListener('click', async () => {
            const walletType = button.dataset.wallet;
            const provider = getProvider(walletType);

            if (!provider) {
                walletStatus.textContent = `Error: ${walletType} wallet not detected. Please install it.`;
                walletStatus.style.color = '#ff0000';
                return;
            }

            try {
                walletStatus.textContent = `Initiating Quantum Link with ${walletType}...`;
                walletStatus.style.color = '#00ffff';

                const resp = await provider.connect();
                userWalletPublicKey = resp.publicKey; // Store PublicKey object
                
                walletStatus.textContent = `Quantum Link Established! Connected to ${walletType}. Address: ${userWalletPublicKey.toBase58().substring(0, 6)}...${userWalletPublicKey.toBase58().slice(-6)}`;
                walletStatus.style.color = '#00ff00';
                
                // Simulate referral link generation (now based on real connected address)
                referralLinkDisplay.textContent = `https://anarchydollar.com/mine?ref=${userWalletPublicKey.toBase58().substring(0, 8)}`; // Use part of wallet address for referral code
                
                // Simulate referral bonus calculation (frontend only)
                // In a real system, referral count would come from backend
                setTimeout(() => {
                    const simulatedReferrals = Math.floor(Math.random() * 5 + 1); // Simulate 1 to 5 referrals
                    referralMultiplier = 1.0 + simulatedReferrals * REFERRAL_BONUS_PER_REFERRAL_UNIT;
                    updateMiningRateDisplay();
                }, 1000);

                startMiningBtn.disabled = false; // Enable mining button after successful connection

            } catch (error) {
                walletStatus.textContent = `Quantum Link Failed: ${error.message || 'Connection denied/failed.'}`;
                walletStatus.style.color = '#ff0000';
                userWalletPublicKey = null;
                startMiningBtn.disabled = true; // Disable mining if connection fails
            }
        });
    });

    // --- Mining Logic (Enhanced Simulation with 6-hour re-activation) ---
    startMiningBtn.addEventListener('click', () => {
        if (!userWalletPublicKey) {
            walletStatus.textContent = "Initiate Quantum Link first to activate mining protocols!";
            walletStatus.style.color = '#ff0000';
            return;
        }

        const currentTime = performance.now();
        if (isMining && (currentTime - lastMiningActivationTime < MINING_REACTIVATION_INTERVAL_MS)) {
            const timeLeft = MINING_REACTIVATION_INTERVAL_MS - (currentTime - lastMiningActivationTime);
            const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));
            walletStatus.textContent = `Mining is already active. Reactivate in ${hoursLeft} hours.`;
            walletStatus.style.color = '#FFA500'; // Orange for warning
            return;
        }

        isMining = true;
        lastMiningActivationTime = currentTime; // Record activation time
        startMiningBtn.textContent = "Quantum Mining Active...";
        startMiningBtn.disabled = true; // Disable until re-activation needed
        currentMiningRate = BASE_MINING_RATE_PER_SEC * referralMultiplier;
        miningRateDisplay.textContent = `${currentMiningRate.toFixed(7)} aUSD/sec`;
        
        const miningInterval = setInterval(() => {
            const newMined = currentMiningRate * 1; // Mined per second
            minedAmount += newMined;
            totalMinedDisplay.textContent = `${minedAmount.toFixed(7)} aUSD`;

            // Check if 6 hours passed for re-activation
            if (performance.now() - lastMiningActivationTime >= MINING_REACTIVATION_INTERVAL_MS) {
                clearInterval(miningInterval);
                isMining = false;
                startMiningBtn.textContent = "Reactivate Mining (Click to continue)";
                startMiningBtn.disabled = false; // Enable for re-activation
                walletStatus.textContent = "Quantum Mining requires re-activation!";
                walletStatus.style.color = '#FFFF00'; // Yellow for alert
            }
        }, 1000); // Update every second
    });

    // --- IDO Buy Logic (Real Transaction Simulation) ---
    buyaUSDBtn.addEventListener('click', async () => {
        const amountUSD = parseFloat(idoAmountInput.value);
        if (isNaN(amountUSD) || amountUSD < 100 || amountUSD > 15000) {
            idoStatus.textContent = "Invalid contribution. Limits: Minimum 100 USD, Maximum 15,000 USD.";
            idoStatus.style.color = '#ff0000';
            return;
        }

        if (!userWalletPublicKey) {
            idoStatus.textContent = "Connect your Quantum Wallet to participate in the IDO!";
            idoStatus.style.color = '#ff0000';
            return;
        }

        idoStatus.textContent = `Initiating Quantum Acquisition for ${amountUSD.toFixed(2)} aUSD... (Awaiting wallet approval)`;
        idoStatus.style.color = '#00ffff';

        try {
            // Assume payment in SOL. Convert USD to SOL (for demo, assume 1 SOL = 1 USD).
            // In a real scenario, you would fetch real-time SOL/USD price.
            const solAmount = amountUSD; 
            const lamports = solAmount * LAMPORTS_PER_SOL;

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: userWalletPublicKey,
                    toPubkey: MY_RECEIVING_SOL_ADDRESS, 
                    lamports: lamports,
                })
            );

            // Get latest blockhash
            const { blockhash } = await connection.getLatestBlockhash('finalized'); // Use 'finalized' for more stable blockhash
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = userWalletPublicKey;

            // Request signing from the connected wallet provider
            const signedTransaction = await window.solana.signTransaction(transaction); // Assumes generic window.solana provider
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());

            // Confirm transaction (this can take a while in real Devnet)
            await connection.confirmTransaction(signature, 'confirmed');

            idoStatus.textContent = `Acquisition successful! ${amountUSD.toFixed(2)} aUSD secured. Transaction ID: ${signature.substring(0, 8)}...`;
            idoStatus.style.color = '#00ff00';
            idoAmountInput.value = '';

            // Simulate aUSD being added to user's balance
            minedAmount += amountUSD;
            totalMinedDisplay.textContent = `${minedAmount.toFixed(7)} aUSD`;

        } catch (error) {
            idoStatus.textContent = `Quantum Acquisition Failed: ${error.message || 'Transaction denied/failed.'}`;
            idoStatus.style.color = '#ff0000';
            console.error("IDO Transaction Error:", error);
        }
    });

    // Whitepaper Toggle Logic
    whitepaperToggleBtns.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor behavior
            const targetId = button.dataset.target;
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.toggle('whitepaper-hidden-content');
                if (targetContent.classList.contains('whitepaper-hidden-content')) {
                    button.textContent = 'Read More...';
                } else {
                    button.textContent = 'Read Less...';
                }
            }
        });
    });

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