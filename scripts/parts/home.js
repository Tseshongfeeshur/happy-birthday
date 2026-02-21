class Home {
    isOpen = false;
    inProcess = false;
    // 入场动画
    async enterAnime() {
        console.log("Page <Home> entering..");
        // 开始入场前就设置 flag
        this.inProcess = true;
        const tl = gsap.timeline();
        tl
            .set("#home", {
                display: "block",
            })
            .fromTo("#home-title-box", {
                opacity: 1,
                y: -(window.innerHeight * 0.2 + parseFloat(getComputedStyle(document.documentElement).fontSize) * 11.2),
            }, {
                y: 0,
                duration: 1.2,
                ease: "elastic.out(1,0.7)",
                delay: 0.3,
                overwrite: "auto",
            })
            .fromTo("#about-button", {
                opacity: 1,
                y: "5rem",
            }, {
                y: 0,
                duration: 1.2,
                ease: "elastic.out(1,0.7)",
                delay: 0.1,
                overwrite: "auto",
            }, "<")
            .fromTo("#home-button", {
                opacity: 1,
                scale: 0,
            }, {
                scale: 1,
                duration: 1.2,
                ease: "elastic.out(1,0.7)",
                delay: 0.2,
                overwrite: "auto",
                onComplete: () => {
                    this.inProcess = false
                    this.isOpen = true;
                    console.log("Page <Home> entered");
                },
            }, "<");
        // 返回一个可供 await 的过程
        return tl;
    };
    //出场动画
    async leaveAnime() {
        if (this.inProcess) {
            console.warn("Page <Home> Processing, don't touch it.");
            return;
        }
        console.log("Page <Home> leaving..");
        this.inProcess = true;
        const tl = gsap.timeline();
        tl
            .to("#home-title-box", {
                y: -(window.innerHeight * 0.2 + parseFloat(getComputedStyle(document.documentElement).fontSize) * 11.2),
                opacity: 0,
                duration: 0.4,
                ease: "power2.out",
                delay: 0.1,
            })
            .to("#home-button", {
                scale: 1.6,
                opacity: 0,
                duration: 0.4,
                ease: "power2.out",
            }, "<")
            .to("#about-button", {
                y: "5rem",
                opacity: 0,
                duration: 0.4,
                ease: "power2.out",
            }, "<");

        tl.set("#home", {
            display: "none",
            onComplete: () => {
                // 出场完成后才设置 flag
                this.inProcess = false;
                this.isOpen = false;
                console.log("Page <Home> leaved");
            },
        }, "+=0");
        // 返回一个可供 await 的过程
        return tl;
    }
    async openAbout() {
        const notifyProcessing = () => window.notify("动画正在进行，请稍等");
        console.log("Widget <About> opening..");
        const vh = window.innerHeight; // 预计算，避免 dvh 实时求值

        const tl = gsap.timeline();
        tl
            .set(".about-item", {
                y: vh,          // px 替代 "100dvh"
            }, "<")
            .set("#about-box", {
                display: "flex",
                onComplete: () => document.getElementById("about-box").addEventListener("click", notifyProcessing),
            }, "<")
            .to("#home-title-box", {
                opacity: 0,
                ease: "power2.out",
                delay: 0.1,
            })
            .to("#home-button", {
                opacity: 0,
                ease: "power2.out"
            }, "<")
            .to("#about-button", {
                opacity: 0,
                ease: "power2.out"
            }, "<")
            .fromTo("#about-bg", {
                display: "block",
                opacity: 0
            }, {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out"
            }, "<");

        const aboutItems = document.querySelectorAll(".about-item");
        tl.to(aboutItems, {
            y: 0,
            duration: 1.2,
            ease: "elastic.out(0.8, 0.7)",
            stagger: 0.02,
            onComplete: () => {
                document.getElementById("about-box").removeEventListener("click", notifyProcessing);
                document.getElementById("about-box").addEventListener("click", this.closeAbout);
                console.log("Widget <About> opened");
            },
        }, "<+=0.4");

        return tl;
    }

    async closeAbout(e) {
        const aboutLayer = document.getElementById("about-box");
        if (e.target != aboutLayer) return;

        console.log("Widget <About> closing..");
        aboutLayer.removeEventListener("click", this.closeAbout);

        const vh = window.innerHeight;
        const aboutItems = document.querySelectorAll(".about-item");

        const tl = gsap.timeline();
        tl
            .to(aboutItems, {
                y: vh,
                duration: 0.8,
                ease: "power2.inOut",
                stagger: -0.02,
            })
            .to("#about-bg", {
                opacity: 0,
                duration: 0.4,
                ease: "power2.in"
            }, "<")
            .to("#home-title-box", {
                opacity: 1,
                ease: "power2.out"
            }, ">")
            .to("#home-button", {
                opacity: 1,
                ease: "power2.out"
            }, "<")
            .to("#about-button", {
                opacity: 1,
                ease: "power2.out"
            }, "<")
            .set("#about-box", {
                display: "none"
            }, ">")
            .set("#about-bg", {
                display: "none",
                onComplete: () => console.log("Widget <About> closed"),
            }, "<");

        return tl;
    }
    // 绑定监听器
    constructor() {
        this.closeAbout = this.closeAbout.bind(this);
        this.openAbout = this.openAbout.bind(this);
        const homeButton = document.getElementById("home-button");
        homeButton.addEventListener("click", () => {
            window.goToPage("alohomora");
        });
        const aboutButton = document.getElementById("about-button");
        aboutButton.addEventListener("click", () => {
            this.openAbout();
        });
    }
}

// 实例化
window.pages["home"] = new Home();