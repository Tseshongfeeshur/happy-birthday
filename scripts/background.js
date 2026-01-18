// 获取节点
const glow1 = document.getElementById('glow-1'); // 左上
const glow2 = document.getElementById('glow-2'); // 右下

// 缓动参数
const EASE_SETTING = "power1.out"; // 更加平滑的缓动
const DURATION = 0.5; // 动画持续时间（灵敏度）

// 跟随鼠标
function transByMouse() {
    // 监听鼠标并直接通过 GSAP 驱动动画
    window.addEventListener('mousemove', (e) => {
        // 若正在使用陀螺仪跟随则跳过鼠标事件
        if (usingSensor) return;

        // 计算目标偏移量
        const targetX = (e.clientX - window.innerWidth / 2) / 3;
        const targetY = (e.clientY - window.innerHeight / 2) / 3;

        // GSAP 自动处理平滑插值与 GPU 加速（force3D: true）
        gsap.to(glow1, {
            x: targetX,
            y: targetY,
            duration: DURATION,
            ease: EASE_SETTING,
            force3D: true
        });

        gsap.to(glow2, {
            x: -targetX,
            y: -targetY,
            duration: DURATION,
            ease: EASE_SETTING,
            force3D: true
        });
    });
}

// 跟随陀螺仪
let usingSensor = false;
function transBySensor() {
    // 设置全局 flag 停止鼠标跟随逻辑
    usingSensor = true;

    // 初始状态
    let initialBeta = 0;
    let initialGamma = 0;

    // 监听陀螺仪
    window.addEventListener('deviceorientation', (e) => {
        // 第一帧仅记录初始状态
        if (initialBeta === 0 && initialGamma === 0) {
            initialBeta = e.beta;
            initialGamma = e.gamma;
            return;
        }

        // 计算相对变化量并限制范围
        const relativeBeta = e.beta - initialBeta;
        const relativeGamma = e.gamma - initialGamma;
        const deltaSize = (Math.min(45, Math.max(-45, relativeBeta)) + Math.min(45, Math.max(-45, relativeGamma))) / 90;

        // 计算 Scale 值逻辑
        const scale1 = 1 - (deltaSize > 0 ? deltaSize / 2 : deltaSize);
        const scale2 = 1 + (deltaSize < 0 ? deltaSize / 2 : deltaSize);
        // 计算透明度
        const opacity1 = 0.6 - deltaSize * 0.2;
        const opacity2 = 0.6 + deltaSize * 0.2;

        // 使用 GSAP 执行属性变化
        gsap.to(glow1, {
            scale: scale1,
            opacity: opacity1,
            x: 0, // 陀螺仪模式下重置 X / Y
            y: 0,
            duration: 0.4,
            ease: "sine.out"
        });

        gsap.to(glow2, {
            scale: scale2,
            opacity: opacity2,
            x: 0,
            y: 0,
            duration: 0.4,
            ease: "sine.out"
        });
    });
}

// 升级为陀螺仪
function upToSensor() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS 设备提权
        DeviceOrientationEvent.requestPermission()
            .then(state => {
                if (state === 'granted') transBySensor();
            })
            .catch(console.error);
    } else if (window.DeviceOrientationEvent) {
        // Android 或已授权环境
        transBySensor();
    }
}

// 颜色渐变
function startColorPulse() {
    // 初始值
    const root = document.documentElement;
    const color1 = "rgb(12, 87, 226)";
    const color2 = "rgb(104, 18, 234)";

    // 颜色存储代理
    const colorProxy = {
        color1,
        color2
    };

    // 使用 GSAP 修改代理
    gsap.to(colorProxy, {
        color1: color2,
        color2: color1,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        // 更新插值结果
        onUpdate: () => {
            root.style.setProperty('--glow-color-1', colorProxy.color1);
            root.style.setProperty('--glow-color-2', colorProxy.color2);
        }
    });
}

// 启动，先跟随鼠标
transByMouse();
// 同时等待交互以跟随陀螺仪
window.addEventListener('click', upToSensor, { once: true });
// 开始颜色渐变
startColorPulse();