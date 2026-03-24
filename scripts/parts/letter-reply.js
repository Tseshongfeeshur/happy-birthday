class LetterReply {
    isOpen = false;
    inProcess = false;

    // 追加消息函数
    async addMessageNew(msgRole2, msgRole1) {
        const container = document.getElementById("lre-history");
        const tl = gsap.timeline();

        // Role 2
        const boxRole2 = document.createElement("div");
        boxRole2.classList.add(`lrec-role-2`);
        const cardRole2 = document.createElement("glass-card");
        boxRole2.appendChild(cardRole2);

        cardRole2.innerText = msgRole2;
        tl
            .set(boxRole2, {
                opacity: 0,
                onComplete: () => container.prepend(boxRole2),
            })
            .set(boxRole2, {
                y: () => boxRole2.offsetHeight,
            }, ">")
            .fromTo(".lrec-role-1, .lrec-role-2", {
                y: () => boxRole2.offsetHeight,
            }, {
                y: 0,
                ease: "power2.inOut",
                duration: 0.8,
            }, ">")
            .to(boxRole2, {
                opacity: 1,
                y: 0,
                ease: "power2.inOut",
                duration: 0.8,
            }, "<");

        // Role 1
        const boxRole1 = document.createElement("div");
        boxRole1.classList.add(`lrec-role-1`);
        const cardRole1 = document.createElement("glass-card");
        boxRole1.appendChild(cardRole1);

        tl
            .set(boxRole1, {
                opacity: 0,
                onComplete: () => container.prepend(boxRole1),
            }, ">+=0.3")
            .set(boxRole1, {
                y: () => boxRole1.offsetHeight,
            }, ">")
            .fromTo(".lrec-role-1, .lrec-role-2", {
                y: () => boxRole1.offsetHeight,
            }, {
                y: 0,
                ease: "power2.inOut",
                duration: 0.8,
            }, "<")
            .fromTo(boxRole2, {
                y: () => boxRole1.offsetHeight,
            }, {
                y: 0,
                ease: "power2.inOut",
                duration: 0.8,
            }, "<")
            .to(boxRole1, {
                opacity: 1,
                y: 0,
                ease: "power2.inOut",
                duration: 0.8,
            }, "<");
        await window.animateTextIn(msgRole1, cardRole1, tl, 1, "<");
    }

    // 弹幕滚动动画启动
    removedLinesSum = 0;
    danmakuAnimationPaused = false;
    danmakuAnimationLaunch() {
        const boxWidth = window.innerWidth;
        const speed = boxWidth / 8192;
        const gap = 24;
        let offset = 0;

        // 1. 数据结构初始化
        const lines = [
            { id: "lreo-line-1", direction: -1 }, // 向左
            { id: "lreo-line-2", direction: 1 }   // 向右
        ];

        const context = lines.map((line, index) => {
            const domElements = document.querySelectorAll(`#${line.id} glass-card`);
            const widths = Array.from(domElements).map(el => el.offsetWidth);

            // 计算初始 X 位置与总长度
            let currentX = index === 0 ? 0 : boxWidth;
            const baseXs = widths.map(w => {
                if (index === 0) {
                    currentX += w + gap;
                    return currentX;
                } else {
                    currentX -= w + gap;
                    return currentX;
                }
            });

            const maxW = Math.max(...widths);
            const totalW = index === 0
                ? Math.max(currentX, boxWidth + maxW + gap)
                : Math.max(boxWidth - currentX, boxWidth + maxW + gap);

            return {
                dom: line.id,
                elements: Array.from(domElements),
                widths,
                baseXs,
                totalW,
                direction: line.direction
            };
        });

        const allCards = context.flatMap(c => c.elements);

        // 2. 动画核心 (Ticker)
        gsap.ticker.add((time, deltaTime) => {
            if (this.danmakuAnimationPaused) return;

            offset += deltaTime * speed;

            context.forEach((lineCtx, idx) => {
                lineCtx.elements.forEach((card, i) => {
                    const raw = lineCtx.baseXs[i] + (offset * lineCtx.direction);
                    let x;

                    if (idx === 0) {
                        // Line 1 逻辑
                        x = ((raw % lineCtx.totalW) + lineCtx.totalW) % lineCtx.totalW - lineCtx.widths[i];
                    } else {
                        // Line 2 逻辑
                        x = ((raw % lineCtx.totalW) - lineCtx.totalW) % lineCtx.totalW + lineCtx.widths[i];
                    }
                    gsap.set(card, { x });
                });
            });
        });

        // 3. 事件绑定辅助函数
        const updateBlur = (activeCard, isEnter) => {
            this.danmakuAnimationPaused = isEnter;
            allCards.forEach(card => {
                if (card !== activeCard) {
                    card.classList[isEnter ? 'add' : 'remove']("blured");
                }
            });
        };

        const handleCardClick = (lineCtx, card) => {
            this.danmakuAnimationPaused = false;

            // 清除所有模糊
            allCards.forEach(c => c.classList.remove("blured"));

            // 检查当前行是否应该被移除
            const removedCount = lineCtx.elements.filter(el => el.classList.contains("removed")).length;

            if (removedCount === lineCtx.elements.length) {
                const lineDom = document.getElementById(lineCtx.dom);
                gsap.to(lineDom, {
                    opacity: 0,
                    duration: 0.6,
                    ease: "power2.in",
                    onComplete: () => {
                        lineDom.innerHTML = "";
                        // 检查是否所有行都已清空
                        const allEmpty = lines.every(l => document.getElementById(l.id).innerHTML === "");
                        if (allEmpty) this.showButton();
                    }
                });
            }
        };

        // 4. 执行绑定
        context.forEach(lineCtx => {
            lineCtx.elements.forEach(card => {
                card.addEventListener("mouseenter", () => {
                    if (card.classList.contains("removed")) return;
                    updateBlur(card, true);
                });

                card.addEventListener("mouseleave", () => {
                    updateBlur(card, false);
                });

                card.addEventListener("click", () => {
                    handleCardClick(lineCtx, card);
                });
            });
        });
    }

    // 显示下一页按钮
    showButton() {
        gsap.to("#lre-button-box", {
            scale: 1,
            duration: 1.2,
            ease: "elastic.out(1,0.7)",
        })
    }


    // 入场动画
    async enterAnime() {
        console.log("Page <LetterReply> entering..");
        // 开始入场前就设置 flag
        this.inProcess = true;
        window.updateProgressBar(18, 19);

        if (!window.isMute) window.audioSwitch(['assets/audios/background/letters/0.mp3', 'assets/audios/background/letters/1.mp3', 'assets/audios/background/letters/2.mp3']);
        const tl = gsap.timeline();
        tl
            .set("#letter-reply", {
                opacity: 0,
                display: "flex",
                // 填充内容
                onComplete: () => {
                    [window.letterReply[0], window.letterReply[1]].forEach((data, index) => {
                        const container = document.getElementById(`lreo-line-${index + 1}`);
                        if (!container || !data) return;

                        Object.entries(data).forEach(([key, item]) => {
                            const card = document.createElement("glass-card");
                            card.innerText = item.short;
                            card.setAttribute("clickable", "true");

                            card.addEventListener("click", () => {
                                // 不响应已移除元素的事件
                                if (card.classList.contains("removed")) return;

                                card.classList.add("removed");
                                this.addMessageNew(item.quote, item.reply);
                                card.removeAttribute("clickable");
                            })

                            container.appendChild(card);
                        });
                    });

                    this.danmakuAnimationLaunch();
                },
            })
            .to("#letter-reply", {
                opacity: 1,
                duration: 0.6,
                ease: "power2.out",

                onComplete: () => {
                    this.inProcess = false
                    this.isOpen = true;
                    console.log("Page <LetterReply> entered");
                },
            });

        // 返回一个可供 await 的过程
        return tl;
    };

    //出场动画
    async leaveAnime() {
        if (this.inProcess) {
            console.warn("Page <LetterReply> Processing, don't touch it.");
            return;
        }
        console.log("Page <LetterReply> leaving..");
        this.inProcess = true;
        const tl = gsap.timeline();
        tl
            .to("#letter-reply", {
                opacity: 0,
                duration: 0.6,
                ease: "power2.in",
            })
            .set("#letter-reply", {
                display: "none",
                opacity: 1,
                onComplete: () => {
                    document.getElementById("lreo-line-1").innerHTML = "";
                    document.getElementById("lreo-line-2").innerHTML = "";

                    // 出场完成后才设置 flag
                    this.inProcess = false;
                    this.isOpen = false;
                    console.log("Page <LetterReply> leaved");
                },
            }, ">");
        // 返回一个可供 await 的过程
        return tl;
    }

    // 绑定监听器
    constructor() {
        const lreButton = document.getElementById("lre-button");
        lreButton.addEventListener("click", () => window.goToPage("my-letter", 16, null));
    }
}

// 实例化
window.pages["letter-reply"] = new LetterReply();