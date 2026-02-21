/**
 * 玻璃卡片组件模板定义
 */
const template = document.createElement('template');
template.innerHTML = /* html */ `
<style>
    :host {
        --glass-bg: linear-gradient(135deg, rgba(120, 80, 220, .25), rgba(60, 40, 140, .15));
        --glass-border: 1px solid rgba(255, 255, 255, .12);
        --padding: 0 0 0 0;
        user-select: none;
        outline: none;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation; /* 优化触摸响应 */
        display: inline-block;
    }

    .glass-container {
        width: 100%;
        height: 100%;
        border-radius: inherit;
        position: relative;
        z-index: 1;
        box-sizing: border-box;
        border: var(--glass-border);
        background: var(--glass-bg);
        backdrop-filter: blur(12px) saturate(180%);
        -webkit-backdrop-filter: blur(12px) saturate(180%);
        box-shadow: 0px 5px 20px 4px rgba(0, 0, 0, .2);
        will-change: transform, opacity;
    }

    :host([clickable]) .glass-container {
        cursor: pointer;
    }

    .content {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        color: white;
        padding: var(--padding);
    }

    :host([block]) .content {
        display: block;
    }
</style>
<div class="glass-container">
    <div class="content">
        <slot></slot>
    </div>
</div>
`;

class GlassCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.container = this.shadowRoot.querySelector('.glass-container');
        this.floatTween = null;
    }

    static get observedAttributes() {
        return ['clickable'];
    }

    connectedCallback() {
        this._initStates();
        this._setupEventListeners();
    }

    _initStates() {
        if (this.clickable) {
            gsap.set(this.container, { opacity: 0.8, y: 0, scale: 1 });
            this._startFloating();
        } else {
            gsap.set(this.container, { opacity: 1, y: 0, scale: 1 });
        }
    }

    _startFloating() {
        if (this.floatTween) this.floatTween.kill();
        this.floatTween = gsap.to(this.container, {
            y: 6,
            duration: 1.8,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            paused: !this.clickable,
            overwrite: "auto",
        });
    }

    /**
     * 设置交互事件（合并鼠标与触摸逻辑）
     */
    _setupEventListeners() {
        // --- 激活状态（按下/移入） ---
        const handlePress = () => {
            if (!this.clickable) return;
            if (this.floatTween) this.floatTween.pause();

            gsap.to(this.container, {
                scale: 1.06,
                opacity: 1,
                duration: 0.8,
                ease: "elastic.out(1.1, 0.5)",
                overwrite: "auto",
            });
        };

        // --- 释放状态（抬起/移出） ---
        const handleRelease = () => {
            if (!this.clickable) return;

            gsap.to(this.container, {
                scale: 1,
                opacity: 0.8,
                duration: 0.4,
                ease: "power2.out",
                overwrite: "auto",
                onComplete: () => {
                    if (this.clickable && this.floatTween && !this.floatTween.isActive()) {
                        this.floatTween.resume();
                    }
                }
            });
        };

        // --- 点击反馈（缩放一下） ---
        const handleDown = () => {
            if (!this.clickable) return;
            gsap.to(this.container, {
                scale: 0.95,
                duration: 0.1,
                ease: "power1.out",
                overwrite: "auto",
            });
        };

        // 鼠标事件
        this.addEventListener('mouseenter', handlePress);
        this.addEventListener('mouseleave', handleRelease);
        this.addEventListener('mousedown', handleDown);
        this.addEventListener('mouseup', handlePress); // 抬起后恢复到 hover 状态

        // 触摸事件适配
        this.addEventListener('touchstart', (e) => {
            // e.preventDefault(); // 如果需要完全自定义触摸行为可开启，但会阻止滚动
            handleDown();
        }, { passive: true });

        this.addEventListener('touchend', () => {
            // 触摸结束时，移动端没有 hover 状态，直接回到初始状态
            handleRelease();
        }, { passive: true });

        // 触摸被系统打断（如来电、滚动触发）
        this.addEventListener('touchcancel', handleRelease);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'clickable') {
            const isClickable = newValue !== null;
            if (isClickable) {
                if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
                this._initStates();
            } else {
                this.removeAttribute('tabindex');
                if (this.floatTween) this.floatTween.kill();
                gsap.to(this.container, { scale: 1, y: 0, opacity: 1, duration: 0.3 });
            }
        }
    }

    get clickable() { return this.hasAttribute('clickable'); }
    set clickable(val) {
        if (val) this.setAttribute('clickable', '');
        else this.removeAttribute('removeAttribute', 'clickable');
    }

    disconnectedCallback() {
        if (this.floatTween) this.floatTween.kill();
        gsap.killTweensOf(this.container);
    }
}

customElements.define('glass-card', GlassCard);