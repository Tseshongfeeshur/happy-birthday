function main() {
    const homeButton = document.getElementById("home-button");
    homeButton.addEventListener("click", enterCelebration);
}

function enterCelebration() {
    const outAnimeDuration = 1.2;
    const opacityDuration = .8;
    // 放大 home 按钮
    const homeButton = document.getElementById("home-button");
    homeButton.classList.add("removing");
    // 上滑标题
    const titleBox = document.getElementById("home-title-box");
    titleBox.classList.add("removing");
    // 下滑关于按钮
    const aboutButton = document.getElementById("about-button");
    aboutButton.classList.add("removing");
}

main();