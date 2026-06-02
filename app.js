/* ============================================
   NEUROFUND — Interactive Features
   ============================================ */

(function() {
    'use strict';

    // ---- Neural Network Canvas ----
    const canvas = document.getElementById('neuralCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let nodes = [];
        let mouseX = 0, mouseY = 0;
        let animFrame;

        function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        function createNodes() {
            nodes = [];
            const count = Math.floor((canvas.width * canvas.height) / 18000);
            for (let i = 0; i < count; i++) {
                nodes.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    r: Math.random() * 1.5 + 0.8
                });
            }
        }

        function drawNetwork() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < nodes.length; i++) {
                const a = nodes[i];

                // Mouse influence
                const dx = mouseX - a.x;
                const dy = mouseY - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    const force = (200 - dist) / 200 * 0.008;
                    a.vx += dx * force;
                    a.vy += dy * force;
                }

                a.x += a.vx;
                a.y += a.vy;
                a.vx *= 0.99;
                a.vy *= 0.99;

                // Wrap
                if (a.x < 0) a.x = canvas.width;
                if (a.x > canvas.width) a.x = 0;
                if (a.y < 0) a.y = canvas.height;
                if (a.y > canvas.height) a.y = 0;

                // Draw connections
                for (let j = i + 1; j < nodes.length; j++) {
                    const b = nodes[j];
                    const ddx = a.x - b.x;
                    const ddy = a.y - b.y;
                    const d = Math.sqrt(ddx * ddx + ddy * ddy);
                    if (d < 120) {
                        const alpha = (1 - d / 120) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(0, 212, 170, ${alpha})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }

                // Draw node
                ctx.beginPath();
                ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 212, 170, 0.5)';
                ctx.fill();
            }

            animFrame = requestAnimationFrame(drawNetwork);
        }

        resizeCanvas();
        createNodes();
        drawNetwork();

        window.addEventListener('resize', () => {
            resizeCanvas();
            createNodes();
        });

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
    }

    // ---- Animated Counters ----
    function animateCounter(el) {
        const target = parseFloat(el.dataset.target);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const isDecimal = el.dataset.decimal === 'true';
        const duration = 2000;
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            let current = target * eased;

            if (target > 10000) {
                current = Math.floor(current).toLocaleString();
            } else if (isDecimal) {
                current = current.toFixed(1);
            } else {
                current = Math.floor(current).toLocaleString();
            }

            el.textContent = prefix + current + suffix;

            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    // ---- Donut Chart ----
    function drawDonut() {
        const canvas = document.getElementById('donutChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const cx = 160, cy = 160, outerR = 140, innerR = 90;
        const segments = [
            { pct: 50, color: '#00D4AA' },
            { pct: 20, color: '#F5A623' },
            { pct: 15, color: '#6366f1' },
            { pct: 15, color: '#8b5cf6' }
        ];

        let progress = 0;
        const duration = 1500;
        const start = performance.now();

        function draw(now) {
            const elapsed = now - start;
            progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            ctx.clearRect(0, 0, 320, 320);

            let angle = -Math.PI / 2;
            const gap = 0.03;

            segments.forEach((seg, i) => {
                const sweep = (seg.pct / 100) * Math.PI * 2 * eased;
                ctx.beginPath();
                ctx.arc(cx, cy, outerR, angle + gap / 2, angle + sweep - gap / 2);
                ctx.arc(cx, cy, innerR, angle + sweep - gap / 2, angle + gap / 2, true);
                ctx.closePath();
                ctx.fillStyle = seg.color;
                ctx.fill();
                angle += (seg.pct / 100) * Math.PI * 2;
            });

            if (progress < 1) requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);
    }

    // ---- Performance Chart ----
    function drawPerfChart() {
        const canvas = document.getElementById('perfChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        canvas.width = canvas.offsetWidth * 2;
        canvas.height = 400;
        ctx.scale(2, 2);

        const w = canvas.offsetWidth;
        const h = 200;
        const padding = { top: 20, right: 20, bottom: 30, left: 60 };

        // Mock data — cumulative gains over time
        const data = [0, 12, 28, 35, 52, 48, 67, 89, 95, 118, 142, 155, 178, 210, 245, 278, 310, 342, 389, 425, 468, 510, 567, 612, 678, 721, 780, 834, 891];
        const labels = ['Jan', '', '', 'Apr', '', '', 'Jul', '', '', 'Oct', '', '', 'Jan', '', '', 'Apr', '', '', 'Jul', '', '', 'Oct', '', '', 'Jan', '', '', 'Apr', ''];

        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;
        const maxVal = Math.max(...data) * 1.1;

        // Grid lines
        ctx.strokeStyle = 'rgba(26, 39, 68, 0.8)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(w - padding.right, y);
            ctx.stroke();

            // Y labels
            const val = Math.round(maxVal - (maxVal / 4) * i);
            ctx.fillStyle = '#4a5d7a';
            ctx.font = '10px "JetBrains Mono"';
            ctx.textAlign = 'right';
            ctx.fillText('$' + (val / 1000).toFixed(0) + 'k', padding.left - 8, y + 4);
        }

        // X labels
        ctx.fillStyle = '#4a5d7a';
        ctx.font = '10px "JetBrains Mono"';
        ctx.textAlign = 'center';
        data.forEach((_, i) => {
            if (labels[i]) {
                const x = padding.left + (chartW / (data.length - 1)) * i;
                ctx.fillText(labels[i], x, h - 6);
            }
        });

        // Animate the line drawing
        let progress = 0;
        const duration = 2000;
        const startTime = performance.now();

        function animateLine(now) {
            const elapsed = now - startTime;
            progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const drawCount = Math.floor(data.length * eased);

            // Clear chart area only
            ctx.clearRect(padding.left - 1, padding.top - 1, chartW + 2, chartH + 2);

            // Redraw grid
            ctx.strokeStyle = 'rgba(26, 39, 68, 0.8)';
            ctx.lineWidth = 0.5;
            for (let i = 0; i <= 4; i++) {
                const y = padding.top + (chartH / 4) * i;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(w - padding.right, y);
                ctx.stroke();
            }

            if (drawCount < 2) {
                if (progress < 1) requestAnimationFrame(animateLine);
                return;
            }

            // Area fill
            ctx.beginPath();
            for (let i = 0; i < drawCount; i++) {
                const x = padding.left + (chartW / (data.length - 1)) * i;
                const y = padding.top + chartH - (data[i] / maxVal) * chartH;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            const lastX = padding.left + (chartW / (data.length - 1)) * (drawCount - 1);
            ctx.lineTo(lastX, padding.top + chartH);
            ctx.lineTo(padding.left, padding.top + chartH);
            ctx.closePath();
            const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
            grad.addColorStop(0, 'rgba(0, 212, 170, 0.15)');
            grad.addColorStop(1, 'rgba(0, 212, 170, 0)');
            ctx.fillStyle = grad;
            ctx.fill();

            // Line
            ctx.beginPath();
            for (let i = 0; i < drawCount; i++) {
                const x = padding.left + (chartW / (data.length - 1)) * i;
                const y = padding.top + chartH - (data[i] / maxVal) * chartH;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = '#00D4AA';
            ctx.lineWidth = 2;
            ctx.stroke();

            // End dot
            if (drawCount > 0) {
                const ex = padding.left + (chartW / (data.length - 1)) * (drawCount - 1);
                const ey = padding.top + chartH - (data[drawCount - 1] / maxVal) * chartH;
                ctx.beginPath();
                ctx.arc(ex, ey, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#00D4AA';
                ctx.fill();
            }

            if (progress < 1) requestAnimationFrame(animateLine);
        }

        requestAnimationFrame(animateLine);
    }

    // ---- Scroll Reveals ----
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Animate counters in this section
                entry.target.querySelectorAll('[data-target]').forEach(el => {
                    if (!el.dataset.animated) {
                        el.dataset.animated = 'true';
                        animateCounter(el);
                    }
                });

                // Animate token segments
                entry.target.querySelectorAll('.token-segment').forEach((seg, i) => {
                    setTimeout(() => seg.classList.add('visible'), i * 150);
                });

                // Animate flywheel steps
                entry.target.querySelectorAll('.flywheel-step').forEach((step, i) => {
                    setTimeout(() => step.classList.add('visible'), i * 200);
                });

                // Animate roadmap items
                entry.target.querySelectorAll('.timeline-item').forEach((item, i) => {
                    setTimeout(() => item.classList.add('visible'), i * 200);
                });

                // Trigger chart draws
                if (entry.target.querySelector('#donutChart')) drawDonut();
                if (entry.target.querySelector('#perfChart')) drawPerfChart();

                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.section').forEach(s => sectionObserver.observe(s));

    // Hero is always visible
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.opacity = '1';
        hero.style.transform = 'none';
        // Animate hero counters immediately
        setTimeout(() => {
            hero.querySelectorAll('[data-target]').forEach(el => {
                if (!el.dataset.animated) {
                    el.dataset.animated = 'true';
                    animateCounter(el);
                }
            });
        }, 500);
    }

    // ---- Navbar Shrink ----
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (nav) {
            nav.style.padding = window.scrollY > 50 ? '8px 0' : '14px 0';
        }
    });

    // ---- Staking Calculator ----
    const calcInput = document.getElementById('holdPct');
    const calcShare = document.getElementById('calcShare');
    if (calcInput && calcShare) {
        const cycleDist = 342000;
        function updateCalc() {
            const pct = parseFloat(calcInput.value) || 0;
            const share = (pct / 100) * cycleDist;
            calcShare.textContent = '$' + share.toLocaleString(undefined, { maximumFractionDigits: 0 });
        }
        calcInput.addEventListener('input', updateCalc);
        updateCalc();
    }

    // ---- Mobile Menu ----
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
    }

    // ---- Smooth scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    console.log('NeuroFund loaded. AI trades. You earn.');
})();
