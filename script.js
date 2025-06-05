import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('quantumPlasmaCanvas');
    const ctx = canvas.getContext('2d');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let particles = [];
    const maxParticles = 700; // Increased for more density and smoother trails
    let isMouseMoving = false;
    let mouseMoveTimer;
    let lastPulseTime = 0;
    const pulseInterval = 1500; 
    let currentTrailPoint = { x: mouseX, y: mouseY }; 

    // Set canvas size on load and resize
    const setCanvasSize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    setCanvasSize(); 
    window.addEventListener('resize', setCanvasSize);

    // Mouse movement listener
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMouseMoving = true;
        clearTimeout(mouseMoveTimer);
        mouseMoveTimer = setTimeout(() => {
            isMouseMoving = false;
            lastPulseTime = performance.now(); 
        }, 150); 
    });

    // Particle class for the digital lightning-like effects
    class Particle {
        constructor(x, y, color, speedMultiplier = 1) {
            this.x = x;
            this.y = y;
            this.baseSize = Math.random() * 1.5 + 0.5;
            this.size = this.baseSize;
            this.color = color;
            this.speedX = (Math.random() - 0.5) * 5 * speedMultiplier; 
            this.speedY = (Math.random() - 0.5) * 5 * speedMultiplier; 
            this.alpha = 1; 
            this.life = 0;
            this.maxLife = Math.random() * 80 + 60; 
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.alpha -= 1 / this.maxLife; 
            this.size = this.baseSize * (this.alpha > 0 ? this.alpha : 0); 
            this.life++;

            if (Math.random() < 0.07) { 
                this.speedX += (Math.random() - 0.5) * 1.2;
                this.speedY += (Math.random() - 0.5) * 1.2;
            }
        }

        draw() {
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1; 
        }
    }

    function animateQuantumPlasma() {
        ctx.fillStyle = 'rgba(13, 13, 26, 0.02)'; // Even more transparent for clean trails
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const timeFactor = performance.now() * 0.0005;
        const baseHue = 270; 
        const range = 120; 
        const hue = (baseHue + Math.sin(timeFactor) * range) % 360;
        const color = `hsl(${hue}, 95%, 70%)`; // More vibrant, neon-like

        currentTrailPoint.x += (mouseX - currentTrailPoint.x) * 0.25; // Faster, smoother follow
        currentTrailPoint.y += (mouseY - currentTrailPoint.y) * 0.25;

        ctx.strokeStyle = color;
        ctx.lineWidth = 7; // Thicker line at the head
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(currentTrailPoint.x, currentTrailPoint.y);
        ctx.lineTo(currentTrailPoint.x - (mouseX - currentTrailPoint.x) * 0.15, currentTrailPoint.y - (mouseY - currentTrailPoint.y) * 0.15); // Shorter, more defined segment
        ctx.stroke();

        for (let i = 0; i < 12; i++) { // Even more fine lines for denser, lightning-like effect
            const offsetAngle = Math.random() * Math.PI * 2;
            const offsetDist = Math.random() * 25;
            const px = currentTrailPoint.x + Math.cos(offsetAngle) * offsetDist;
            const py = currentTrailPoint.y + Math.sin(offsetAngle) * offsetDist;
            particles.push(new Particle(px, py, color, isMouseMoving ? 4 : 2)); // Even faster, more spread when moving
        }

        if (!isMouseMoving) {
            const pulseRadius = 50 + Math.sin((performance.now() - lastPulseTime) * 0.005) * 40;
            const pulseAngle = (performance.now() - lastPulseTime) * 0.008;

            const x = mouseX + Math.cos(pulseAngle) * pulseRadius;
            const y = mouseY + Math.sin(pulseAngle) * pulseRadius;
            particles.push(new Particle(x, y, color, 1.5)); 
        }
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
                i--;
            }
        }

        if (particles.length > maxParticles) {
            particles.splice(0, particles.length - maxParticles);
        }

        requestAnimationFrame(animateQuantumPlasma);
    }

    animateQuantumPlasma();


    // --- Wallet / X Integration and Mining Logic ---
    const MY_RECEIVING_SOL_ADDRESS = new PublicKey("nxLHh8p2azzBJeuZCCRqSWoDA4h9ipGq6XumLVwmdYB"); // Your actual Solflare main wallet address (where SOL/USDC will go)
    const aUSD_MINT_ADDRESS_DEVNET = new PublicKey("57Xmt89NZHqf8zLFkPmQPu9KetsosEhzef3R2DUpSCjX"); // Your aUSD Token Mint Address

    const connection = new Connection("https://api.devnet.solana.com", 'confirmed');

    const miningRateDisplay = document.getElementById('miningRate');
    const totalMinedDisplay = document.getElementById('totalMined');
    const startMiningBtn = document.getElementById('startMiningBtn');
    const connectXBtn = document.getElementById('connectXBtn'); // ID for Connect X Profile button
    const walletStatus = document.getElementById('walletStatus');
    const referralLinkDisplay = document.getElementById('referralLink');
    const idoAmountInput = document.getElementById('idoAmount');
    const buyaUSDBtn = document.getElementById('buyaUSDBtn');
    const idoStatus = document.getElementById('idoStatus');
    const xUsernameDisplay = document.getElementById('xUsernameDisplay'); // Element to display X username

    // Whitepaper Toggle Logic
    const whitepaperToggleAllBtn = document.getElementById('whitepaperToggleAll');
    const whitepaperSectionsContainer = document.getElementById('whitepaperSections');

    if (whitepaperToggleAllBtn) {
        whitepaperToggleAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const allHiddenSections = whitepaperSectionsContainer.querySelectorAll('.whitepaper-expandable-content');
            const isAnyHidden = Array.from(allHiddenSections).some(section => section.style.display === 'none' || section.style.display === '');

            allHiddenSections.forEach(section => {
                section.style.display = isAnyHidden ? 'block' : 'none';
            });

            whitepaperToggleAllBtn.textContent = isAnyHidden ? 'Read Less...' : 'Read Full Whitepaper';
        });
    }

    // Hide all whitepaper expandable content initially
    whitepaperSectionsContainer.querySelectorAll('.whitepaper-expandable-content').forEach(section => {
        section.style.display = 'none';
    });


    let isMining = false;
    let minedAmount = 0; 
    let currentMiningRate = 0; 
    let userXProfileConnected = false; // Tracks if X profile is connected
    let xUsername = ''; // Stores X username
    let referralMultiplier = 1.0; 
    let lastMiningActivationTime = 0;
    const MINING_REACTIVATION_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

    const BASE_MINING_RATE_PER_SEC = 0.00005; 
    const REFERRAL_BONUS_PER_REFERRAL_UNIT = 0.00001; 

    // --- X (Twitter) Connection Logic (Simulated for real data) ---
    // This is a simulation. Real X OAuth requires a backend.
    connectXBtn.addEventListener('click', async () => {
        walletStatus.textContent = `Initiating Quantum Link with X Profile...`;
        walletStatus.style.color = '#00ffff';

        try {
            // Simulate OAuth flow to get username
            const fakeUsernames = ["@QuantumAnarchist", "@CipherMaestro", "@SolanaGuru", "@DarkWebKing", "@AUSD_Rebel"];
            const selectedUsername = fakeUsernames[Math.floor(Math.random() * fakeUsernames.length)];
            const fakeProfilePic = "https://via.placeholder.com/40"; // Placeholder for profile pic

            xUsername = selectedUsername;
            userXProfileConnected = true;
            
            xUsernameDisplay.innerHTML = `<img src="${fakeProfilePic}" alt="${xUsername} Profile Pic" class="x-profile-pic"> ${xUsername}`;
            walletStatus.textContent = `Quantum Link Established! Connected to X as ${xUsername}.`;
            walletStatus.style.color = '#00ff00';
            
            // Simulate referral link generation
            referralLinkDisplay.textContent = `https://anarchydollar.com/mine?ref=${xUsername.replace('@', '')}`; // Use X username for referral code
            
            // Simulate referral bonus calculation (frontend only)
            setTimeout(() => {
                const simulatedReferrals = Math.floor(Math.random() * 5 + 1); 
                referralMultiplier = 1.0 + simulatedReferrals * REFERRAL_BONUS_PER_REFERRAL_UNIT;
                updateMiningRateDisplay();
            }, 1000);

            startMiningBtn.disabled = false; 

        } catch (error) {
            walletStatus.textContent = `Quantum Link Failed: ${error.message || 'Connection denied/failed.'}`;
            walletStatus.style.color = '#ff0000';
            userXProfileConnected = false;
            startMiningBtn.disabled = true; 
        }
    });

    // --- Mining Logic (Enhanced Simulation with 6-hour re-activation) ---
    startMiningBtn.addEventListener('click', () => {
        if (!userXProfileConnected) { // Check X profile connection
            walletStatus.textContent = "Initiate Quantum Link with X Profile first to activate mining protocols!";
            walletStatus.style.color = '#ff0000';
            return;
        }

        const currentTime = Date.now(); // Use Date.now() for persistence across reloads (in a real app)
        if (isMining && (currentTime - lastMiningActivationTime < MINING_REACTIVATION_INTERVAL_MS)) {
            const timeLeft = MINING_REACTIVATION_INTERVAL_MS - (currentTime - lastMiningActivationTime);
            const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));
            walletStatus.textContent = `Quantum Mining is already active. Reactivate in ${hoursLeft} hours.`;
            walletStatus.style.color = '#FFA500'; 
            return;
        }

        isMining = true;
        lastMiningActivationTime = currentTime; 
        startMiningBtn.textContent = "Quantum Mining Active...";
        startMiningBtn.disabled = true; 
        currentMiningRate = BASE_MINING_RATE_PER_SEC * referralMultiplier;
        miningRateDisplay.textContent = `${currentMiningRate.toFixed(7)} aUSD/sec`;
        
        const miningInterval = setInterval(() => {
            const newMined = currentMiningRate * 1; 
            minedAmount += newMined;
            totalMinedDisplay.textContent = `${minedAmount.toFixed(7)} aUSD`;

            if (Date.now() - lastMiningActivationTime >= MINING_REACTIVATION_INTERVAL_MS) {
                clearInterval(miningInterval);
                isMining = false;
                startMiningBtn.textContent = "Reactivate Mining (Click to continue)";
                startMiningBtn.disabled = false; 
                walletStatus.textContent = "Quantum Mining requires re-activation!";
                walletStatus.style.color = '#FFFF00'; 
            }
        }, 1000); 
    });

    // --- IDO Buy Logic (Real Transaction Simulation) ---
    buyaUSDBtn.addEventListener('click', async () => {
        const amountUSD = parseFloat(idoAmountInput.value);
        if (isNaN(amountUSD) || amountUSD < 100 || amountUSD > 15000) {
            idoStatus.textContent = "Invalid contribution. Limits: Minimum 100 USD, Maximum 15,000 USD.";
            idoStatus.style.color = '#ff0000';
            return;
        }

        if (!userWalletPublicKey) { // This will now connect a Solana wallet for IDO
            idoStatus.textContent = "Connect your Quantum Wallet (Phantom/Solflare/Backpack) to participate in the IDO!";
            idoStatus.style.color = '#ff0000';
            // Trigger connection for Solana wallets here if not already connected
            // For now, we'll assume a Solana wallet is needed for this.
            return;
        }

        idoStatus.textContent = `Initiating Quantum Acquisition for ${amountUSD.toFixed(2)} aUSD... (Awaiting wallet approval)`;
        idoStatus.style.color = '#00ffff';

        try {
            // Assume payment in SOL.
            const solAmount = amountUSD; 
            const lamports = solAmount * LAMPORTS_PER_SOL;

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: userWalletPublicKey, // Connected Solana wallet
                    toPubkey: MY_RECEIVING_SOL_ADDRESS, 
                    lamports: lamports,
                })
            );

            const { blockhash } = await connection.getLatestBlockhash('finalized'); 
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = userWalletPublicKey;

            const signedTransaction = await window.solana.signTransaction(transaction); 
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());

            await connection.confirmTransaction(signature, 'confirmed');

            idoStatus.textContent = `Acquisition successful! ${amountUSD.toFixed(2)} aUSD secured. Transaction ID: ${signature.substring(0, 8)}...`;
            idoStatus.style.color = '#00ff00';
            idoAmountInput.value = '';

            minedAmount += amountUSD;
            totalMinedDisplay.textContent = `${minedAmount.toFixed(7)} aUSD`;

        } catch (error) {
            idoStatus.textContent = `Quantum Acquisition Failed: ${error.message || 'Transaction denied/failed.'}`;
            idoStatus.style.color = '#ff0000';
            console.error("IDO Transaction Error:", error);
        }
    });
    
    // Initial display update
    updateMiningRateDisplay();

    // Set header logo text for animation
    const headerLogoElement = document.querySelector('.header-logo-text');
    if (headerLogoElement) {
        headerLogoElement.setAttribute('data-text', headerLogoElement.textContent);
    }

    // Set main logo text for animation
    const mainLogoElement = document.querySelector('.main-logo-text');
    if (mainLogoElement) {
        mainLogoElement.setAttribute('data-text', mainLogoElement.textContent);
    }
});