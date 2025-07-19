module.exports = {
    apps : [{
        name   : "web proxy",
        script : "./proxy.js",
        exec_mode : "cluster",
        max_memory_restart: "512M"
    }]
}