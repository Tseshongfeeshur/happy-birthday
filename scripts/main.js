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

window.audioCache = {};
window.svgCache = {};

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
    svg: [
        'assets/images/alohomora/0.svg',
        ...Array.from({ length: 17 }, (_, i) => `assets/images/my-letter/${i}.svg`)
    ]
};

// 工具函数：获取文件名
const getFileName = (path) => path.split('/').pop().split('.')[0];

// 工具函数：获取父文件夹名
const getPageName = (path) => {
    const parts = path.split('/');
    return parts[parts.length - 2]; 
};

async function preloadAll() {
    const promises = [];

    // 预加载音频
    assetsToLoad.audio.forEach(src => {
        const p = new Promise((resolve) => {
            const audio = new Audio();
            const key = getFileName(src);
            audio.src = src;
            audio.preload = 'auto';
            audio.oncanplaythrough = () => {
                window.audioCache[key] = audio;
                resolve();
            };
            audio.onerror = () => {
                console.warn(`Audio load failed: ${src}`);
                resolve();
            };
        });
        promises.push(p);
    });

    // 预加载 SVG
    assetsToLoad.svg.forEach(src => {
        const pageName = getPageName(src);
        const fileName = getFileName(src);
        
        const p = fetch(src)
            .then(res => {
                if (!res.ok) throw new Error();
                return res.text();
            })
            .then(svgCode => {
                // 如果该页面对象还没创建，先初始化它
                if (!window.svgCache[pageName]) {
                    window.svgCache[pageName] = {};
                }
                window.svgCache[pageName][fileName] = svgCode;
            })
            .catch(() => console.warn(`SVG load failed: ${src}`));
            
        promises.push(p);
    });

    await Promise.all(promises);

    console.log("Resources loaded:", {
        audioKeys: Object.keys(window.audioCache),
        svgPages: Object.keys(window.svgCache)
    });
    
    initial();
}

// 页面启动
preloadAll();