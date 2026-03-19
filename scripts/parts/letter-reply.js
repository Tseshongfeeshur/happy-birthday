class LetterReply {
    isOpen = false;
    inProcess = false;
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