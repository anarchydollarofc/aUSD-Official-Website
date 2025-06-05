document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('quantumPlasmaCanvas');
    const ctx = canvas.getContext('2d');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let particles = [];
    const maxParticles = 500;
    let lastMouseMoveTime = Date.now();
    const moveThreshold = 5; // Mínimo de movimento para gerar o rastro principal
    const trail = [];
    const trailLength = 15;
    const shockInterval = 5; // Intervalo para gerar os "choquinhos"
    let shockCounter = 0;

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
        trail.push({ x: mouseX, y: mouseY });
        if (trail.length > trailLength) {
            trail.shift();
        }
        lastMouseMoveTime = Date.now();
        canvas.style.cursor = e.target.closest('.btn') || e.target.closest('a') ? 'pointer' : 'none';
    });

    class Shock {
        constructor(x, y, parentX, parentY) {
            this.x = x;
            this.y = y;
            this.parentX = parentX;
            this.parentY = parentY;
            this.length = Math.random() * 15 + 5;
            this.angle = Math.random() * Math.PI * 2;
            this.speed = Math.random() * 2 + 1;
            this.alpha = 1;
            this.decayRate = 0.05;
        }

        update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.alpha -= this.decayRate;
        }

        draw() {
            if (this.alpha <= 0) return;
            const endX = this.x + Math.cos(this.angle) * this.length;
            const endY = this.y + Math.sin(this.angle) * this.length;
            const gradient = ctx.createLinearGradient(this.x, this.y, endX, endY);
            gradient.addColorStop(0, `rgba(138, 43, 226, ${this.alpha})`); // Roxo
            gradient.addColorStop(1, `rgba(0, 255, 255, 0)`); // Transparente
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    }

    let shocks = [];

    function animateQuantumPlasma() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Desenha o rastro principal
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        trail.forEach((p, index) => {
            const alpha = 0.1 + (0.9 * (index / (trail.length - 1)));
            const startColor = `rgba(138, 43, 226, ${alpha})`; // Roxo
            const endColor = `rgba(0, 255, 255, ${alpha})`; // Azul claro
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0); // Gradient horizontal (pode ajustar)
            gradient.addColorStop(0, startColor);
            gradient.addColorStop(1, endColor);
            ctx.strokeStyle = gradient;
            if (index === 0) {
                ctx.moveTo(p.x, p.y);
            } else {
                ctx.lineTo(p.x, p.y);
            }
        });
        ctx.stroke();

        // Gera e atualiza os "choquinhos"
        if (Date.now() - lastMouseMoveTime < 100 && trail.length > 0) {
            shockCounter++;
            if (shockCounter % shockInterval === 0) {
                const shockPos = trail.length > 5 ? trail[(trail.length - 1) - Math.floor(Math.random() * 5)] : trail.slice(-1)[0];
                if (shockPos) {
                    shocks.push(new Shock(shockPos.x, shockPos.y, mouseX, mouseY));
                }
            }
        }

        shocks.forEach((shock, index) => {
            shock.update();
            shock.draw();
            if (shock.alpha <= 0) {
                shocks.splice(index, 1);
            }
        });

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
    const idoWalletStatus = document.getElementById('idoWalletStatus');

    const headerLogoText = document.querySelector('.header-logo-text');
    const mainLogoText = document.querySelector('.main-logo-text');
    const whitepaperSection = document.getElementById('whitepaper');
    const connectWalletForIDOBtn = document.getElementById('connectWalletForIDOBtn'); // Ainda pego a referência para remover

    // Remover o botão "Read Full Whitepaper"
    const whitepaperToggleAllBtn = document.getElementById('whitepaperToggleAll');
    if (whitepaperToggleAllBtn && whitepaperSection) {
        whitepaperSection.querySelector('.whitepaper-content').removeChild(whitepaperToggleAllBtn);
    }

    // Remover o botão "Connect Wallet for IDO"
    if (connectWalletForIDOBtn && document.getElementById('ido')?.querySelector('.ido-controls')) {
        document.getElementById('ido').querySelector('.ido-controls').removeChild(connectWalletForIDOBtn);
    }

    // Função para aplicar bordas arredondadas ao neon (usando CSS diretamente agora)
    const applyRoundedNeon = (element) => {
        if (element) {
            element.style.textShadow = `0 0 10px rgba(138, 43, 226, 0.7), 0 0 20px rgba(0, 255, 255, 0.5),
                                       0 0 5px rgba(138, 43, 226, 0.9), 0 0 10px rgba(0, 255, 255, 0.7)`;
        }
    };

    // Aplicar bordas arredondadas (efeito visual via text-shadow)
    applyRoundedNeon(headerLogoText);
    applyRoundedNeon(mainLogoText);

    // Set data-text for header logo animation (mantido)
    if (headerLogoText) {
        headerLogoText.setAttribute('data-text', headerLogoText.textContent);
    }
    // Set data-text for main logo animation (mantido)
    if (mainLogoText) {
        mainLogoText.setAttribute('data-text', mainLogoText.textContent);
    }

    let isMining = false;
    let minedAmount = 0;
    let currentMiningRate = 0;
    let userXUsername = null;
    let userSolanaWalletPublicKey = null;
    let referralMultiplier = 1.0;
    let lastMiningActivationTime = 0;
    const MINING_REACTIVATION_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 horas em milliseconds

    const BASE_MINING_RATE_PER_SEC = 0.00005;
    const REFERRAL_BONUS_PER_REFERRAL_UNIT = 0.00001;

    // --- X (Twitter) Connection Logic (SIMULATED) ---
    connectXBtn.addEventListener('click', async () => {
        xProfileStatus.textContent = `Initiating Quantum Link with X Profile...`;
        xProfileStatus.style.color = '#00ffff';

        try {
            const fakeUsernames = ["@QuantumAnarchist", "@CipherMaestro", "@SolanaGuru", "@DarkWebKing", "@AUSD_Rebel"];
            const selectedUsername = fakeUsernames