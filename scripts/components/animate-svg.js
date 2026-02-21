// 注册插件
gsap.registerPlugin(DrawSVGPlugin);/**
 * SVG 描边动画
 * @param {string} url - SVG 文件地址
 * @param {HTMLElement} container - 目标 DOM 容器
 * @param {number} duration - 动画时长
 * @returns {Promise} - 动画完成后的 Promise
 */

window.loadSvg = async function (url, container, duration = 1.4) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const svgText = await response.text();
        container.innerHTML = svgText;

        const paths = container.querySelectorAll("path, circle, rect, polyline");
        if (paths.length === 0) return;

        gsap.set(paths, { drawSVG: "0%" });

        // 返回一个 Promise，确保动画结束后 resolve
        return gsap.to(paths, {
            drawSVG: "100%",
            duration,
            stagger: 0.06,
            ease: "power2.inOut",
        });

    } catch (error) {
        console.error("Load SVG error:", error);
        throw error; // 将错误向上抛出，以便调用者捕获
    }
}

window.removeSvg = async function (container, duration = 1) {
    try {
        const paths = container.querySelectorAll("path, circle, rect, polyline");
        if (paths.length === 0) return;

        // 返回一个 Promise，确保动画结束后 resolve
        return gsap.to(paths, {
            drawSVG: "0%",
            duration,
            ease: "power2.out",
        });

    } catch (error) {
        console.error("Remove SVG error:", error);
        throw error; // 将错误向上抛出，以便调用者捕获
    }
}