socket.on('get.admins', async(type, data, admins) => {
    const guid = function(){return 'xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});}
    const reqtasks = [];
    document.getElementById('admins.count').innerHTML = `Админы (${admins.length})`;
    const list = document.getElementById('admins.list');
    admins.forEach(admin => {
        const adm = type == 1 ? admin.sl : admin.slhrp;
        const task = {
            avatar: null,
            username: null,
            steam: null,
            discord: null,
            guid: guid(),
            uid: admin.id,
        }
        const e1 = document.createElement('div');
        e1.className = 'col-md-12 col-md-auto bypass_col';
        list.appendChild(e1);
        const e2 = document.createElement('div');
        e2.className = 'card-box card-border';
        e1.appendChild(e2);
        const e3 = document.createElement('div');
        e3.className = 'row';
        e2.appendChild(e3);
        
        const e4 = document.createElement('div');
        e4.className = 'cell col-3';
        e3.appendChild(e4);
        const e5 = document.createElement('div');
        e5.style.marginTop = '2px';
        e4.appendChild(e5);
        const e6 = document.createElement('div');
        e6.className = 'rounded-circle';
        e5.appendChild(e6);
        task.avatar = e6;
        
        const e7 = document.createElement('div');
        e7.className = 'cell col-8';
        e3.appendChild(e7);
        
        const e8 = document.createElement('p');
        e8.className = 'text-center mb-0 font-16 border-0 ml-0';
        e8.style = 'width:175px;color:#fff;overflow-wrap:break-word';
        e7.appendChild(e8);
        
        const e9 = document.createElement('p');
        e9.className = 'text-center mb-0 font-16 border-0 ml-0';
        e9.style = 'display: none;width:175px;color:#fff;overflow-wrap:break-word';
        let hl = 0;
        if(adm.trainee) hl = 25;
        else if(adm.helper) hl = 50;
        else if(adm.mainhelper) hl = 75;
        else if(adm.admin) hl = 100;
        e9.innerHTML = `Предов: <b>${adm.warnings}</b><br>Часов: <b>${Math.round((adm.time/60)/60)}/${hl}</b><br>Набор: <b>${adm.selection ? 'Да' : 'Нет'}</b><br>`+
        `Киков: <b>${adm.kicks}</b><br>Банов: <b>${adm.bans}</b><br>Наказаний: <b>${adm.punishments}</b>${adm.selection ? `<br>Рабов: <b>${adm.slaves}</b>` : ''}`;
        e7.appendChild(e9);
        
        const e10 = document.createElement('span');
        e10.className = 'p';
        e10.innerHTML = '@Invalid User';
        e10.onclick = () => Render_Profile(admin.id);
        e8.appendChild(e10);
        task.username = e10;
        e8.appendChild(document.createElement('br'));
        if(data.id == 1)
        {
            const e12 = document.createElement('a');
            e12.style.color = 'rgb(102, 102, 102)';
            e12.innerHTML = 'Steam';
            e8.appendChild(e12);
            e8.appendChild(document.createElement('br'));
            const e13 = document.createElement('a');
            e13.className = 'c15';
            e13.innerHTML = '@Invalid User';
            e8.appendChild(e13);
            e8.appendChild(document.createElement('br'));
            task.steam = e12;
            task.discord = e13;
        }
        const e11 = document.createElement('a');
        e11.innerHTML = 'Статистика';
        e11.onclick = () => {
            if(e9.style.display == 'none') $(e9).fadeIn();
            else $(e9).fadeOut();
        }
        e8.appendChild(e11);
        
        reqtasks.push(task);

        console.log(admin);
    });
    socket.on('get.admin.data', async(data, guid) => {
        const task = reqtasks.find(x => x.guid == guid);
        if(task == null || task == undefined) return;
        task.avatar.style.backgroundImage = `url(${data.avatar})`;
        task.username.innerHTML = `@${data.username}`;
        if(task.steam != null){
            if(data.steam == '') task.steam.outerHTML = '';
            else task.steam.onclick = () => window.open(`https://steamcommunity.com/profiles/${data.steam}`, 'Steam', 'resizable,scrollbars,status');
        }
        if(task.discord != null){
            if(data.discord != '')
            {
                task.discord.onclick = () => Discord_Profile(data.discord);
                GetDiscord(task.discord, data.discord)
            }
            else task.discord.outerHTML = '';
        }
    });
    reqtasks.forEach(task => socket.emit('get.admin.data', task.uid, task.guid));
    function GetDiscord(element, id) {
        let getted = false;
        const uid = guid();
        socket.on("profile_discord", (data, guid) => {
            if(getted) return;
            if(uid != guid) return;
            element.innerHTML = `@${data.user}`;
            getted = true;
        });
        socket.emit('profile_discord', id, uid);
    }
});
socket.emit('get.admins', aid);