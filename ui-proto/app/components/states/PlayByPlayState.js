BASE.require([
    "jQuery",
    "app.components.test.PlayByPlayData"
], function() {

    var playByPlayData = app.components.test.PlayByPlayData();

    BASE.namespace("app.components.states")

    app.components.states.PlayByPlayState = function(elem, tags, services) {
        var self = this;
        var $elem = $(elem);
        var $playsContainer = $(tags["plays-container"]);

        var listItemHash = [];
        var scrollTopBuffer = 0;
        var nextListItemTopPosition = 0;
        var playsContainerScrollTopPosition = 0;
        var playsContainerHeight = 0;
        var ticking = false;

        var createListItemAsync = function() {
            return BASE.web.components.createComponent("play-by-play-list-item").chain(function(listItem) {
                return $(listItem);
            });
        };

        var isItemOnScreen = function ($listItem) {
            var listItemHeight = $listItem.height();
            var listItemTopPosition = $listItem.position().top;
            var listItemBottomPosition = listItemTopPosition + listItemHeight;
            var buffer = scrollTopBuffer * playsContainerHeight;

            if ((playsContainerScrollTopPosition - buffer) <= (listItemBottomPosition + playsContainerScrollTopPosition) && ((playsContainerHeight + playsContainerScrollTopPosition) + buffer) >= (listItemTopPosition + playsContainerScrollTopPosition)) {
                return true;
            } else {
                return false;
            }
        };

        var setItemsDisplay = function(items) {
            items.forEach(function ($item) {
                var onScreen = isItemOnScreen($item);

                if (onScreen) {
                    $item.removeClass("visibility-hidden");
                } else {
                    $item.removeClass("visibility-hidden");
                }
            });
        };

        var setItemDisplay = function ($item) {
            setItemsDisplay([$item]);
        };

        var init = function() {
            for (var i = 0; i < 8; i++) {
                playByPlayData.forEach(function (item) {
                    self.addPlayByPlayListItem(item);
                });
            }

            playsContainerScrollTopPosition = $playsContainer.scrollTop();
            playsContainerHeight = $playsContainer.height();
        };

        self.addPlayByPlayListItem = function(playInfo) {
            return createListItemAsync().chain(function($listItem) {
                var listItemController = $listItem.controller();
                listItemController.createPlayByPlayListItem(playInfo);
                listItemHash.push($listItem);
                $playsContainer.append($listItem);
                listItemController.setHeightAndPosition(nextListItemTopPosition);

                nextListItemTopPosition += $listItem.height();
                setItemDisplay($listItem);
            }).try();
        };

        var update = function () {
            ticking = false;
            playsContainerScrollTopPosition = $playsContainer.scrollTop();
            setItemsDisplay(listItemHash);
        };

        var requestTick = function () {
            if (!ticking) {
                requestAnimationFrame(update);
            }

            ticking = true;
        };

        $playsContainer.on("scroll", function () {
            requestTick();
        });

        init();
    };
});
