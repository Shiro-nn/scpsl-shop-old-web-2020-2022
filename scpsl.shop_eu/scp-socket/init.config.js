module.exports = {
    apps : [{
        name   : "scp socket",
        script : "./init.js",
        exec_mode : "cluster",
        max_memory_restart: "512M"
    }]
}