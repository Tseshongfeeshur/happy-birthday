function buildPages() {
    // 初始化 pages 对象
    window.pages = {};
    window.goToPage = async (pageName, innerCode1 = null, innerCode2 = null) => {
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
        window.lastPage = window.currentPage || null;
        window.currentPage = [pageName, innerCode1, innerCode2];

        localStorage.setItem('pageName', pageName);
        localStorage.setItem('innerCode1', innerCode1);

        return window.pages[pageName].enterAnime(innerCode1, innerCode2);
    }
}

window.updateProgressBar = (num, sum) => {
    gsap.to("#progress-bar", {
        x: -1 * window.innerWidth * (sum - num) / sum,
        ease: "power2.inOut",
        duration: 0.5,
    })
}

// 绑定全局按钮
function bindButtons() {
    const navButtonContent = document.getElementById("nav-button-content");
    navButtonContent.addEventListener("click", () => {
        const tl = gsap.timeline();

        tl
            .to(".container", {
                opacity: 0,
                ease: "power2.out",
                duration: 0.6,
            })
            .set("#content-layer", {
                display: "block",
            }, "<")
            .to("#content-layer", {
                opacity: 1,
                ease: "power2.out",
                duration: 1,
            }, "<")
            .to("#content-icon-box, .content-item-box", {
                y: 0,
                ease: "elastic.out(0.6,0.7)",
                stagger: 0.06,
                duration: 1,
                onComplete: () => {
                    const contentLayer = document.getElementById("content-layer");
                    contentLayer.addEventListener("click", (e) => {
                        const btn = e.target.closest(".content-item");
                        if (btn) {
                            const { pagename, innercode1 = null } = btn.dataset;

                            // 执行跳转
                            window.goToPage(pagename, Number(innercode1));
                        }

                        const tl = gsap.timeline();

                        tl
                            .to("#content-icon-box, .content-item-box", {
                                y: window.innerHeight * -1,
                                ease: "power2.in",
                                stagger: 0.04,
                                duration: 0.6,
                            })
                            .to("#content-layer", {
                                opacity: 0,
                                ease: "power2.in",
                                duration: 0.6,
                            }, "<")
                            .to(".container", {
                                opacity: 1,
                                ease: "power2.in",
                                duration: 1,
                            }, "<")
                            .set("#content-layer", {
                                display: "none",
                            }, ">");
                    }, { once: true });
                },
            }, "<");


        const contentButtonBack = document.getElementById("content-icon-back");
        contentButtonBack.addEventListener("click", () => {
            if (window.lastPage)
                window.goToPage(window.lastPage[0], window.lastPage[1], window.lastPage[2]);
            else window.notify("不能再后退了");
        }, { once: true });

        const contentButtonRefresh = document.getElementById("content-icon-refresh");
        contentButtonRefresh.addEventListener("click", () => location.reload(), { once: true });

        const contentButtonMute = document.getElementById("content-icon-mute");
        contentButtonMute.addEventListener("click", () => {
            if (!window.isMute) {
                window.isMute = true;
                window.AudioController.stopAll();
                window.notify("已静音");
                document.getElementById("content-icon-mute-icon").classList.remove("hide-icon");
                document.getElementById("content-icon-sound-icon").classList.add("hide-icon");
            } else {
                window.isMute = false;
                window.notify("已取消静音，下一页生效");
                document.getElementById("content-icon-mute-icon").classList.add("hide-icon");
                document.getElementById("content-icon-sound-icon").classList.remove("hide-icon");
            }
        }, { once: true });

        const contentItemButtons = document.querySelectorAll(".content-item");
        contentItemButtons.forEach(element => {
            if (window.currentPage[0] == element.dataset.pagename)
                if (window.currentPage[1])
                    window.currentPage[1] == element.dataset.innercode1 ? element.classList.add("highlight") : element.classList.remove("highlight");
                else
                    element.classList.add("highlight");
            else
                element.classList.remove("highlight");
        });
    });

    const navButtonHome = document.getElementById("nav-button-home");
    navButtonHome.addEventListener("click", () => window.goToPage("home"));
}

buildPages();
bindButtons();

// 全页面初始化
function initial() {
    const loadingBox = document.getElementById("loading-box");
    loadingBox.classList.add("finished");
    loadingBox.addEventListener("click", () => {
        window.goToPage(localStorage.getItem('pageName') || "home", localStorage.getItem('innerCode1') || null);

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
    loadingText.innerText = "准备就绪，请打开声音，点击光晕进入";
}

window.audioCache = {};
window.svgCache = {};

const assetsToLoad = {
    audio: [
        'assets/audios/background/alohomora/0.mp3',
        'assets/audios/background/home/0.mp3',
        'assets/audios/background/letters/0.mp3',
        'assets/audios/background/letters/1.mp3',
        'assets/audios/background/letters/2.mp3',
        'assets/audios/effect/click.mp3',
        'assets/audios/effect/firework.mp3'
    ],
    svg: [
        'assets/images/alohomora/0.svg',
        ...Array.from({ length: 17 }, (_, i) => `assets/images/my-letter/${i}.svg`)
    ],
    fonts: [
        {
            name: "title",
            src: "styles/fonts/香萃刻宋/subset.woff2"
        },
        {
            name: "title-en",
            src: "styles/fonts/Syne-ExtraBold/subset.woff2"
        },
        {
            name: "text",
            src: "styles/fonts/朱雀仿宋/subset.woff2"
        },
        {
            name: "text-en",
            src: "styles/fonts/Syne-Medium/subset.woff2"
        },
        {
            name: "option",
            src: "styles/fonts/option/subset.woff2"
        },
    ]
};

async function preloadAll() {
    const promises = [];

    // 预加载音频
    assetsToLoad.audio.forEach(src => {
        const p = new Promise((resolve) => {
            const audio = new Audio();
            audio.src = src;
            audio.preload = 'auto';
            audio.oncanplaythrough = () => {
                window.audioCache[src] = audio;
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
        const p = fetch(src)
            .then(res => {
                if (!res.ok) throw new Error();
                return res.text();
            })
            .then(svgCode => {
                window.svgCache[src] = svgCode;
            })
            .catch(() => console.warn(`SVG load failed: ${src}`));

        promises.push(p);
    });

    // 预加载字体
    assetsToLoad.fonts.forEach(font => {
        const p = new FontFace(font.name, `url(${font.src})`)
            .load()
            .then(loadedFont => {
                document.fonts.add(loadedFont);
            })
            .catch(err => {
                console.warn(`Font load failed: ${font.name} at ${font.src}`, err);
            });

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