// 注册插件
gsap.registerPlugin(SplitText);

/**
 * 文字入场动画
 * @param {string} text - 要展示的文本内容
 * @param {HTMLElement} container - 目标 DOM 容器
 * @param {Object} tl - 要操作的时间线
 * @param {number} duration - 动画时长
 * @param {String} order - 动画顺序
 * @param {Function} onStart - 启动钩子
 */
window.animateTextIn = async function (text, container, tl, duration = 0.8, order = "<", onStart) {
    console.log("Text animate adding..");

    container.innerText = text;
    const split = new SplitText(container, { type: "chars" });
    const chars = split.chars;

    const fontSizePx = parseFloat(window.getComputedStyle(container).fontSize);

    // 初始化状态
    gsap.set(chars, {
        opacity: 0,
        filter: "blur(12px)",
        x: fontSizePx * 2,
        force3D: true,

        onComplete: () => console.log("Text entering.."),
    });

    const punctuation = /[\,，\.。\?？\!！；…]/;
    let delayAccumulator = 0;

    tl.to(chars, {
        opacity: 1,
        filter: "blur(0px)",
        x: 0,
        duration,
        ease: "power3.out",
        stagger: (index, target) => {
            const isPunctuation = punctuation.test(target.innerText);
            const currentDelay = delayAccumulator;
            delayAccumulator += 0.03 + (isPunctuation ? 0.1 : 0);
            return currentDelay;
        },
        onStart,
        onComplete: () => {
            split.revert(); // 清理标签，恢复 DOM 原貌
            console.log("Text entered");
        }
    }, order);

    console.log("Text animate added");
};