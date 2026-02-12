// 颜色渐变
function startColorPulse() {
    // 获取根和元素
    const root = document.documentElement;
    const color1 =getComputedStyle(root).getPropertyValue('--bg-color-1').trim();
    const color2 =getComputedStyle(root).getPropertyValue('--bg-color-2').trim();

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

// 启动
startColorPulse();