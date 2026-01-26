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

// 初始化
startColorPulse();