function buildPages() {
    // 初始化 pages 对象
    window.pages = {};
    window.goToPage = async (pageName) => {
        // 找不到的不管
        if (!window.pages[pageName]) {
            console.error(`Page ${pageName} not found.`);
            return;
        }
        // 重复打开的不管
        if (window.pages[pageName].isOpen) {
            console.warn(`Page ${pageName} is already opened`);
            window.notify("页面已经打开");
            return;
        } else if (window.pages[pageName].inProcess) {
            console.warn(`Page ${pageName} is already in process`);
            window.notify("动画正在进行，请稍等");
            return;
        }
        for (const singlePage of Object.values(window.pages)) {
            if (singlePage) {
                if (singlePage.inProcess) {
                    console.warn(`The last page is already in process`);
                    window.notify("动画正在进行，请稍等");
                    return;
                }
                else if (singlePage.isOpen)
                    singlePage.leaveAnime();
            }
        }
        return window.pages[pageName].enterAnime();
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
    window.goToPage("home");
}

// 等待所有资源加载完成
window.addEventListener('load', initial);