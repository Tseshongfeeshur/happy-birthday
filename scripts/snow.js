(function () {
    let animationId = null;
    let canvas, ctx, stackers;
    let width, height;
    let particles = [];
    const particleCount = 300;

    class Snowflake {
        constructor() {
            this.reset();
        }

        reset() {
            // width 和 height 使用外部闭包中的变量
            this.x = Math.random() * (width || window.innerWidth);
            this.y = Math.random() * -(height || window.innerHeight);
            this.size = Math.random() * 2 + 0.5;
            this.padding = 16;
            this.speedY = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.3;
            this.isStopped = false;
            this.shouldStack = Math.random() > 0.4;
            this.resetTimer = null;
        }

        update() {
            if (this.isStopped) return;

            this.y += this.speedY;
            this.x += this.speedX;

            if (this.shouldStack && stackers.length > 0) {
                for (let i = 0; i < stackers.length; i++) {
                    const rect = stackers[i].getBoundingClientRect();

                    // 检查碰撞
                    if (this.x > rect.left + this.padding &&
                        this.x < rect.right - this.padding &&
                        this.y >= rect.top &&
                        this.y <= rect.top + 5) {

                        this.y = rect.top - (this.size / 2);
                        this.isStopped = true;

                        this.resetTimer = setTimeout(() => {
                            if (animationId) this.reset();
                        }, 30000);

                        // 一旦碰撞到一个元素，就跳出循环，不再检查其他元素
                        break;
                    }
                }
            }

            if (this.y > height) this.reset();
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.shadowBlur = 12;
            ctx.shadowColor = "white";
            ctx.fill();
            ctx.closePath();
        }
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        if (canvas) {
            canvas.width = width;
            canvas.height = height;
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        animationId = requestAnimationFrame(animate);
    }

    window.startSnowAnimation = function () {
        // 防止重复启动
        if (animationId) return;

        canvas = document.getElementById('snow-canvas');
        if (!canvas) {
            console.error('Canvas not found');
            return;
        }

        gsap.set(canvas, {
            opacity: 1,
        })
        ctx = canvas.getContext('2d');
        stackers = document.querySelectorAll('.snow-stacker');

        window.addEventListener('resize', resize);
        resize();

        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Snowflake());
        }

        animate();
        console.log('Snow animation started');
    };

    window.destroySnowAnimation = function () {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        window.removeEventListener('resize', resize);

        // 清理所有粒子的定时器
        particles.forEach(p => {
            if (p.resetTimer) clearTimeout(p.resetTimer);
        });

        // 清空画布
        if (ctx && canvas) {
            gsap.to(canvas, {
                opacity: 0,
                ease: "power2.in",
                duration: 0.4,
                onComplete: () => ctx.clearRect(0, 0, canvas.width, canvas.height),
            })
        }

        particles = [];
        console.log('Snow animation deleted');
    };
})();