$(function() {
	var tab = $('.tabs h3 a');
	tab.on('click', function(event) {
		event.preventDefault();
		tab.removeClass('active');
		$(this).addClass('active');
		tab_content = $(this).attr('href');
		$('div[id$="tab-content"]').removeClass('active');
		$(tab_content).addClass('active');
	});
});

(function($) {
	'use strict';
	$.fn.swapClass = function(remove, add) {
		this.removeClass(remove).addClass(add);
        //for low-level browsers, ex: safari, yandex
        const el = document.querySelector(`.${add}`);
        if(el == null) return;
        var styles = getComputedStyle(el);
        var itWorks = !!(styles.animation || styles.webkitAnimation);
        if(!itWorks){
            if(add == 'open') el.style.opacity = 1;
            else if(add == 'closed') el.style.opacity = 0;
        }
		return this;
	};
}(jQuery));

$(function() {
	$('.agree,.forgot, .resendver, .log-in, .sign-up').on('click', function(event) {
		event.preventDefault();
		var recovery = $('.recovery'),
        reverify = $('.reverify'),
        arrow = $('.tabs-content .fa');
        if ($(this).hasClass('forgot')) {
			if(recovery.hasClass('open')) {
				if(reverify.hasClass('open')) reverify.swapClass('open', 'closed');
				recovery.swapClass('open', 'closed');
				arrow.swapClass('active', 'inactive');
			}else{
				recovery.swapClass('closed', 'open');
				if(reverify.hasClass('open')) reverify.swapClass('open', 'closed');
				arrow.swapClass('inactive', 'active');
			}
		}
        if ($(this).hasClass('resendver')) {
			if(reverify.hasClass('open')) {
				if(recovery.hasClass('open')) recovery.swapClass('open', 'closed');
				reverify.swapClass('open', 'closed');
				arrow.swapClass('active', 'inactive');
			}else{
				reverify.swapClass('closed', 'open');
				if(recovery.hasClass('open')) recovery.swapClass('open', 'closed');
				arrow.swapClass('inactive', 'active');
			}
		}
	});
});

$(function() {
    let already = false;
	$('.recovery .button').on('click', function(event) {
		event.preventDefault();
		$('.recovery .mssg').addClass('animate');
        if(!validateEmail(document.getElementById('user_recover').value)){
            document.querySelector('.recovery .mssg').innerHTML = 'Пожалуйста, введите действительный адрес электронной почты';
            return;
        }
        if(already) return;
        already = true;
        document.querySelector('.recovery .mssg').innerHTML = 'Отправка...';
        const email = document.getElementById('user_recover').value;
        $.ajax({
            type:'post',
            url:`/authorization/lost-password`,
            dataType: 'json',
            contentType: 'application/json',
            timeout: 15000,
            data: JSON.stringify({email}),
            success: (data) => Later(),
            error:function(e, d, m) {
                if(e.responseText == undefined) return;
                if(e.responseText == 'successfully') return Later();
                already = false;
                if(e.responseText == 'email-null') document.querySelector('.recovery .mssg').innerHTML = 'Пожалуйста, введите действительный адрес электронной почты';
                else if(e.responseText == 'account not found') document.querySelector('.recovery .mssg').innerHTML = 'Аккаунт с данной почтой не найден';
                else if(e.responseText == 'email error') document.querySelector('.recovery .mssg').innerHTML = 'Произошла ошибка при отправке сообщения';
            }
        });
        function Later() {
            already = false;
            document.querySelector('.recovery .mssg').innerHTML = 'Вам было отправлено электронное письмо с дальнейшими инструкциями';
            setTimeout(function() {
                $('.recovery').swapClass('open', 'closed');
                $('.reverify').swapClass('open', 'closed');
                $('#toggle-terms').swapClass('open', 'closed');
                $('.tabs-content .fa').swapClass('active', 'inactive');
                $('.recovery .mssg').removeClass('animate');
                $('.reverify .mssg').removeClass('animate');
                document.getElementById('user_recover').value = '';
            }, 2500);
        }
	});
});
$(function() {
    let already = false;
	$('.reverify .button').on('click', function(event) {
		event.preventDefault();
		$('.reverify .mssg').addClass('animate');
        if(!validateEmail(document.getElementById('user_reverify').value)){
            document.querySelector('.reverify .mssg').innerHTML = 'Пожалуйста, введите действительный адрес электронной почты';
            return;
        }
        if(already) return;
        already = true;
        document.querySelector('.reverify .mssg').innerHTML = 'Отправка...';
        const email = document.getElementById('user_reverify').value;
        $.ajax({
            type:'post',
            url:'/authorization/reverify',
            dataType: 'json',
            contentType: 'application/json',
            timeout: 15000,
            data: JSON.stringify({email}),
            success: (data) => Later(),
            error:function(e, d, m) {
                if(e.responseText == undefined) return;
                if(e.responseText == 'successfully') return Later();
                already = false;
                if(e.responseText == 'email-null') document.querySelector('.reverify .mssg').innerHTML = 'Пожалуйста, введите действительный адрес электронной почты';
                else if(e.responseText == 'account not found') document.querySelector('.reverify .mssg').innerHTML = 'Аккаунт с данной почтой не найден';
                else if(e.responseText == 'account verified') document.querySelector('.reverify .mssg').innerHTML = 'Аккаунт уже подтвержден';
                else if(e.responseText == 'email error') document.querySelector('.reverify .mssg').innerHTML = 'Произошла ошибка при отправке сообщения';
            }
        });
        function Later() {
            already = false;
            document.querySelector('.reverify .mssg').innerHTML = 'Вам было отправлено электронное письмо с ссылкой для подтверждения';
            setTimeout(function() {
                $('.recovery').swapClass('open', 'closed');
                $('.reverify').swapClass('open', 'closed');
                $('.recovery .mssg').removeClass('animate');
                $('.reverify .mssg').removeClass('animate');
                document.getElementById('user_reverify').value = '';
            }, 2500);
        }
	});
});
function validateEmail(e) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(e);
}

$(function() {
    let login_already = false;
    $('#login_submit').on('click', function(ev) {
        const user = document.getElementById('user_login').value;
        const do_pass = document.getElementById('user_pass_login').value;
        const remember = document.getElementById('remember_me').checked;
        if(login_already) return;
        Waiting();
        login_already = true;
        socket.on("ur_salt", async(salt) => {
            salt = await hash(salt + 'scpsl.store');
            const pass = CryptoJS.AES.encrypt(do_pass, salt).toString();
            $.ajax({
                type:'post',
                url:`/authorization/login`,
                dataType: 'json',
                contentType: 'application/json',
                timeout: 15000,
                data: JSON.stringify({user, pass, remember}),
                success:function(data) {
                    login_already = false;
                    location.reload();
                },
                error:function(e, d, m) {
                    login_already = false;
                    WaitingStop();
                    if(e.responseText == undefined) return;
                    if(e.responseText == 'successfully') return location.reload();
                    document.getElementsByClassName('content')[0].className += ' error';
                    if(e.responseText == 'user-not-found') document.getElementById('iferrortext').innerHTML = 'Пожалуйста, введите действительное имя пользователя';
                    if(e.responseText == 'user-not-verified') document.getElementById('iferrortext').innerHTML = 'Подтвердите Вашу почту, перейдя по ссылке из письма'+
                        '<br><a onclick="document.querySelector(\'.resendver\').click()">Отправить повторно</a>';
                    if(e.responseText == 'invalid-password') document.getElementById('iferrortext').innerHTML = 'Пожалуйста, введите правильный пароль';
                }
            });
        });
        socket.emit('ur_salt', user);
    })
    let signup_already = false;
    $('#signup_submit').on('click', function(ev) {
        const email = document.getElementById('user_email').value;
        const user = document.getElementById('user_name').value;
        const nick = document.getElementById('user_nick').value;
        const do_pass = document.getElementById('user_pass').value;
        if(user.length > 25){
            document.getElementsByClassName('content')[0].className += ' error';
            document.getElementById('iferrortext').innerHTML = 'Слишком длинный логин';
            return;
        }
        if(signup_already) return;
        Waiting();
        signup_already = true;
        socket.on("ur_salt", async(salt) => {
            salt = await hash(salt + 'scpsl.store');
            const pass = CryptoJS.AES.encrypt(do_pass, salt).toString();
            $.ajax({
                type:'post',
                url:`/authorization/signup`,
                dataType: 'json',
                contentType: 'application/json',
                timeout: 15000,
                data: JSON.stringify({user, pass, email, nick}),
                success:function(data) {
                    signup_already = false;
                    location.reload();
                },
                error:function(e, d, m) {
                    signup_already = false;
                    WaitingStop();
                    if(e.responseText == undefined) return;
                    if(e.responseText == 'successfully'){
                        document.getElementsByClassName('content')[0].className += ' success';
                        document.getElementById('iferrortext').innerHTML = 'Вам было отправлено письмо с ссылкой для подтверждения почты';
                        return;
                    }
                    document.getElementsByClassName('content')[0].className += ' error';
                    if(e.responseText == 'email-taken') document.getElementById('iferrortext').innerHTML = 'Данный адрес электронной почты уже используется';
                    else if(e.responseText == 'username-taken') document.getElementById('iferrortext').innerHTML = 'Данный логин уже используется';
                    else if(e.responseText == 'email-null') document.getElementById('iferrortext').innerHTML = 'Пожалуйста, введите действительный адрес электронной почты';
                    else if(e.responseText == 'password-null') document.getElementById('iferrortext').innerHTML = 'Пароль не найден\nВозможно, возникла ошибка';
                    else if(e.responseText == 'password-few-length') document.getElementById('iferrortext').innerHTML = 'Пароль должен быть не менее 6 символов';
                    else if(e.responseText == 'username-many') document.getElementById('iferrortext').innerHTML = 'Слишком длинный логин';
                    else if(e.responseText == 'nick-many') document.getElementById('iferrortext').innerHTML = 'Слишком длинный ник\n(Требуется до 25-ти символов)';
                    else if(e.responseText == 'nick-low') document.getElementById('iferrortext').innerHTML = 'Слишком коротокий ник\n(Требуется от 2-х символов)';
                }
            });
        });
        socket.emit('ur_salt', user);
    });
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