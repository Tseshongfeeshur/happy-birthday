function buildPages() {
    // 初始化 pages 对象
    window.pages = {};
    window.goToPage = async (pageName, innercode1 = 0, innercode2 = 0) => {
        // 找不到的不管
        if (!window.pages[pageName]) {
            console.error(`Page ${pageName} not found.`);
            return;
        }
        if (window.pages[pageName].inProcess) {
            console.warn(`Page ${pageName} is already in process`);
            window.notify("请等待动画结束后再操作");
            return;
        }
        for (const singlePage of Object.values(window.pages)) {
            if (singlePage) {
                if (singlePage.inProcess) {
                    console.warn(`The last page is already in process`);
                    window.notify("请等待动画结束后再操作");
                    return;
                }
                else if (singlePage.isOpen)
                    await singlePage.leaveAnime();
            }
        }
        return window.pages[pageName].enterAnime(innercode1, innercode2);
    }
}

// 绑定全局按钮
function bindButtons() {
    const navButtonContent = document.getElementById("nav-button-content");
    const navButtonHome = document.getElementById("nav-button-home");
    navButtonHome.addEventListener("click", () => window.goToPage("home"));
}

buildPages();
bindButtons();

// 全页面初始化
function initial() {
    window.goToPage("my-letter");



    const loadingBox = document.getElementById("loading-box");
    loadingBox.classList.add("finished");
    loadingBox.addEventListener("click", () => {
        const tl = gsap.timeline();
        tl
            .to("#loading-layer", {
                opacity: 0,
                ease: "power2.in",
            })
            .set("#loading-layer", {
                display: "none",
            }, ">");
    }, { once: true });
    const loadingText = document.getElementById("loading-text");
    loadingText.innerText = "准备就绪";
}

// 预加载逻辑
const assetsToLoad = {
    audio: [
        'assets/audios/background/alogomora/alohomora.mp3',
        'assets/audios/background/home/home.mp3',
        'assets/audios/background/letters/letters-0.mp3',
        'assets/audios/background/letters/letters-1.mp3',
        'assets/audios/background/letters/letters-2.mp3',
        'assets/audios/effect/click.mp3',
        'assets/audios/effect/firework.mp3'
    ],
    // SVG 需要提前载入缓存
    svg: Array.from({ length: 17 }, (_, i) => `assets/images/my-letter/${i}.svg`)
};

// 存储加载好的音频实例，后续直接调用 .play()
const audioCache = {};

async function preloadAll() {
    const promises = [];

    // 预加载音频
    assetsToLoad.audio.forEach(src => {
        const p = new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.src = src;
            audio.preload = 'auto';
            // canplaythrough 表示音频已足够播放，不需要停顿
            audio.oncanplaythrough = () => {
                audioCache[src] = audio;
                resolve();
            };
            audio.onerror = resolve; // 即使失败也继续，防止页面卡死
        });
        promises.push(p);
    });

    // 预加载 SVG
    assetsToLoad.svg.forEach(src => {
        const p = new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = resolve;
            img.onerror = resolve;
        });
        promises.push(p);
    });

    // 等待所有资源完成
    await Promise.all(promises);

    // 进入
    console.log("Resources loading finished");
    initial()
}

// 页面启动
preloadAll();