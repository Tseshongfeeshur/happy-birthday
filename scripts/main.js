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
}

// 等待所有资源加载完成
window.addEventListener('load', initial);