// 注册插件
gsap.registerPlugin(SplitText);

/**
 * 文字入场动画
 * @param {string} text - 要展示的文本内容
 * @param {HTMLElement} container - 目标 DOM 容器
 * @param {number} duration - 动画时长
 * @returns {Promise} - 动画完成后的 Promise
 */
window.animateTextIn = async function (text, container, duration = 0.8) {
    container.innerText = text;
    const split = new SplitText(container, { type: "chars" });
    const chars = split.chars;

    const fontSizePx = parseFloat(window.getComputedStyle(container).fontSize);

    // 初始化状态
    gsap.set(chars, {
        opacity: 0,
        filter: "blur(12px)",
        x: fontSizePx * 2,
        force3D: true
    });

    const punctuation = /[\,，\.。\?？\!！；…]/;
    let delayAccumulator = 0;

    // 返回一个 Promise，并在动画 timeline 结束时 resolve
    return new Promise((resolve) => {
        gsap.to(chars, {
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
            onComplete: () => {
                split.revert(); // 清理标签，恢复 DOM 原貌
                resolve();
            }
        });
    });
};