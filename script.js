document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('quantumPlasmaCanvas');
    const ctx = canvas.getContext('2d');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let particles = [];
    const maxParticles = 700; // Maintained max particles, but they will have short life
    let currentTrailPoint = { x: mouseX, y: mouseY };

    // Set canvas size on load and resize
    const setCanvasSize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Mouse movement listener - only active when NOT on buttons
    document.addEventListener('mousemove', (e) => {
        const targetElement = e.target;
        const isOverClickable = window.getComputedStyle(targetElement).cursor === 'pointer' ||
                                 targetElement.closest('.btn') || targetElement.closest('a');
        if (!isOverClickable) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            canvas.style.cursor = 'none'; // Hide default cursor outside clickable areas
        } else {
            canvas.style.cursor = 'pointer'; // Show pointer cursor for clickable elements
        }
    });

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.baseSize = Math.random() * 0.8 + 0.3; // Very small particles
            this.size = this.baseSize;
            this.color = color;
            this.speedX = (Math.random() - 0.5) * 4; // Moderate speed for sparks
            this.speedY = (Math.random() - 0.5) * 4;
            this.alpha = 1;
            this.life = 0;
            this.maxLife = Math.random() * 20 + 10; // Very short life to disappear quickly
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.alpha -= 1 / this.maxLife;
            this.size = this.baseSize * (this.alpha > 0 ? this.alpha : 0);
            this.life++;
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
        // Clear canvas completely each frame to avoid any trails
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Adjust current trail point position to smoothly follow the mouse
        currentTrailPoint.x += (mouseX - currentTrailPoint.x) * 0.2;
        currentTrailPoint.y += (mouseY - currentTrailPoint.y) * 0.2;

        // Generate neon purple-blue gradient color
        const timeFactor = performance.now() * 0.0002;
        const startHue = 270; // HSL hue for purple
        const endHue = 180;    // HSL hue for neon cyan/blue
        const hueRange = endHue - startHue;
        const currentHue = startHue + (Math.sin(timeFactor) + 1) / 2 * hueRange;
        const color = `hsl(${currentHue}, 100%, 75%)`; // High saturation and brightness for neon effect

        // Draw thin, continuous line following cursor
        ctx.strokeStyle = color;
        ctx.lineWidth = 3; // Thin line
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(currentTrailPoint.x, currentTrailPoint.y);
        // Use mouse position directly to create a line that points to the cursor
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();

        // Generate micro shocks (sparks)
        // Generate few particles per frame for subtlety
        for (let i = 0; i < 2; i++) { // Only 2 sparks per frame for subtlety
            const offsetAngle = Math.random() * Math.PI * 2;
            const offsetDist = Math.random() * 10; // Very small spread around the line
            const px = currentTrailPoint.x + Math.cos(offsetAngle) * offsetDist;
            const py = currentTrailPoint.y + Math.sin(offsetAngle) * offsetDist;
            particles.push(new Particle(px, py, color));
        }

        // Update and draw particles (sparks)
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            // Remove dead particles
            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
                i--;
            }
        }

        // Ensure particle count doesn't exceed limit, removing oldest
        if (particles.length > maxParticles) {
            particles.splice(0, particles.length - maxParticles);
        }

        requestAnimationFrame(animateQuantumPlasma);
    }

    animateQuantumPlasma();

    // --- Wallet / X Integration and Mining Logic ---
    const miningRateDisplay = document.getElementById('miningRate');
    const totalMinedDisplay = document.getElementById('totalMined');
    const startMiningBtn = document.getElementById('startMiningBtn');
    const connectXBtn = document.getElementById('connectXBtn');
    const xProfileStatus = document.getElementById('xProfileStatus');
    const referralLinkDisplay = document.getElementById('referralLink');
    const idoAmountInput = document.getElementById('idoAmount');
    const buyaUSDBtn = document.getElementById('buyaUSDBtn');
    const idoStatus = document.getElementById('idoStatus');
    const xUsernameDisplay = document.getElementById('xUsernameDisplay');
    const xProfilePic = document.getElementById('xProfilePic');
    const connectWalletForIDOBtn = document.getElementById('connectWalletForIDOBtn');
    const idoWalletStatus = document.getElementById('idoWalletStatus');
    const nextHalvingUsersDisplay = document.getElementById('nextHalvingUsers'); // New element

    const headerLogoText = document.querySelector('.header-logo-text');
    const mainLogoText = document.querySelector('.main-logo-text');
    const whitepaperToggleAllBtn = document.getElementById('whitepaperToggleAll');
    const whitepaperExpandableContents = document.querySelectorAll('.whitepaper-expandable-content');

    if (headerLogoText) {
        headerLogoText.setAttribute('data-text', headerLogoText.textContent);
    }

    if (mainLogoText) {
        mainLogoText.setAttribute('data-text', mainLogoText.textContent);
    }

    whitepaperExpandableContents.forEach(section => {
        section.style.display = 'none';
    });

    let isMining = false;
    let minedAmount = 0;
    let currentMiningRate = 0;
    let userXUsername = null;
    let userSolanaWalletPublicKey = null;
    let referralMultiplier = 1.0;
    let lastMiningActivationTime = 0;
    const MINING_REACTIVATION_INTERVAL_MS = 6 * 60 * 60 * 1000;

    // --- Anarchy Miner Tokenomics: User-Based Halvings ---
    // This base rate (e.g., 0.001 aUSD per hour) needs careful calculation for long-term sustainability.
    // Adjust based on total supply, projected user growth, and desired emission schedule.
    const BASE_MINING_RATE_PER_HOUR = 0.001; // Base rate per hour before any halving.
    // User milestones for halving. These are examples, adjust for your strategy.
    // The last value (75,000,000) aims for a large scale before final halvings.
    const USERS_FOR_HALVING = [100000, 600000, 3000000, 15000000, 75000000];
    let totalActiveMiners = 0; // This would come from a backend in a real project
    let currentHalvingIndex = 0;
    let currentMiningRatePerSecond = 0; // Mining rate per second, adjusted by halvings and multipliers

    // Function to simulate the total number of users and halving impact
    // In a real project, totalActiveMiners would be fetched from your backend/blockchain.
    function simulateUserGrowthAndHalving() {
        // For demonstration, we'll simulate a random user count to trigger halvings.
        // In a real system, this would be a real-time count from your backend.
        totalActiveMiners = Math.floor(Math.random() * 80000000) + 1; // Simulates between 1 and 80 million users for demo

        let rateMultiplier = 1;
        let nextHalvingBoundary = "N/A"; // Default for when all halvings are passed

        for (let i = 0; i < USERS_FOR_HALVING.length; i++) {
            if (totalActiveMiners >= USERS_FOR_HALVING[i]) {
                rateMultiplier *= 0.5; // Halve the rate for each passed milestone
                currentHalvingIndex = i + 1;
            } else {
                nextHalvingBoundary = USERS_FOR_HALVING[i].toLocaleString() + " users";
                break; // Stop at the first upcoming halving boundary
            }
        }
        nextHalvingUsersDisplay.textContent = nextHalvingBoundary;

        const baseRateAfterHalvings = BASE_MINING_RATE_PER_HOUR * rateMultiplier;
        currentMiningRatePerSecond = (baseRateAfterHalvings / 3600) * referralMultiplier; // Convert to per second

        updateMiningRateDisplay();
    }

    // Call the user simulation on page load and periodically
    simulateUserGrowthAndHalving();
    setInterval(simulateUserGrowthAndHalving, 60000); // Update simulated users and halving status every minute (adjust as needed)

    function updateMiningRateDisplay() {
        if (isMining) {
            currentMiningRate = currentMiningRatePerSecond; // Uses the rate adjusted by halving
        } else {
            // When not actively mining, display the potential rate if activated
            currentMiningRate = currentMiningRatePerSecond; // Show potential earnings
        }
        miningRateDisplay.textContent = `${currentMiningRate.toFixed(7)} aUSD/sec`;
    }


    connectXBtn.addEventListener('click', async () => {
        xProfileStatus.textContent = `Initiating Anarchy Link with X Profile...`;
        xProfileStatus.style.color = '#00ffff';

        try {
            const fakeUsernames = ["@AnarchyAce", "@CipherNomad", "@SolanaGhost", "@RogueFinancier", "@AUSD_Rebel"];
            const selectedUsername = fakeUsernames[Math.floor(Math.random() * fakeUsernames.length)];
            const fakeProfilePicURL = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${selectedUsername}`;

            userXUsername = selectedUsername;

            xProfilePic.src = fakeProfilePicURL;
            xUsernameDisplay.textContent = userXUsername;
            xProfileStatus.textContent = `Anarchy Link Established! Connected to X as ${userXUsername}.`;
            xProfileStatus.style.color = '#00ff00';

            referralLinkDisplay.textContent = `https://anarchydollar.com/mine?ref=${userXUsername.replace('@', '')}`;
            // Adjust '0.1' as desired. This should be a percentage or fixed value.
            const simulatedReferrals = Math.floor(Math.random() * 5 + 1);
            referralMultiplier = 1.0 + simulatedReferrals * 0.1; // Example: 10% bonus per simulated referral
            updateMiningRateDisplay(); // Ensure rate is updated immediately after connection
            simulateUserGrowthAndHalving(); // Recalculate rate immediately after connection, considering new multiplier


            startMiningBtn.disabled = false;

        } catch (error) {
            xProfileStatus.textContent = `Anarchy Link Failed: ${error.message || 'Connection denied/failed.'}`;
            xProfileStatus.style.color = '#ff0000';
            userXProfileConnected = false;
            startMiningBtn.disabled = true;
            xUsernameDisplay.textContent = '';
            xProfilePic.src = "https://via.placeholder.com/40";
        }
    });

    startMiningBtn.addEventListener('click', () => {
        if (!userXUsername) {
            xProfileStatus.textContent = "Initiate Anarchy Link with X Profile first to activate mining protocols!";
            xProfileStatus.style.color = '#ff0000';
            return;
        }

        const currentTime = Date.now();
        if (isMining && (currentTime - lastMiningActivationTime < MINING_REACTIVATION_INTERVAL_MS)) {
            const timeLeft = MINING_REACTIVATION_INTERVAL_MS - (currentTime - lastMiningActivationTime);
            const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));
            xProfileStatus.textContent = `Anarchy Miner is already active. Reactivate in ${hoursLeft} hours.`;
            xProfileStatus.style.color = '#FFA500';
            return;
        }

        isMining = true;
        lastMiningActivationTime = currentTime;
        startMiningBtn.textContent = "Anarchy Miner Active...";
        startMiningBtn.disabled = true;

        // Ensure rate is updated based on current simulation before starting interval
        simulateUserGrowthAndHalving(); // This also calls updateMiningRateDisplay()

        const miningInterval = setInterval(() => {
            const newMined = currentMiningRate * 1;
            minedAmount += newMined;
            totalMinedDisplay.textContent = `${minedAmount.toFixed(7)} aUSD`;

            if (Date.now() - lastMiningActivationTime >= MINING_REACTIVATION_INTERVAL_MS) {
                clearInterval(miningInterval);
                isMining = false;
                startMiningBtn.textContent = "Reactivate Miner (Click to continue)";
                startMiningBtn.disabled = false;
                xProfileStatus.textContent = "Anarchy Miner requires re-activation!";
                xProfileStatus.style.color = '#FFFF00';
            }
        }, 1000);
    });

    buyaUSDBtn.addEventListener('click', async () => {
        const amountUSD = parseFloat(idoAmountInput.value);
        if (isNaN(amountUSD) || amountUSD < 100 || amountUSD > 15000) {
            idoStatus.textContent = "Invalid contribution. Limits: Minimum 100 USD, Maximum 15,000 USD.";
            idoStatus.style.color = '#ff0000';
            return;
        }

        if (!userSolanaWalletPublicKey) {
            idoStatus.textContent = "Connect your Anarchy Wallet to participate in the IDO!";
            idoStatus.style.color = '#ff0000';
            return;
        }

        idoStatus.textContent = `Initiating Anarchy Acquisition for ${amountUSD.toFixed(2)} aUSD... (Awaiting wallet approval)`;
        idoStatus.style.color = '#00ffff';

        try {
            const solAmount = amountUSD;
            const lamports = solAmount * 1000000000;

            console.log("Simulating IDO transaction...");
            await new Promise(resolve => setTimeout(resolve, 3000));

            idoStatus.textContent = `Acquisition successful! ${amountUSD.toFixed(2)} aUSD secured. Transaction ID: SIMULATED_TX_${Math.random().toString(36).substring(2,10)}`;
            idoStatus.style.color = '#00ff00';
            idoAmountInput.value = '';
            minedAmount += amountUSD;
            totalMinedDisplay.textContent = `${minedAmount.toFixed(7)} aUSD`;

        } catch (error) {
            idoStatus.textContent = `Anarchy Acquisition Failed: ${error.message || 'Transaction denied/failed.'}`;
            idoStatus.style.color = '#ff0000';
            console.error("IDO Transaction Error:", error);
        }
    });
});
