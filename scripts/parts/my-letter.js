class MyLetter {
    isOpen = false;
    inProcess = false;

    // 入场动画
    async enterAnime() {
        console.log("Page <MyLetter> entering..");
        // 开始入场前就设置 flag
        this.inProcess = true;
        const tl = gsap.timeline();
        tl.set("#my-letter", {
            display: "flex",
            // onComplete: () => {
            //     this.inProcess = false
            //     this.isOpen = true;
            //     console.log("Page <MyLetter> entered");
            // },
        })
        await window.loadSvg(
            "../../assets/images/my-letter/test.svg",
            document.getElementById("myl-svg-box"),
            tl,
        );
        tl.to("#myl-txt", {
            y: 0,
            duration: 1.6,
            ease: "elastic.out(0.6,0.7)",
        }, "<");
        await window.animateTextIn(
            "我记得严苛班规下，我因为吵闹被班主任记下的那些“正”字；更记得身为组长的你，从未有过半句指责。你独有的那份温柔与包容，在那时就已初见端倪。",
            document.getElementById("myl-txt"),
            tl,
            1,
            "<"
        );
        tl.add("finish");
        tl.to(".myl-option", {
            y: 0,
            stagger: 0.1,
            duration: 1.4,
            ease: "elastic.out(0.7,1.2)",
        }, "finish-=1.4");

        // 返回一个可供 await 的过程
        return tl;
    };
    //出场动画
    async leaveAnime() {
        if (this.inProcess) {
            console.warn("Page <MyLetter> Processing, don't touch it.");
            return;
        }
        console.log("Page <MyLetter> leaving..");
        this.inProcess = true;
        const tl = gsap.timeline();
        tl.set("#my-letter", {
            display: "none",
            onComplete: () => {
                // 出场完成后才设置 flag
                this.inProcess = false;
                this.isOpen = false;
                console.log("Page <MyLetter> leaved");
            },
        }, ">");
        // 返回一个可供 await 的过程
        return tl;
    }

    // 绑定监听器
    constructor() {
        const optionsBox = document.getElementById("myl-options-box");
        const options = document.querySelectorAll(".myl-option");
        optionsBox.addEventListener("mouseenter", () => {
            options.forEach((otherElement) => {
                otherElement.setAttribute("paused", "true");
            });
        });
        optionsBox.addEventListener("mouseleave", () => {
            options.forEach((otherElement) => {
                otherElement.removeAttribute("paused");
            });
        });

        options.forEach((activeElement, activeIndex) => {
            activeElement.addEventListener("mouseenter", () => {
                options.forEach((otherElement, otherIndex) => {
                    if (otherIndex != activeIndex) {
                        otherElement.classList.add("blur");
                    }
                });
            });

            activeElement.addEventListener("mouseleave", () => {
                options.forEach((otherElement, otherIndex) => {
                    if (otherIndex != activeIndex) {
                        otherElement.classList.remove("blur");
                    }
                });
            });
        });
    }
}

// 实例化
window.pages["my-letter"] = new MyLetter();