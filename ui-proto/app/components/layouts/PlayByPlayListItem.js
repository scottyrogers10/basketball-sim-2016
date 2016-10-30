BASE.require([
    "jQuery"
], function () {

    BASE.namespace("app.components.layouts");

    app.components.layouts.PlayByPlayListItem = function (elem, tags, services) {
        var self = this;
        var $elem = $(elem);
        var $primaryPlayerPicture = $(tags["primary-player-picture"]);
        var $playDetails = $(tags["play-details"]);
        var $timeLeft = $(tags["time-left"]);
        var $possessionTeam = $(tags["possession-team"]);
        var $score = $(tags["score"]);

        self.createPlayByPlayListItem = function (playInfo) {
            var quarter = playInfo.quarter;
            var timeLeft = playInfo.timeLeft;
            var score = playInfo.score;
            var playType = playInfo.playType;
            var possessionTeam = playInfo.possessionTeam;
            var primaryPlayer = playInfo.primaryPlayer;
            var secondaryPlayer = playInfo.secondaryPlayer;

            var createPlayDetails = function () {
                var possessionTeamAbbr = possessionTeam.abbreviation;
                var primaryPlayerFirstInitial = primaryPlayer.info.firstName.slice(0, 1).toUpperCase() + ".";
                var primaryPlayerLastName = primaryPlayer.info.lastName;
                var primaryPlayerGameStats = primaryPlayer.gameStats[playType.primaryStatType];
                var secondaryText = "";

                if (secondaryPlayer !== null) {
                    var secondaryPlayerFirstInitial = secondaryPlayer.info.firstName.slice(0, 1).toUpperCase() + ".";
                    var secondaryPlayerLastName = secondaryPlayer.info.lastName;
                    var secondaryPlayerGameStats = secondaryPlayer.gameStats[playType.secondaryStatType];

                    var secondaryPlayTypeText = " " + playType.secondaryType + ": ";
                    var secondaryPlayerText = secondaryPlayerFirstInitial + " " + secondaryPlayerLastName;
                    var secondaryStatText = "(" + secondaryPlayerGameStats.value + " " + secondaryPlayerGameStats.abbr + ")";
                    secondaryText = secondaryPlayTypeText + secondaryPlayerText + " " + secondaryStatText;
                }

                var teamText = possessionTeamAbbr;
                var primaryPlayerText = primaryPlayerFirstInitial + " " + primaryPlayerLastName;
                var playTypeText = playType.description + " " + playType.primaryType + ": " + playType.result;
                var statText = "(" + primaryPlayerGameStats.value + " " + primaryPlayerGameStats.abbr + ")";

                $playDetails.text(teamText + " - " + primaryPlayerText + " " + playTypeText + " " + statText + secondaryText);
                $timeLeft.text(timeLeft);
                $possessionTeam.text(possessionTeamAbbr);
                $score.text(score);
                $primaryPlayerPicture.css({
                    "background-image": "url(" + primaryPlayer.info.profileImg + ")"
                });
            };

            createPlayDetails();
        };

        self.setHeightAndPosition = function (topPosition) {
            $elem.css({
                top: topPosition,
                height: $playDetails.outerHeight()
            });
        };

    };
});
