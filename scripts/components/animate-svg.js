// 注册插件
gsap.registerPlugin(DrawSVGPlugin);

/**
 * SVG 描边动画
 * @param {string} url - SVG 文件地址
 * @param {HTMLElement} container - 目标 DOM 容器
 * @param {Object} tl - 要操作的时间线
 * @param {number} duration - 动画时长
 * @param {String} order - 动画顺序
 */
window.loadSvg = async function (url, container, tl, duration = 1, order = "<") {
    console.log("SVG animate adding..");
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const svgText = await response.text();
        container.innerHTML = svgText;

        const paths = container.querySelectorAll("path, circle, rect, polyline");
        if (paths.length === 0) return;

        tl.fromTo(paths, {
            drawSVG: "0%"
        }, {
            drawSVG: "100%",
            duration,
            stagger: 0.06,
            ease: "power2.inOut",
            onStart: () => console.log("SVG entering.."),
            onComplete: () => console.log("SVG entered"),
        }, order);

        console.log("SVG animate added");
    } catch (error) {
        console.error("Load SVG error:", error);
        throw error; // 将错误向上抛出，以便调用者捕获
    }
}

/**
 * SVG 描边删除动画
 * @param {HTMLElement} container - 目标 DOM 容器
 * @param {Object} tl - 要操作的时间线
 * @param {number} duration - 动画时长
 * @param {String} order - 动画顺序
 */
window.removeSvg = async function (container, tl, duration = 0.6, order = "<") {
    try {
        const paths = container.querySelectorAll("path, circle, rect, polyline");
        if (paths.length === 0) return;

        // 返回一个 Promise，确保动画结束后 resolve
        tl.to(paths, {
            drawSVG: "0%",
            duration,
            ease: "power2.in",
        }, order);
    } catch (error) {
        console.error("Remove SVG error:", error);
        throw error; // 将错误向上抛出，以便调用者捕获
    }
}