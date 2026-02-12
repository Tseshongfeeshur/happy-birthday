// 全页面初始化
function initial() {
    window.dispatchEvent(new CustomEvent('action:gotoHome'));
}

// 等待所有资源加载完成
window.addEventListener('load', initial);