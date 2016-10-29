BASE.require([
    "jQuery"
], function () {

    BASE.namespace("app.components.states")

    app.components.states.PlayByPlayState = function (elem, tags, services) {
        var self = this;
        var $elem = $(elem);
        var $playsContainer = $(tags["plays-container"]);

        var createListItemAsync = function () {
            return BASE.web.components.createComponent("play-by-play-list-item").chain(function (listItem) {
                return $(listItem);
            });
        };

        var init = function () {
            self.addPlayByPlayListItem({
                quarter: 1,
                timeLeft: "11:47",
                score: "2-0",
                playType: {
                    primaryType: "Jump Shot",
                    result: "Made",
                    typeDescription: "Pullup"
                },
                possessionTeam: {
                    abbreviation: "UTA"
                },
                primaryPlayer: {
                    info: {
                        firstName: "Rodney",
                        lastName: "Hood"
                    },
                    gameStats: {
                        points: 2
                    }
                },
                secondaryPlayer: null
            });
        };

        self.addPlayByPlayListItem = function (playInfo) {
            return createListItemAsync().chain(function ($listItem) {
                var listItemController = $listItem.controller();
                listItemController.createPlayByPlayListItem(playInfo);

                $playsContainer.append($listItem);
            }).try();

        };

        init();
    };
});
