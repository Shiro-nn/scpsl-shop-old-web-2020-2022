window.addEventListener('load', () => {
    let DisabledAudio = true;
    const canvas = document.querySelector('.trailer');
    const ctx = canvas.getContext('2d');
    const media = document.getElementById('vid.trailer');
    const audio = document.getElementById('trailer_audio');
    const full = document.getElementById('trailer_full');
    media.style.display = 'none';
    media.addEventListener('ended', stopMedia);
    try{media.volume = 0;}catch{}
    function stopMedia() {
        try{media.pause();}catch{}
        try{media.currentTime = 0;}catch{}
        try{document.exitFullscreen()}catch{}
        try{media.style.visibility = 'hidden';}catch{}
        try{audio.style.visibility = 'hidden';}catch{}
        try{full.style.visibility = 'hidden';}catch{}
        try{canvas.style.display = 'none';}catch{}
    }
    audio.addEventListener('click', () => {
        if(DisabledAudio){
            DisabledAudio = false;
            try{media.volume = 1;}catch{}
            try{audio.src = _cdn_host+'/scpsl.store/img/index/volume-high-solid.svg';}catch{}
        }else{
            DisabledAudio = true;
            try{media.volume = 0;}catch{}
            try{audio.src = _cdn_host+'/scpsl.store/img/index/volume-xmark-solid.svg';}catch{}
        }
    });
    full.addEventListener('click', () => {
        media.requestFullscreen();
        media.style.visibility = 'visible';
        media.style.display = '';
    });
    media.addEventListener('play', function() {
        var $this = this;
        canvas.width = media.videoWidth;
        canvas.height = media.videoHeight;
        (function loop() {
            if (!$this.paused && !$this.ended) {
                ctx.drawImage($this, 0, 0);
                setTimeout(loop, 1000 / 30); // 30fps
            }
        })();
    }, 0);
    media.addEventListener('loadedmetadata', function() {
        canvas.width = media.videoWidth;
        canvas.height = media.videoHeight;
    });
    media.play();
});