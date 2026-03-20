class LetterReply {
    isOpen = false;
    inProcess = false;

    // 追加消息函数
    async addMessage(role, msg, tl) {
        if (!tl) tl = gsap.timeline();

        const box = document.createElement("div");
        box.classList.add(`ch-role-${role}`);
        const card = document.createElement("glass-card");
        box.appendChild(card);
        const container = document.getElementById("chat-history");

        if (role == 1) {
            await window.animateTextIn(msg, card, tl, 1, "<");

            tl
                .set(box, {
                    opacity: 0,
                    onComplete: () => container.prepend(box),
                }, "<")
                .set(box, {
                    y: () => box.offsetHeight,
                }, ">")
                .fromTo(".ch-role-1, .ch-role-2", {
                    y: () => box.offsetHeight,
                }, {
                    y: 0,
                    ease: "power2.inOut",
                    duration: 0.6,
                }, ">")
                .to(box, {
                    opacity: 1,
                    y: 0,
                    ease: "power2.inOut",
                    duration: 0.6,
                }, "<");

        } else if (role == 2) {
            card.innerText = msg;
            tl
                .set(box, {
                    opacity: 0,
                    onComplete: () => container.prepend(box),
                })
                .set(box, {
                    y: () => box.offsetHeight,
                })
                .fromTo(".ch-role-1, .ch-role-2", {
                    y: () => box.offsetHeight,
                }, {
                    y: 0,
                    ease: "power2.inOut",
                    duration: 0.6,
                }, ">")
                .to(box, {
                    opacity: 1,
                    y: 0,
                    ease: "power2.inOut",
                    duration: 0.6,
                }, "<");
        }
    }

    // 入场动画
    async enterAnime() {
        console.log("Page <LetterReply> entering..");
        // 开始入场前就设置 flag
        this.inProcess = true;
        const tl = gsap.timeline();
        tl
            .set("#letter-reply", {
                display: "flex",
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