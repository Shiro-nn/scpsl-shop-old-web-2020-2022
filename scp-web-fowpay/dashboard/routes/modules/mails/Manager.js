const { SMTPClient } =  require('../emailjs');
const DonateServers = require('../DonateServers');
const DateToString = require('../DateToString');
const WebHooks = require('./WebHooks');
const Messages = require('./messages/index');
const platform = require('platform');
const servers = {
    accounts: new SMTPClient({host:'smtp.yandex.ru',user:'accounts@scpsl.store',password:'',ssl:true}),
    ips: new SMTPClient({host:'smtp.yandex.ru',user:'ips@scpsl.store',password:'',ssl:true}),
    donates: new SMTPClient({host:'smtp.yandex.ru',user:'donate@scpsl.store',password:'',ssl:true})
}
const sends = {
    accounts: {
        register: function(account, verify) {
            servers.accounts.send({
                from: 'Уведомление аккаунта <accounts@scpsl.store>',
                to: account.email,
                subject: 'Успешная регистрация',
                text: 'Не удалось загрузить контент сообщения',
                attachment: Messages.register(account.user, verify)
            });
        },
        verify: function(account, ipinfo, useragent, link, callback) {
            const browser = platform.parse(useragent)?.toString();
            const username = account.name == '' ? account.user : account.name;
            servers.accounts.send({
                from: 'Уведомление аккаунта <accounts@scpsl.store>',
                to: account.email,
                subject: 'Подтверждение аккаунта',
                text: 'Не удалось загрузить контент сообщения',
                attachment: Messages.verify(username, ipinfo, browser, link)
            }, callback);
        },
        reset: function(account, ipinfo, useragent, link, callback) {
            const browser = platform.parse(useragent)?.toString();
            const username = account.name == '' ? account.user : account.name;
            servers.accounts.send({
                from: 'Уведомление аккаунта <accounts@scpsl.store>',
                to: account.email,
                subject: 'Запрос на сброс пароля',
                text: 'Не удалось загрузить контент сообщения',
                attachment: Messages.reset(username, ipinfo, browser, link)
            }, callback);
        },
        changed: function(account, ipinfo, useragent) {
            const browser = platform.parse(useragent)?.toString();
            const username = account.name == '' ? account.user : account.name;
            servers.accounts.send({
                from: 'Уведомление аккаунта <accounts@scpsl.store>',
                to: account.email,
                subject: 'Уведомление об изменении пароля',
                text: 'Не удалось загрузить контент сообщения',
                attachment: Messages.changed(username, ipinfo, browser)
            });
        },
    },
    ips: function(account, ipinfo, useragent)
    {
        const browser = platform.parse(useragent)?.toString();
        const username = account.name == '' ? account.user : account.name;
        servers.ips.send({
            from: 'Система безопасности <ips@scpsl.store>',
            to: account.email,
            subject: 'Уведомление о входе в аккаунт',
            text: 'Не удалось загрузить контент сообщения',
            attachment: Messages.ips(username, ipinfo, browser)
        });
    },
    donates:{
        balanceup: function(account, sum, method)
        {
            const username = account.name == '' ? account.user : account.name;
            servers.donates.send({
                from: 'Логгер баланса <donate@scpsl.store>',
                to: account.email,
                subject: 'Уведомление о пополнении баланса',
                text: 'Не удалось загрузить контент сообщения',
                attachment: Messages.balanceup(username, account.balance, sum, method)
            });
            WebHooks.balanceup({user:username, avatar:account.avatar, id:account.id, balance:account.balance}, sum, method);
        },
        role: function(account, name, color, sum, server)
        {
            const username = account.name == '' ? account.user : account.name;
            servers.donates.send({
                from: 'Логгер покупок <donate@scpsl.store>',
                to: account.email,
                subject: 'Уведомление о покупке привилегии',
                text: 'Не удалось загрузить контент сообщения',
                attachment: Messages.donate(username, account.balance, 'Готовая роль', color, sum, name, server)
            });
            WebHooks.donate({user:username, avatar:account.avatar, id:account.id}, name, sum, server, color);
        },
        ra: function(account, donate, sum)
        {
            const username = account.name == '' ? account.user : account.name;
            const server = DonateServers.GetById(donate.server);
            servers.donates.send({
                from: 'Логгер покупок <donate@scpsl.store>',
                to: account.email,
                subject: 'Уведомление о покупке привилегии',
                text: 'Не удалось загрузить контент сообщения',
                attachment: Messages.donate(username, account.balance, 'Сборка админки', donate.color, sum, donate.prefix, server)
            });
            WebHooks.donate({user:username, avatar:account.avatar, id:account.id}, donate.prefix, sum, server, donate.color);
        },
        customize: function(account, sum, expires)
        {
            if(sum < 1) return;
            const _expires = DateToString(new Date(expires));
            const username = account.name == '' ? account.user : account.name;
            servers.donates.send({
                from: 'Логгер покупок <donate@scpsl.store>',
                to: account.email,
                subject: 'Уведомление о покупке кастомизации',
                text: 'Не удалось загрузить контент сообщения',
                attachment: Messages.visualDonate(username, account.balance, 'Кастомизация', 'кастомизации', sum, _expires)
            });
            WebHooks.visualDonate({user:username, avatar:account.avatar, id:account.id}, 'Кастомизация', sum, _expires, '#2283bf');
        },
        visual: function(account, sum, expires)
        {
            if(sum < 1) return;
            const _expires = DateToString(new Date(expires));
            const username = account.name == '' ? account.user : account.name;
            servers.donates.send({
                from: 'Логгер покупок <donate@scpsl.store>',
                to: account.email,
                subject: 'Уведомление о покупке визуала',
                text: 'Не удалось загрузить контент сообщения',
                attachment: Messages.visualDonate(username, account.balance, 'Визуал', 'визуала', sum, _expires)
            });
            WebHooks.visualDonate({user:username, avatar:account.avatar, id:account.id}, 'Визуал', sum, _expires, '#d108ba');
        }
    }
}
module.exports = sends;