window.AudioController = {
    playlist: [],
    currentIndex: 0,
    currentAudio: null,
    // 记录最后一次传入的原始参数
    _lastRawAudios: null,

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

    _playCurrent: function () {
        if (this.playlist.length === 0) return;

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

        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.onended = null;
        }

        this.currentAudio = audio;
        this.currentAudio.currentTime = 0;
        this.currentAudio.volume = 1;

        this.currentAudio.onended = () => {
            this.next();
        };

        this.currentAudio.play().catch(err => {
            console.warn("Playback blocked by browser", err);
        });
    },

    next: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.playlist.length) {
            this.currentIndex = 0;
        }
        this._playCurrent();
    },

    // 对比逻辑
    audioSwitch: function (audios) {
        // 参数合法性校验
        if (!audios || !Array.isArray(audios) || audios.length === 0) {
            this.stopAll();
            this._lastRawAudios = null; // 清空记录
            return;
        }

        // 对比
        const currentData = JSON.stringify([...audios].sort());
        if (this._lastRawAudios === currentData) {
            console.log("Audio playlist is the same, skipping update.");
            return;
        }

        // 执行更新
        this.stopAll();
        this._lastRawAudios = currentData; // 更新缓存
        this.playlist = this._shuffle([...audios]);
        this.currentIndex = 0;
        this._playCurrent();
    },

    stopAll: function () {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.onended = null;
            this.currentAudio = null;
        }
        this.playlist = [];
        this.currentIndex = 0;
        // 不自动清空 _lastRawAudios，除非希望 stopAll 后再次传入相同参数时能重新播放
    }
};

window.audioSwitch = (audios) => window.AudioController.audioSwitch(audios);