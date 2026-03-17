class MyLetter {
    isOpen = false;
    inProcess = false;

    // 入场动画
    async enterAnime(chapterIndex, lastOptionIndex) {
        if (!chapterIndex) {
            this.chapterIndex = 0;
            chapterIndex = 0;
        }
        console.log("Page <MyLetter> entering..");
        // 开始入场前就设置 flag
        this.inProcess = true;
        const tl = gsap.timeline();
        // tl.timeScale(0.1);
        tl.set("#my-letter", {
            display: "flex",
        })
        await window.loadSvg(
            `../../assets/images/my-letter/${chapterIndex}.svg`,
            document.getElementById("myl-svg-box"),
            tl,
        );
        tl.to("#myl-txt", {
            y: 0,
            duration: 1.6,
            ease: "elastic.out(0.6,0.7)",
            // 提前填充内容，触发重排
            onStart: () => {
                const options = document.querySelectorAll(".myl-option");
                options.forEach((option, index) => {
                    const optionText = window.myLetter?.[chapterIndex]?.forks?.[index]?.option;
                    if (optionText) {
                        option.innerText = optionText;
                        option.classList.remove("hidden");
                    } else {
                        // 隐藏无内容选项
                        option.innerText = "";
                        option.classList.add("hidden");
                    }
                });
            },
        }, "<");
        await window.animateTextIn(`${window.myLetter[chapterIndex - 1]?.forks?.[lastOptionIndex]?.reaction || ""}${window.myLetter[chapterIndex].text}`,
            document.getElementById("myl-txt"),
            tl,
            1,
            "<"
        );
        tl.add("finishAddContent");
        tl.to(".myl-option", {
            y: 0,
            stagger: 0.1,
            duration: 1.4,
            ease: "elastic.out(0.7,1.2)",
            onComplete: () => {
                this.inProcess = false
                this.isOpen = true;
                console.log("Page <MyLetter> entered");
            },
        }, "finishAddContent-=1.4");

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
        await window.removeSvg(document.getElementById("myl-svg-box"), tl);
        tl
            .to("#myl-svg-box svg", {
                opacity: 0,
                duration: 0.6,
                ease: "power2.in",
            }, "<")
            .to("#myl-txt", {
                y: -1 * window.innerHeight,
                duration: 0.6,
                ease: "power2.in",
                onComplete: () => {
                    document.getElementById("myl-txt").innerHTML = "";
                }
            }, "<")
            .to(".myl-option", {
                y: -1 * window.innerHeight,
                duration: 0.6,
                stagger: 0.05,
                ease: "power2.in",
                onComplete: () => {
                    const options = document.querySelectorAll(".myl-option");
                    options.forEach((option) => {
                        option.dispatchEvent(new MouseEvent('mouseleave'));
                    });
                    // const optionsBox = document.getElementById("myl-options-box");
                    // optionsBox.dispatchEvent(new MouseEvent('mouseleave'));
                    // 会造成动画的小瑕疵
                },
            }, "<+=0.1")
            .set("#myl-txt", {
                y: window.innerHeight,
            }, ">")
            .set(".myl-option", {
                y: window.innerHeight,
            }, ">");
        tl.add("finishRemoveAll", ">");
        tl.set("#my-letter", {
            display: "none",
            onComplete: () => {
                // 出场完成后才设置 flag
                this.inProcess = false;
                this.isOpen = false;
                console.log("Page <MyLetter> leaved");
            },
        }, "finishRemoveAll");
        // 返回一个可供 await 的过程
        return tl;
    }

    // 绑定监听器
    constructor() {
        // Han(document.getElementById('myl-txt')).render();
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
            activeElement.addEventListener("click", async () => {
                if (this.inProcess) {
                    console.warn(`The last page is already in process`);
                    window.notify("请等待动画结束后再操作");
                    return;
                }
                else if (this.isOpen) await this.leaveAnime();
                await this.enterAnime(++this.chapterIndex, activeIndex);
            });
        });
    }
}

// 实例化
window.pages["my-letter"] = new MyLetter();