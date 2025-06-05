document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('quantumPlasmaCanvas');
    const ctx = canvas.getContext('2d');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let particles = [];
    const maxParticles = 700; // Mantido o número máximo de partículas, mas elas terão vida curta
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
            this.baseSize = Math.random() * 0.8 + 0.3; // Partículas bem pequenas
            this.size = this.baseSize;
            this.color = color;
            this.speedX = (Math.random() - 0.5) * 4; // Velocidade moderada para as faíscas
            this.speedY = (Math.random() - 0.5) * 4;
            this.alpha = 1;
            this.life = 0;
            this.maxLife = Math.random() * 20 + 10; // Vida muito curta para sumirem rápido
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
        // Limpa o canvas completamente a cada frame para evitar qualquer rastro
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Opcional: Adiciona um fundo sutil se quiser que o plasma de fundo ainda esteja presente
        // Mas sem interferir no rastro do cursor. Se o background-overlay e o quantumPlasmaCanvas
        // já cuidam do fundo, essa linha pode ser removida ou ter alpha muito baixo.
        // ctx.fillStyle = 'rgba(13, 13, 26, 0.005)'; // Quase invisível, para uma limpeza suave
        // ctx.fillRect(0, 0, canvas.width, canvas.height);


        // Ajusta a posição do ponto atual do rastro para seguir o mouse de forma suave
        currentTrailPoint.x += (mouseX - currentTrailPoint.x) * 0.2;
        currentTrailPoint.y += (mouseY - currentTrailPoint.y) * 0.2;

        // Gera a cor em degradê roxo-azul neon
        const timeFactor = performance.now() * 0.0002;
        const startHue = 270; // HSL hue para um roxo (como #8a2be2)
        const endHue = 180;   // HSL hue para um ciano/azul neon (como #00ffff)
        const hueRange = endHue - startHue;
        const currentHue = startHue + (Math.sin(timeFactor) + 1) / 2 * hueRange;
        const color = `hsl(${currentHue}, 100%, 75%)`; // Saturação e brilho altos para efeito neon

        // Desenha a linha fina e contínua que segue o cursor
        ctx.strokeStyle = color;
        ctx.lineWidth = 3; // Linha fina
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(currentTrailPoint.x, currentTrailPoint.y);
        // Usa a posição do mouse diretamente para criar uma linha que aponta para o cursor
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();

        // Geração de micro choques (faíscas)
        // Geramos poucas partículas por frame para que sejam mínimas
        for (let i = 0; i < 2; i++) { // Apenas 2 faíscas por frame para sutileza
            const offsetAngle = Math.random() * Math.PI * 2;
            const offsetDist = Math.random() * 10; // Espalhamento bem pequeno ao redor da linha
            const px = currentTrailPoint.x + Math.cos(offsetAngle) * offsetDist;
            const py = currentTrailPoint.y + Math.sin(offsetAngle) * offsetDist;
            particles.push(new Particle(px, py, color));
        }
        
        // Atualiza e desenha as partículas (faíscas)
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            // Remove partículas mortas
            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
                i--;
            }
        }

        // Garante que o número de partículas não exceda o limite, removendo as mais antigas
        if (particles.length > maxParticles) {
            particles.splice(0, particles.length - maxParticles);
        }

        requestAnimationFrame(animateQuantumPlasma);
    }

    animateQuantumPlasma();

    // --- Wallet / X Integration and Mining Logic ---
    // (O restante do seu script.js permanece inalterado a partir daqui)

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
});