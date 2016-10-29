BASE.require([
    "jQuery"
], function () {

    BASE.namespace("app.components.layouts");

    app.components.layouts.PlayByPlayListItem = function (elem, tags, services) {
        var self = this;
        var $elem = $(elem);
        var $primaryPlayerName = $(tags["primary-player-name"]);

        self.createPlayByPlayListItem = function (playInfo) {
            var quarter = playInfo.quarter;
            var timeLeft = playInfo.timeLeft;
            var score = playInfo.score;
            var playType = playInfo.playType;
            var possessionTeam = playInfo.possessionTeam;
            var primaryPlayer = playInfo.primaryPlayer;
            var secondaryPlayer = playInfo.secondaryPlayer;

            $primaryPlayerName.text(primaryPlayer.info.firstName + " " + primaryPlayer.info.lastName);
        };

    };
});
