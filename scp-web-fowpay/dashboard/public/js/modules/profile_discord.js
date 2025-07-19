let hide_ds = true;
function Discord_Profile(id) {
    const position = getPosition();
    Waiting();
    socket.on('profile_discord', async(data) => Discord_Profile_Render(data.user, data.discriminator, data.avatar, position));
    socket.emit('profile_discord', id);
    function Discord_Profile_Render(name, discriminator, avatar, position) {
        hide_ds = false;
        RGBaster.colors(avatar, {
            exclude: [/*'rgb(255,255,255)'*/],
            success: function(payload) {
                WaitingStop();
                let src = document.getElementById('u2').src;
                if(src !== avatar){
                    document.getElementById('u2').src = '';
                    document.getElementById('u4').style.backgroundColor = '';
                }
                var coord = position;
                if(coord.x > ($(window).width() - 300)) coord.x = $(window).width() - 300;
                document.getElementById('u1').style = `top: ${coord.y}px; left: ${coord.x}px;`;
                if(src !== avatar) document.getElementById('u2').src = avatar;
                document.getElementById('u3').innerHTML = `<span class="d10">${name}</span><span class="d11">#${discriminator}</span>`;
                document.getElementById('u4').style.backgroundColor = payload.dominant;
            }
        });
        setTimeout(() => hide_ds = true, 100);
    }
    function Waiting() {
        var coord = getPosition();
        if(coord.x > ($(window).width() - 300)) coord.x = $(window).width() - 300;
        document.getElementById('waiting_discord').style = `top: ${coord.y}px; left: ${coord.x}px;`;
    }
    function WaitingStop() {
        document.getElementById('waiting_discord').style = `display:none;`;
    }
    function getPosition(e){
        var x = y = 0;
        if (!e) {
            var e = window.event;
        }
        if (e.pageX || e.pageY){
            x = e.pageX;
            y = e.pageY;
        } else if (e.clientX || e.clientY){
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        return {x: x, y: y}
    }
}
$(document).ready(function () {
    document.addEventListener("click", (ev)=>{
        if(!hide_ds) return;
        const path = ev.path || (ev.composedPath && ev.composedPath());
        if(!path) return;
        if(path.filter(x => x.id == 'u1').length < 1) document.getElementById('u1').style = `display: none;`;
    });
});