// 获取节点
const glow1 = document.getElementById('glow-1'); // 左上
const glow2 = document.getElementById('glow-2'); // 右下

// 缓动参数
const EASE_SETTING = "power1.out";
const DURATION = 1.5; // 响应鼠标的平滑度
const AUTO_DURATION = 4; // 自主漂浮完成一次移动的时间

// 状态存储
let mouseX = 0;
let mouseY = 0;
let autoX = 0;
let autoY = 0;

// 初始化边界限制
function getLimit() {
    return Math.max(window.innerWidth, window.innerHeight) * 0.5;
}

// 更新光晕位置
function updateGlowPosition() {
    gsap.to(glow1, {
        x: autoX + mouseX,
        y: autoY + mouseY,
        duration: DURATION,
        ease: EASE_SETTING,
        force3D: true
    });

    gsap.to(glow2, {
        x: -(autoX + mouseX),
        y: -(autoY + mouseY),
        duration: DURATION,
        ease: EASE_SETTING,
        force3D: true
    });
}

// 随时间缓动
function startAutonomousMotion() {
    const limit = getLimit() * 0.4; // 限制一部分自主缓动

    const move = () => {
        autoX = (Math.random() - 0.5) * limit;
        autoY = (Math.random() - 0.5) * limit;

        gsap.to({}, {
            duration: AUTO_DURATION + Math.random() * 2,
            onUpdate: updateGlowPosition,
            onComplete: move, // 递归
            ease: "sine.inOut"
        });
    };

    move();
}

// 颜色渐变
function startColorPulse() {
    const root = document.documentElement;
    const color1 = "rgb(12, 87, 226)";
    const color2 = "rgb(104, 18, 234)";

    const colorProxy = { color1, color2 };

    gsap.to(colorProxy, {
        color1: color2,
        color2: color1,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        onUpdate: () => {
            root.style.setProperty('--bg-color-1', colorProxy.color1);
            root.style.setProperty('--bg-color-2', colorProxy.color2);
        }
    });
}

// 监听鼠标移动
window.addEventListener('mousemove', (e) => {
    // 计算鼠标带来的偏移贡献
    mouseX = (e.clientX - window.innerWidth / 2) / 3;
    mouseY = (e.clientY - window.innerHeight / 2) / 3;

    // 立即触发位置更新
    updateGlowPosition();
});

// 初始化
startColorPulse();
startAutonomousMotion();