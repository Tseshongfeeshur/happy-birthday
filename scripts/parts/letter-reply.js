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

    // 弹幕滚动动画启动函数
    danmakuAnimationLaunch() {

    }


    // 入场动画
    async enterAnime() {
        console.log("Page <LetterReply> entering..");
        // 开始入场前就设置 flag
        this.inProcess = true;

        window.audioSwitch(['assets/audios/background/letters/0.mp3', 'assets/audios/background/letters/1.mp3', 'assets/audios/background/letters/2.mp3']);
        const tl = gsap.timeline();
        tl
            .set("#letter-reply", {
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

                            card.onclick = () => {
                                card.classList.add("removed");
                                this.addMessageNew(item.quote, item.reply);
                            };

                            container.appendChild(card);
                        });
                    });

                    this.danmakuAnimationLaunch();

                    this.inProcess = false
                    this.isOpen = true;
                    console.log("Page <LetterReply> entered");
                },
                // onComplete: () => {
                //     this.inProcess = false
                //     this.isOpen = true;
                //     console.log("Page <LetterReply> entered");
                // },
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
            .set("#letter-reply", {
                display: "none",
                onComplete: () => {
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
    }
}

// 实例化
window.pages["letter-reply"] = new LetterReply();