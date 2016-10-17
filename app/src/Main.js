define(function (require) {
    var playersDB = require("database/PlayersDB");
    var teamsDB = require("database/TeamsDB");
    var Game = require("core/Game");

    var getTeamInfoByTeamId = function (teamId) {
        var teamInfo = teamsDB.current.filter(function (team) {
            return team.id === teamId;
        });

        return teamInfo[0];
    };

    var getPlayersByTeamId = function (teamId) {
        var players = playersDB.current.filter(function (player) {
            return player.info.teamId === teamId;
        });

        return players;
    };

    var createGame = function (gameId, homeTeamId, awayTeamId) {
        var homeTeam = {
            id: homeTeamId,
            info: getTeamInfoByTeamId(homeTeamId),
            roster: getPlayersByTeamId(homeTeamId)
        };

        var awayTeam = {
            id: awayTeamId,
            info: getTeamInfoByTeamId(awayTeamId),
            roster: getPlayersByTeamId(awayTeamId)
        };

        return new Game(gameId, homeTeam, awayTeam);
    };

    var init = function () {
        var game = createGame(0, 0, 1);
        game.sim();
    };

    init();
});
