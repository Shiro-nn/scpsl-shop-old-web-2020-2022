const socket = io('https://socket.scpsl.store', {
    auth: {
        cookie: document.cookie
    }
});