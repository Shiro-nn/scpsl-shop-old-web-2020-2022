module.exports = {
    ItsAdmin(data) {
        return this.ItsSlAdmin(data) || this.ItsHrpSlAdmin(data) || this.ItsGModAdmin(data);
    },
    ItsAllSlAdmin(data) {
        return this.ItsSlAdmin(data) || this.ItsHrpSlAdmin(data);
    },
    ItsSlAdmin(data){
        return data.sl.trainee || data.sl.helper || data.sl.mainhelper || data.sl.admin || data.sl.mainadmin || data.sl.owner;
    },
    ItsHrpSlAdmin(data){
        return data.slhrp.trainee || data.slhrp.helper || data.slhrp.mainhelper || data.slhrp.admin || data.slhrp.mainadmin || data.slhrp.owner;
    },
    ItsGModAdmin(data){
        return false;//data.mc.moderator || data.mc.mainmoderator || data.mc.economic || data.mc.guilds;
    },
}