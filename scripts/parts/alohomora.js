class Alohomora {
    isOpen = false;
    inProcess = false;

    // 入场动画
    async enterAnime() {
        console.log("Page <Alohomora> entering..");
        // 开始入场前就设置 flag
        this.inProcess = true;
        const tl = gsap.timeline();
        tl
            .set("#alohomora", {
                display: "block",
            })
            .call(() => {
                window.loadSvg("/images/alohomora/1.svg", document.getElementById("alohomora-svg-box"));
            }, null, 0)
            .call(() => {
                const width = window.innerWidth;
                for (let i = 0; i < 10; i++) {
                    setTimeout(() => {
                        window.firework.launch(Math.random() * width * 0.8 + width * 0.1, Math.random() * window.innerHeight * 0.2 + 20);
                    }, i * 140);
                }
                window.animateTextIn("Happy Birthday!", document.getElementById("alohomora-words"), 2);
            }, null, 3.6)
            .fromTo("#alohomora-button", {
                opacity: 1,
                scale: 0,
            }, {
                scale: 1,
                duration: 1.2,
                ease: "elastic.out(1,0.7)",
                overwrite: "auto",
                onComplete: () => {
                    this.inProcess = false;
                    this.isOpen = true;
                    console.log("Page <Alohomora> entered");
                },
            }, ">+=2");

        // 返回一个可供 await 的过程
        return tl;
    }
    //出场动画
    async leaveAnime() {
        if (this.inProcess) {
            console.warn("Page <Alohomora> Processing, don't touch it");
            return 1;
        }
        console.log("Page <Alohomora> leaving..");
        const tl = gsap.timeline();
        tl
            .call(() => {
                window.removeSvg(document.getElementById("alohomora-svg-box"));
            }, null, 0)
            .to("#alohomora-words", {
                opacity: 0,
                duration: 0.2,
                ease: "power2.in",
                onComplete: () => {
                    document.getElementById("alohomora-words").innerHTML = "";
                }
            }, "<")
            .to("#alohomora-button", {
                scale: 1.6,
                opacity: 0,
                duration: 0.4,
                ease: "power2.out",
            }, "<")
            .set("#alohomora-words", {
                opacity: 1,
            }, ">")
            .set("#alohomora", {
                display: "none",
                onComplete: () => {
                    // 出场完成后才设置 flag
                    this.inProcess = false;
                    this.isOpen = false;
                    console.log("Page <Alohomora> leaved");
                },
            }, ">");

        // 返回一个可供 await 的过程
        return tl;
    };
    // 绑定监听器
    constructor() {
        const alohomoraButton = document.getElementById("alohomora-button");
        alohomoraButton.addEventListener("click", () => {
            window.goToPage("my-letter");
        });
    }
}

// 实例化
window.pages["alohomora"] = new Alohomora();

