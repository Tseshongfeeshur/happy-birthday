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

// 定义音频控制函数
window.AudioController = {
    playlist: [],
    currentIndex: 0,
    currentAudio: null,

    // 洗牌算法
    _shuffle: function (array) {
        let m = array.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    },

    // 核心播放逻辑
    _playCurrent: function () {
        if (this.playlist.length === 0) return;

        // 确保索引在范围内
        if (this.currentIndex >= this.playlist.length) {
            this.currentIndex = 0;
        }

        const key = this.playlist[this.currentIndex];
        const audio = window.audioCache[key];

        if (!audio) {
            console.warn(`Audio resource "${key}" not found`);
            this.next();
            return;
        }

        // 清理上一个音频的状态
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.onended = null;
        }

        this.currentAudio = audio;
        this.currentAudio.currentTime = 0;
        this.currentAudio.volume = 1;

        // 当前音频播放结束时，自动跳到下一首
        this.currentAudio.onended = () => {
            this.next();
        };

        this.currentAudio.play().catch(err => {
            console.warn("Playback blocked by browser", err);
        });
    },

    // 下一首
    next: function () {
        this.currentIndex++;

        // 列表循环逻辑
        if (this.currentIndex >= this.playlist.length) {
            this.currentIndex = 0;
            console.log("Playlist loop restarted");
        }

        this._playCurrent();
    },

    // 外部接口
    audioSwitch: function (audios) {
        if (!audios || !Array.isArray(audios) || audios.length === 0) {
            this.stopAll();
            return;
        }

        // 停止当前
        this.stopAll();

        // 洗牌并存入播放列表
        this.playlist = this._shuffle([...audios]);
        this.currentIndex = 0;

        // 开始播放
        this._playCurrent();
    },

    // 完全停止
    stopAll: function () {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.onended = null;
            this.currentAudio = null;
        }
        this.playlist = [];
        this.currentIndex = 0;
    }
};

window.audioSwitch = (audios) => window.AudioController.audioSwitch(audios);

// 全页面初始化
function initial() {
    const loadingBox = document.getElementById("loading-box");
    loadingBox.classList.add("finished");
    loadingBox.addEventListener("click", () => {



        // 根据cookies设置
        window.goToPage("home");



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
    document.addEventListener("click", () => {
        // true 表示深拷贝
        const instance = window.audioCache["assets/audios/effect/click.mp3"].cloneNode(true);
        instance.volume = 0.36;
        instance.play();

        // 自动销毁
        instance.onended = () => {
            instance.remove();
        };
    });
    const loadingText = document.getElementById("loading-text");
    loadingText.innerText = "准备就绪";
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

    await Promise.all(promises);

    console.log("Resources loaded:", {
        audioKeys: Object.keys(window.audioCache),
        svgPages: Object.keys(window.svgCache)
    });

    initial();
}

// 页面启动
preloadAll();