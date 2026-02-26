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

    const pool = [];
    const active = [];

    const COLORS = [
        [0, 245, 255],
        [224, 176, 255],
        [255, 248, 225]
    ];
    const PARTICLE_COUNT = 40;
    const TRAIL_LENGTH = 12;
    const FADE_STEP = 0.02;

    // 颜色字符串预计算
    // alpha 以 FADE_STEP(0.02) 为步长，共 51 档，避免每帧拼接字符串
    const ALPHA_STEPS = Math.ceil(1 / FADE_STEP) + 1; // 51
    const COLOR_CACHE = {}; // colorStr -> String[51]
    for (const c of COLORS) {
        const cs = `${c[0]},${c[1]},${c[2]}`;
        COLOR_CACHE[cs] = Array.from({ length: ALPHA_STEPS }, (_, i) => {
            const a = Math.min(1, i * FADE_STEP).toFixed(2);
            return `rgba(${cs},${a})`;
        });
    }

    function alphaStyle(colorStr, alpha) {
        const idx = Math.max(0, Math.min(ALPHA_STEPS - 1, (alpha / FADE_STEP + 0.5) | 0));
        return COLOR_CACHE[colorStr][idx];
    }

    // FPS 自适应质量
    let frameCount = 0;
    let lastFpsCheck = performance.now();
    let qualityLevel = 1; // 1 = 高质量，0.5 = 中，0.25 = 低

    function checkFps() {
        frameCount++;
        const now = performance.now();
        if (now - lastFpsCheck >= 1000) {
            const fps = frameCount * 1000 / (now - lastFpsCheck);
            frameCount = 0;
            lastFpsCheck = now;
            qualityLevel = Math.max(0.2, Math.min(1, (fps - 20) / 40));
        }
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Float32Array 环形缓冲区替代 {x,y} 对象数组
    function getParticle(x, y) {
        const p = pool.length > 0 ? pool.pop() : {
            histX: new Float32Array(TRAIL_LENGTH),
            histY: new Float32Array(TRAIL_LENGTH),
            histHead: 0,
            histLen: 0,
            colorStr: null,
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
        p.colorStr = `${c[0]},${c[1]},${c[2]}`;

        const angle = Math.random() * Math.PI * 2;
        const force = Math.random() * 5 + 2;
        p.vx = Math.cos(angle) * force;
        p.vy = Math.sin(angle) * force;

        // 初始化环形缓冲区
        p.histHead = 0;
        p.histLen = 1;
        p.histX[0] = x;
        p.histY[0] = y;

        return p;
    }

    function recycleParticle(p) {
        pool.push(p);
    }

    // 粒子数按质量等级缩放
    function createFirework(x, y) {
        const count = Math.max(20, (PARTICLE_COUNT * qualityLevel) | 0);
        for (let i = 0; i < count; i++) {
            active.push(getParticle(x, y));
        }
    }
    function drawParticle(p) {
        const cs = p.colorStr;
        const len = p.histLen;
        const head = p.histHead;
        if (len < 2) return;

        // 从环形缓冲区还原有序点
        const pts = [];
        for (let i = 0; i < len; i++) {
            const idx = (head - len + 1 + i + TRAIL_LENGTH) % TRAIL_LENGTH;
            pts.push(p.histX[idx], p.histY[idx]); // 扁平化存储，避免对象
        }
        // pts = [x0,y0, x1,y1, ..., x(len-1),y(len-1)]

        // 计算每个点的法向量，向两侧偏移构成 ribbon 轮廓
        const left = [], right = [];
        for (let i = 0; i < len; i++) {
            const x = pts[i * 2], y = pts[i * 2 + 1];
            const w = p.radius * (i / (len - 1)); // 尾部=0，头部=radius

            // 用相邻点差值估算切线，取垂直方向为法线
            const px = i > 0 ? pts[(i - 1) * 2] : pts[(i + 1) * 2];
            const py = i > 0 ? pts[(i - 1) * 2 + 1] : pts[(i + 1) * 2 + 1];
            const qx = i < len - 1 ? pts[(i + 1) * 2] : pts[i * 2];
            const qy = i < len - 1 ? pts[(i + 1) * 2 + 1] : pts[i * 2 + 1];

            let nx = qy - py, ny = px - qx;
            const nl = Math.sqrt(nx * nx + ny * ny) || 1;
            nx = nx / nl * w;
            ny = ny / nl * w;

            left.push(x + nx, y + ny);
            right.push(x - nx, y - ny);
        }

        // 渐变：从尾部（透明）→ 头部（不透明）
        const tx = pts[0], ty = pts[1];
        const hx = pts[(len - 1) * 2], hy = pts[(len - 1) * 2 + 1];
        const grad = ctx.createLinearGradient(tx, ty, hx, hy);
        grad.addColorStop(0, `rgba(${cs},0)`);
        grad.addColorStop(1, alphaStyle(cs, p.alpha));

        // 一次 fill 绘制整条拖尾
        ctx.beginPath();
        ctx.moveTo(left[0], left[1]);
        for (let i = 1; i < len; i++) ctx.lineTo(left[i * 2], left[i * 2 + 1]);
        for (let i = len - 1; i >= 0; i--) ctx.lineTo(right[i * 2], right[i * 2 + 1]);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // 头部光点不变
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = alphaStyle(cs, p.alpha);
        ctx.fill();
    }

    function updateParticle(p) {
        p.vx *= 0.95;
        p.vy = p.vy * 0.95 + 0.15;
        p.x += p.vx;
        p.y += p.vy;

        // 写入环形缓冲区，零动态对象分配
        const nextHead = (p.histHead + 1) % TRAIL_LENGTH;
        p.histX[nextHead] = p.x;
        p.histY[nextHead] = p.y;
        p.histHead = nextHead;
        if (p.histLen < TRAIL_LENGTH) p.histLen++;

        p.alpha -= FADE_STEP;
    }

    let rafId;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.shadowBlur = 0;

        checkFps(); // 每帧采样一次

        // O(1) swap+pop 替代 splice
        for (let i = active.length - 1; i >= 0; i--) {
            const p = active[i];
            updateParticle(p);
            if (p.alpha > 0) {
                drawParticle(p);
            } else {
                // swap 末尾元素到当前位置，再 pop，避免 O(n) 移位
                active[i] = active[active.length - 1];
                active.pop();
                recycleParticle(p);
            }
        }

        rafId = (active.length > 0 || rafId == null)
            ? requestAnimationFrame(animate)
            : null;
    }

    rafId = requestAnimationFrame(animate);

    function onPointer(x, y) {
        createFirework(x, y);
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