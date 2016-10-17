define(function (require) {
    var helpers = require("core/Helpers");

    var Game = function (id, homeTeam, awayTeam) {
        this.id = id;
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.totalPossessions = 0;
    };

    Game.prototype.sim = function () {
        this.prepare();
        this.run();
        this.end();
    };

    Game.prototype.prepare = function () {
        this.setStartingLineups();
        this.setTotalPossessions();
    };

    Game.prototype.run = function () {

    };

    Game.prototype.end = function () {

    };

    Game.prototype.setStartingLineups = function () {
        var getStarters = function (players) {
            var starters = players.filter(function (player) {
                return player.info.starter;
            });

            return starters;
        };

        var homeStarters = getStarters(this.homeTeam.roster);
        var awayStarters = getStarters(this.awayTeam.roster);

        this.homeTeam.onCourt = homeStarters;
        this.awayTeam.onCourt = awayStarters;
    };

    Game.prototype.setTotalPossessions = function () {
        var homeTeamPace = this.homeTeam.info.pace;
        var awayTeamPace = this.awayTeam.info.pace;

        this.totalPossessions = Math.floor(((homeTeamPace + awayTeamPace) / 2) + Math.floor(helpers.getRandNum(-5, 5)));
    };

    return Game;
});
