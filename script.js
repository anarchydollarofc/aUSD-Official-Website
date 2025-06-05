document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('spiralCanvas');
    const ctx = canvas.getContext('2d');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 2 + 0.5;
            this.color = color;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            // Gradually fade out
            this.size *= 0.98;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    let particles = [];
    const maxParticles = 300; // Limit particles to prevent performance issues

    function animateSpiral() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear entire canvas

        // Create new spiral segment
        const angle = performance.now() * 0.001; // Time-based movement
        const radius = 50 + Math.sin(angle * 0.5) * 40; // Pulsating radius

        const x = mouseX + Math.cos(angle * 5) * radius;
        const y = mouseY + Math.sin(angle * 5) * radius;

        // Color shifting based on time or mouse position
        const hue = (performance.now() * 0.005) % 360;
        const color = `hsl(${hue}, 80%, 60%)`; // Vivid, changing color

        // Draw main spiral line (thicker, more prominent)
        ctx.strokeStyle = color;
        ctx.lineWidth = 2; // Thicker line for the main spiral
        ctx.beginPath();
        if (particles.length > 0) {
            ctx.moveTo(particles[0].x, particles[0].y); // Start from previous point
            for (let i = 0; i < particles.length -1; i++) {
                // Draw a line connecting recent particles to form the spiral tail
                ctx.lineTo(particles[i].x, particles[i].y);
            }
        }
        ctx.lineTo(x, y); // Draw to current spiral point
        ctx.stroke();

        // Add particles trailing the main spiral
        for (let i = 0; i < 2; i++) { // Add a few particles per frame
            particles.push(new Particle(x, y, color));
        }
        
        // Update and draw existing particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].size < 0.5) { // Remove tiny, faded particles
                particles.splice(i, 1);
                i--;
            }
        }

        // Limit the total number of particles
        if (particles.length > maxParticles) {
            particles.splice(0, particles.length - maxParticles);
        }

        requestAnimationFrame(animateSpiral);
    }

    animateSpiral();
});