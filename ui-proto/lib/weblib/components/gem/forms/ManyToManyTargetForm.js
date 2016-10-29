BASE.require([
		"jQuery"
], function () {
    var Future = BASE.async.Future;
    var Fulfillment = BASE.async.Fulfillment;

    BASE.namespace("components.gem.forms");

    components.gem.forms.ManyToManyTargetForm = function (elem, tags, scope) {
        var self = this;
        var $elem = $(elem);
        var $cancel = $(tags["cancel"]);
        var $table = $(tags["table"]);
        var $search = $(tags["search"]);
        var table = $table.controller();
        var window = null;
        var fulfillment = null;
        var selectedItems = null;
        var delegate = null;
        var lastOrderBy = null;
        var entityArray = null;

        var search = function (orderByAsc, orderByDesc) {
            var search = $search.val();
            return table.setQueryableAsync(delegate.search(search, orderByAsc, orderByDesc)).try();
        };

        self.setConfigAsync = function (config) {
            var displayService = config.displayService;
            var service = displayService.service;
            var Type = config.relationship.type;
            var typeDisplay = displayService.getDisplayByType(Type);
            var relationship = config.relationship;
            var edm = displayService.service.getEdm();
            var keys = edm.getPrimaryKeyProperties(Type).concat(edm.getAllKeyProperties(Type));
            var entity = config.entity;
            var primaryKey = edm.getPrimaryKeyProperties(Type)[0];

            var queryable = displayService.service.asQueryable(Type);

            entityArray = entity[relationship.withMany];

            delegate = {};
            delegate.actions = [];

            delegate.getProperties = function () {
                return BASE.clone(typeDisplay.listProperties, true);
            };

            delegate.search = function (text, orderByAsc, orderByDesc) {
                return typeDisplay.search(queryable, text, orderByAsc, orderByDesc);
            };

            delegate.orderBy = function (orderByAsc, orderByDesc) {
                self.searchAsync(undefined, orderByAsc, orderByDesc).try();
            };

            if (typeof typeDisplay.searchAsync === "function") {
                delegate.searchAsync = function () {
                    return typeDisplay.searchAsync.apply(typeDisplay, arguments);
                };
            }

            table.setDelegate(delegate);
            self.searchAsync().try();

            return entityArray.asQueryable().toArray().chain(function (array) {
                selectedItems.clear();

                array.forEach(function (item) {
                    selectedItems.add(item[primaryKey], item);
                });

                return table.redrawItems();
            });
        };

        self.validateAsync = function () {
            return Future.fromResult();
        };

        self.saveAsync = function () {
            var values = selectedItems.getValues();

            if (typeof entityArray.sync === "function") {
                entityArray.sync(values);
            } else {
                entityArray.empty();
                values.forEach(function (value) {
                    entityArray.push(value);
                });
            }

            return Future.fromResult();
        };


        self.searchAsync = function (text) {
            if (!text) {
                text = $search.val();
            } else {
                $search.val(text);
            }

            return table.setQueryableAsync(delegate.search(text, table.getOrderAscendingColumns(), table.getOrderDescendingColumns()));
        };

        $search.on("keyup", function () {
            search(table.getOrderAscendingColumns(), table.getOrderDescendingColumns());
        });

        $search.on("keydown", function (event) {
            if (event.which === 13) {
                return false;
            }
        });

        selectedItems = table.getSelectedItems();
    };
});