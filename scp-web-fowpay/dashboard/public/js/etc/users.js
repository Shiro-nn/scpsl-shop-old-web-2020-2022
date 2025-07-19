window.addEventListener('load', () => {
    const guid = function(){return 'xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});}
    RenderDiscords();
    RendeProfiles();
    function RenderDiscords() {
        document.querySelectorAll(".render_discord").forEach((element) => element.addEventListener("click", RenderDiscordProfile));
        document.querySelectorAll(".render_discord").forEach((element) => GetDiscord(element));
        function GetDiscord(element) {
            let getted = false;
            const uid = guid();
            socket.on("profile_discord", (data, guid) => {
                if(getted) return;
                if(uid != guid) return;
                element.innerHTML = `@${data.user}`;
                getted = true;
            });
            socket.emit('profile_discord', element.id.substr(1), uid);
        }
        function RenderDiscordProfile(ev) {
            Discord_Profile(ev.target.id.substr(1));
        }
    }
    function RendeProfiles() {
        document.querySelectorAll(".render_user").forEach((element) => element.addEventListener("click", RenderProfile));
        document.querySelectorAll(".render_user").forEach((element) => GetProfile(element));
        function GetProfile(element) {
            let getted = false;
            const uid = guid();
            socket.on("username", (username, guid) => {
                if(getted) return;
                if(uid != guid) return;
                element.innerHTML = `@${username}`;
                getted = true;
            });
            socket.emit('username', element.id.substr(1), uid);
        }
        function RenderProfile(ev) {
            Render_Profile(ev.target.id.substr(1));
        }
    }
});