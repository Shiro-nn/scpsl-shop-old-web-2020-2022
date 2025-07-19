module.exports = {
    apps : [{
        name   : "web clans wars socket",
        script : "./init.js",
        out_file: "/dev/null",
        error_file: "/dev/null",
        exec_mode : "cluster",
        max_memory_restart: "512M"
    }]
}