// 颜色渐变
function startColorPulse() {
    // 获取根和元素
    const root = document.documentElement;
    const color1 = getComputedStyle(root).getPropertyValue('--bg-color-1').trim();
    const color2 = getComputedStyle(root).getPropertyValue('--bg-color-2').trim();

    // 代理变量
    const colorProxy = { color1, color2 };

    gsap.to(colorProxy, {
        color1: color2,
        color2: color1,
        duration: 3,
        // 无限循环
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        // 应用到变量
        onUpdate: () => {
            root.style.setProperty('--bg-color-1', colorProxy.color1);
            root.style.setProperty('--bg-color-2', colorProxy.color2);
        }
    });
}

function setUpFireworks() {
    const canvas = document.getElementById('fireworksCanvas');
    const ctx = canvas.getContext('2d');

    // 对象池，避免频繁 GC
    const pool = [];
    const active = [];

    const COLORS = [
        [0, 245, 255],
        [224, 176, 255],
        [255, 248, 225]
    ];
    const PARTICLE_COUNT = 30;
    const TRAIL_LENGTH = 12;
    const FADE_STEP = 0.02;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    // 粒子用普通对象 + 对象池，避免 class 实例化开销
    function getParticle(x, y) {
        const p = pool.length > 0 ? pool.pop() : {
            history: [],
            color: null,
            x: 0, y: 0,
            vx: 0, vy: 0,
            alpha: 0,
            radius: 0
        };

        p.x = x;
        p.y = y;
        p.radius = 1.6;
        p.alpha = 1;

        const c = COLORS[(Math.random() * 3) | 0];
        p.color = c;
        p.colorStr = `${c[0]},${c[1]},${c[2]}`;

        const angle = Math.random() * Math.PI * 2;
        const force = Math.random() * 5 + 2;
        p.vx = Math.cos(angle) * force;
        p.vy = Math.sin(angle) * force;

        // 复用 history 数组
        p.history.length = 0;
        p.history.push({ x, y });

        return p;
    }

    function recycleParticle(p) {
        pool.push(p);
    }

    function createFirework(x, y) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            active.push(getParticle(x, y));
        }
    }

    // 预先构建拖尾绘制路径，减少 ctx 状态切换
    function drawParticle(p) {
        const hist = p.history;
        const len = hist.length;
        const cs = p.colorStr;
        const alpha = p.alpha;

        // 拖尾：一条渐变路径，分段绘制以实现透明度渐变
        if (len > 1) {
            for (let i = 1; i < len; i++) {
                const ta = alpha * (i / len);
                ctx.beginPath();
                ctx.moveTo(hist[i - 1].x, hist[i - 1].y);
                ctx.lineTo(hist[i].x, hist[i].y);
                ctx.strokeStyle = `rgba(${cs},${ta})`;
                ctx.lineWidth = p.radius * (i / len); // 头部最粗
                ctx.stroke();
            }
        }

        // 头部光点
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cs},${alpha})`;
        ctx.fill();
    }

    function updateParticle(p) {
        p.vx *= 0.95;
        p.vy = p.vy * 0.95 + 0.15;
        p.x += p.vx;
        p.y += p.vy;

        const hist = p.history;
        // 复用历史点对象，减少对象创建
        if (hist.length >= TRAIL_LENGTH) {
            const old = hist.shift();
            old.x = p.x;
            old.y = p.y;
            hist.push(old);
        } else {
            hist.push({ x: p.x, y: p.y });
        }

        p.alpha -= FADE_STEP;
    }

    let rafId;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 关闭 shadowBlur（原代码设置了 shadowColor 但未显式关闭，开销大）
        ctx.shadowBlur = 0;

        for (let i = active.length - 1; i >= 0; i--) {
            const p = active[i];
            updateParticle(p);
            if (p.alpha > 0) {
                drawParticle(p);
            } else {
                active.splice(i, 1);
                recycleParticle(p);
            }
        }

        // 没有粒子时暂停 RAF，节省 CPU
        rafId = (active.length > 0 || rafId == null)
            ? requestAnimationFrame(animate)
            : null;
    }

    // 首次启动
    rafId = requestAnimationFrame(animate);

    function onPointer(x, y) {
        createFirework(x, y);
        // 若动画已暂停则重启
        if (!rafId) rafId = requestAnimationFrame(animate);
    }

    window.addEventListener('mousedown', e => onPointer(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchstart', e => onPointer(e.touches[0].clientX, e.touches[0].clientY), { passive: true });

    return { launch: onPointer };
}

// 启动
startColorPulse();
setUpFireworks();
window.firework = setUpFireworks();