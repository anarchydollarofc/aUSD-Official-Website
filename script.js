document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('quantumPlasmaCanvas');
    const ctx = canvas.getContext('2d');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let particles = [];
    const maxParticles = 700;
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

    // Mouse movement listener - only active when NOT on buttons
    document.addEventListener('mousemove', (e) => {
        const targetElement = e.target;
        const isOverClickable = window.getComputedStyle(targetElement).cursor === 'pointer' ||
                                targetElement.closest('.btn') || targetElement.closest('a');
        if (!isOverClickable) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            isMouseMoving = true;
            clearTimeout(mouseMoveTimer);
            mouseMoveTimer = setTimeout(() => {
                isMouseMoving = false;
                lastPulseTime = performance.now();
            }, 150);
            canvas.style.cursor = 'none'; // Hide default cursor outside clickable areas
        } else {
            canvas.style.cursor = 'pointer'; // Show pointer cursor for clickable elements
        }
    });

    class Particle {
        constructor(x, y, color, speedMultiplier = 1) {
            this.x = x;
            this.y = y;
            this.baseSize = Math.random() * 2 + 1; // Partículas maiores, mais visíveis
            this.size = this.baseSize;
            this.color = color;
            this.speedX = (Math.random() - 0.5) * 8 * speedMultiplier; // Mais rápidas e caóticas
            this.speedY = (Math.random() - 0.5) * 8 * speedMultiplier;
            this.alpha = 1;
            this.life = 0;
            this.maxLife = Math.random() * 100 + 80; // Vivem mais tempo, rastro mais denso
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.alpha -= 1 / this.maxLife;
            this.size = this.baseSize * (this.alpha > 0 ? this.alpha : 0);
            this.life++;
            if (Math.random() < 0.1) { // Aumenta a chance de mudança de direção
                this.speedX += (Math.random() - 0.5) * 2;
                this.speedY += (Math.random() - 0.5) * 2;
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
        ctx.fillStyle = 'rgba(13, 13, 26, 0.02)'; // Ainda mais opaco, pra dar aquele rastro "cyberpunk"
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const timeFactor = performance.now() * 0.0002; // Cor mudando mais lentamente, pra dar mais tempo de apreciar
        // Hues para o gradiente:
        // Roxo escuro/roxo-azulado: Aprox. 270 (como base no seu CSS, 8a2be2 é um roxo-azulado)
        // Azul claro neon/ciano: Aprox. 180 (como base no seu CSS, 00ffff é ciano)
        const startHue = 270; // HSL hue para um roxo mais profundo
        const endHue = 180;   // HSL hue para o azul neon ciano
        const hueRange = endHue - startHue;
        const currentHue = startHue + (Math.sin(timeFactor) + 1) / 2 * hueRange; // Mapeia seno para a faixa de cores

        const color = `hsl(${currentHue}, 100%, 75%)`; // Saturação e brilho no máximo, pra gritar "NEON!"

        currentTrailPoint.x += (mouseX - currentTrailPoint.x) * 0.3; // Segue o mouse mais de perto, mais responsivo
        currentTrailPoint.y += (mouseY - currentTrailPoint.y) * 0.3;

        // Desenha a linha grossa na "cabeça" do cursor
        ctx.strokeStyle = color;
        ctx.lineWidth = 10; // A linha mais grossa ainda, pra impactar!
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(currentTrailPoint.x, currentTrailPoint.y);
        ctx.lineTo(currentTrailPoint.x - (mouseX - currentTrailPoint.x) * 0.1, currentTrailPoint.y - (mouseY - currentTrailPoint.y) * 0.1);
        ctx.stroke();

        // Gera mais partículas por frame, pra densidade total
        for (let i = 0; i < 20; i++) { // Botei pra gerar mais partículas, pra ficar denso pra caralho!
            const offsetAngle = Math.random() * Math.PI * 2;
            const offsetDist = Math.random() * 40; // Espalha mais, pra um efeito maior
            const px = currentTrailPoint.x + Math.cos(offsetAngle) * offsetDist;
            const py = currentTrailPoint.y + Math.sin(offsetAngle) * offsetDist;
            particles.push(new Particle(px, py, color, isMouseMoving ? 6 : 4)); // Partículas mais rápidas em ambos os estados
        }

        if (!isMouseMoving) {
            const pulseRadius = 70 + Math.sin((performance.now() - lastPulseTime) * 0.003) * 60; // Pulso ainda maior e mais impactante
            const pulseAngle = (performance.now() - lastPulseTime) * 0.012; // Pulso girando mais rápido

            const x = mouseX + Math.cos(pulseAngle) * pulseRadius;
            const y = mouseY + Math.sin(pulseAngle) * pulseRadius;
            particles.push(new Particle(x, y, color, 2.5)); // Partículas do pulso mais rápidas
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
    // (O resto do seu script.js continua igual, só mexi no efeito visual mesmo!)
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

    const BASE_MINING_RATE_PER_SEC = 0.00005; 
    const REFERRAL_BONUS_PER_REFERRAL_UNIT = 0.00001;

    connectXBtn.addEventListener('click', async () => {
        xProfileStatus.textContent = `Initiating Quantum Link with X Profile...`;
        xProfileStatus.style.color = '#00ffff';

        try {
            const fakeUsernames = ["@QuantumAnarchist", "@CipherMaestro", "@SolanaGuru", "@DarkWebKing", "@AUSD_Rebel"];
            const selectedUsername = fakeUsernames[Math.floor(Math.random() * fakeUsernames.length)];
            const fakeProfilePicURL = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${selectedUsername}`;

            userXUsername = selectedUsername;
            
            xProfilePic.src = fakeProfilePicURL; 
            xUsernameDisplay.textContent = userXUsername;
            xProfileStatus.textContent = `Quantum Link Established! Connected to X as ${userXUsername}.`;
            xProfileStatus.style.color = '#00ff00';
    
            referralLinkDisplay.textContent = `https://anarchydollar.com/mine?ref=${userXUsername.replace('@', '')}`;
            setTimeout(() => {
                const simulatedReferrals = Math.floor(Math.random() * 5 + 1); 
                referralMultiplier = 1.0 + simulatedReferrals * REFERRAL_BONUS_PER_REFERRAL_UNIT;
                updateMiningRateDisplay();
            }, 1000);
            startMiningBtn.disabled = false; 

        } catch (error) {
            xProfileStatus.textContent = `Quantum Link Failed: ${error.message || 'Connection denied/failed.'}`;
            xProfileStatus.style.color = '#ff0000';
            userXProfileConnected = false;
            startMiningBtn.disabled = true; 
            xUsernameDisplay.textContent = '';
            xProfilePic.src = "https://via.placeholder.com/40";
        }
    });

    startMiningBtn.addEventListener('click', () => {
        if (!userXUsername) { 
            xProfileStatus.textContent = "Initiate Quantum Link with X Profile first to activate mining protocols!";
            xProfileStatus.style.color = '#ff0000';
            return;
        }

        const currentTime = Date.now(); 
        if (isMining && (currentTime - lastMiningActivationTime < MINING_REACTIVATION_INTERVAL_MS)) {
            const timeLeft = MINING_REACTIVATION_INTERVAL_MS - (currentTime - lastMiningActivationTime);
            const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));
            xProfileStatus.textContent = `Quantum Mining is already active. Reactivate in ${hoursLeft} hours.`;
            xProfileStatus.style.color = '#FFA500'; 
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
                xProfileStatus.textContent = "Quantum Mining requires re-activation!";
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
            idoStatus.textContent = "Connect your Quantum Wallet to participate in the IDO!";
            idoStatus.style.color = '#ff0000';
            return;
        }

        idoStatus.textContent = `Initiating Quantum Acquisition for ${amountUSD.toFixed(2)} aUSD... (Awaiting wallet approval)`;
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
            idoStatus.textContent = `Quantum Acquisition Failed: ${error.message || 'Transaction denied/failed.'}`;
            idoStatus.style.color = '#ff0000';
            console.error("IDO Transaction Error:", error);
        }
    });
    // A função updateMiningRateDisplay não está definida no seu código atual,
    // então a chamada a ela foi removida para evitar erros.
    // updateMiningRateDisplay(); 
});