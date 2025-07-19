$(function() {
    let already = false;
	$('#reset_password').on('click', function(event) {
		event.preventDefault();
        if(already) return;
		$('.mssg').addClass('animate');
        already = true;
        document.getElementsByClassName('mssg')[0].innerHTML = 'Отправка...';
        const do_pass = document.getElementById('user_pass').value;
        Waiting();
        const uid = guid();
        socket.on("ur_salt", async(salt) => {
            salt = await hash(salt + 'scpsl.store');
            const pass = CryptoJS.AES.encrypt(do_pass, salt).toString();
            const _arr = window.location.href.split('/');
            $.ajax({
                type:'post',
                url:`/authorization/reset-password/${_arr[_arr.length-1]}`,
                dataType: 'json',
                contentType: 'application/json',
                timeout: 15000,
                data: JSON.stringify({pass, uid}),
                success:function(data){
                    already = false;
                    location.href = '/authorization';
                },
                error:function(e, d, m) {
                    already = false;
                    WaitingStop();
                    if(e.responseText == undefined) return;
                    if(e.responseText == 'successfully') return location.href = '/authorization';
                    if(e.responseText == 'account not found') document.getElementsByClassName('mssg')[0].innerHTML = 'Аккаунт не найден.';
                    else if(e.responseText == 'password-few-length') document.getElementsByClassName('mssg')[0].innerHTML = 'Пароль должен быть не менее 6 символов.';
                }
            });
        });
        socket.emit('ur_salt', uid);
	});
    const guid = function(){return 'xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});}
});
async function hash(string) {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, '0'))
    .join('');
    return hashHex;
}