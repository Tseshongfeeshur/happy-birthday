/**
 * 动画阻塞提醒
 * @param {string} text - 要通知的文本内容
 */
window.notify = function (text) {
    const notify = document.getElementById("notify");
    if (notify.innerText == text) {
        const tl = gsap.timeline();
        tl
            .to("#notify", {
                scale: 1.1,
                duration: 0.2,
                ease: "power2.out",
            })
            .to("#notify", {
                scale: 1,
                duration: 0.5,
                ease: "elastic.out(1,0.7)",
            }, ">");
    } else {
        notify.innerText = text;
        const tl = gsap.timeline();
        tl
            .to("#notify", {
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: "elastic.out(1,1)",
            })
            .to("#notify", {
                y: "-5rem",
                duration: 0.5,
                ease: "power2.in",
                onComplete: () => notify.innerText = "",
            }, ">+=3");
    }
};