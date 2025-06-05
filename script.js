document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('plasmaCanvas');
    const ctx = canvas.getContext('2d');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let particles = [];
    const maxParticles = 500; // Increased for more density
    let isMouseMoving = false;
    let mouseMoveTimer;

    // Adjust canvas size on load and resize
    const setCanvasSize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    setCanvasSize(); // Initial set
    window.addEventListener('resize', setCanvasSize);

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMouseMoving = true;
        clearTimeout(mouseMoveTimer);
        mouseMoveTimer = setTimeout(() => {
            isMouseMoving = false;
        }, 100); // Consider mouse stopped if no movement for 100ms
    });

    class Particle {
        constructor(x, y, color, speedMultiplier = 1) {
            this.x = x;
            this.y = y;
            this.baseSize = Math.random() * 1.5 + 0.5; // Smaller base size
            this.size = this.baseSize;
            this.color = color;
            this.speedX = (Math.random() - 0.5) * 2 * speedMultiplier; // Faster initial burst
            this.speedY = (Math.random() - 0.5) * 2 * speedMultiplier; // Faster initial burst
            this.alpha = 1; // Start fully visible
            this.life = 0;
            this.maxLife = Math.random() * 60 + 30; // Longer life for particles
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.alpha -= 1 / this.maxLife; // Fade out linearly
            this.size = this.baseSize * (this.alpha > 0 ? this.alpha : 0); // Size reduces with alpha
            this.life++;

            // Simulate "lightning" effect - change direction randomly
            if (Math.random() < 0.05) { // Small chance to change direction
                this.speedX = (Math.random() - 0.5) * 3;
                this.speedY = (Math.random() - 0.5) * 3;
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

    let lastSpiralPoint = { x: mouseX, y: mouseY };

    function animatePlasma() {
        ctx.fillStyle = 'rgba(13, 13, 26, 0.1)'; // Very subtle fade out with residual trails
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Draw transparent rectangle over old frames

        let currentX = mouseX;
        let currentY = mouseY;

        // If mouse is stopped, create a pulsating spiral
        if (!isMouseMoving) {
            const timeFactor = performance.now() * 0.0005;
            const spiralRadius = 50 + Math.sin(timeFactor * 2) * 30; // Pulsating size
            const spiralAngle = timeFactor * 5;

            currentX = mouseX + Math.cos(spiralAngle) * spiralRadius;
            currentY = mouseY + Math.sin(spiralAngle) * spiralRadius;
        }

        // Generate color from purple to electric blue to magenta
        const hue = (performance.now() * 0.002) % 360; // Slower color shift for subtlety
        const color = `hsl(${hue}, 90%, 65%)`; // Vibrant colors

        // Draw a line segment connecting previous and current point for lightning/ray effect
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5; // Thicker lines
        ctx.beginPath();
        ctx.moveTo(lastSpiralPoint.x, lastSpiralPoint.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        // Add particles along the line segment for density and trail
        const distance = Math.hypot(currentX - lastSpiralPoint.x, currentY - lastSpiralPoint.y);
        const segments = Math.max(1, Math.floor(distance / 5)); // More particles for longer moves

        for (let i = 0; i < segments; i++) {
            const ratio = i / segments;
            const px = lastSpiralPoint.x + (currentX - lastSpiralPoint.x) * ratio;
            const py = lastSpiralPoint.y + (currentY - lastSpiralPoint.y) * ratio;
            particles.push(new Particle(px, py, color, isMouseMoving ? 1.5 : 0.8)); // Faster particles when moving
        }

        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].alpha <= 0 || particles[i].life > particles[i].maxLife) {
                particles.splice(i, 1);
                i--;
            }
        }

        // Limit the total number of particles
        if (particles.length > maxParticles) {
            particles.splice(0, particles.length - maxParticles);
        }

        lastSpiralPoint = { x: currentX, y: currentY }; // Update last point

        requestAnimationFrame(animatePlasma);
    }

    animatePlasma();
});