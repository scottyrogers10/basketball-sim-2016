﻿BASE.require([
		"jQuery",
        "BASE.data.DataContext"
], function () {

    BASE.namespace("components.gem.forms");

    var Future = BASE.async.Future;
    var Fulfillment = BASE.async.Fulfillment;
    var emptyFuture = Future.fromResult();
    var DataContext = BASE.data.DataContext;

    components.gem.forms.HistoricalCollection = function (elem, tags, services) {
        var self = this;
        var $elem = $(elem);
        var $ok = $(tags["ok"]);
        var collectionForm = $(tags["collection"]).controller();
        var confirmDeleteModalFuture = null;
        var dialogModalFuture = null;
        var entityFormFuture = null;
        var entityViewFuture = null;
        var fulfillment = null;
        var parentEntity = null;
        var relationship = null;
        var displayService = null;
        var window = null;
        var array = null;

        var getEntityViewFuture = function (viewComponent) {
            if (entityViewFuture == null) {
                return entityViewFuture = services.get("windowService").createModalAsync({
                    componentName: viewComponent.name,
                    height: viewComponent.size && viewComponent.size.height || 500,
                    width: viewComponent.size && viewComponent.size.width || 800
                })
            }

            return entityViewFuture;
        };

        var getConfirmDeleteModal = function () {
            if (confirmDeleteModalFuture == null) {
                return confirmDeleteModalFuture = services.get("windowService").createModalAsync({
                    componentName: "gem-confirm",
                    height: 150,
                    width: 350
                })
            }

            return confirmDeleteModalFuture;
        };

        var getDialogModal = function () {
            if (dialogModalFuture == null) {
                return dialogModalFuture = services.get("windowService").createModalAsync({
                    componentName: "gem-dialog",
                    height: 150,
                    width: 350
                })
            }

            return dialogModalFuture;
        };

        var getEntityFormModal = function () {
            if (entityFormFuture == null) {
                return entityFormFuture = services.get("windowService").createModalAsync({
                    componentName: "gem-one-to-many-collection-entity-form",
                    height: 500,
                    width: 800
                })
            }

            return entityFormFuture;
        };

        var setupWindow = function (typeDisplay, window) {
            if (typeDisplay.windowSize) {
                window.setSize(typeDisplay.windowSize);
            }

            if (typeDisplay.maxWindowSize) {
                window.setMaxSize(typeDisplay.maxWindowSize);
            }

            if (typeDisplay.minWindowSize) {
                window.setMinSize(typeDisplay.minWindowSize);
            }
        };

        self.activated = function () {
            collectionForm.focusSearch();
        };

        self.prepareToDeactivateAsync = function () {
            fulfillment.setValue(parentEntity[relationship.hasMany]);
        };

        self.validateAsync = function () { };

        self.saveAsync = function () { };

        self.setConfigAsync = function (config) {
            fulfillment = new Fulfillment();
            displayService = config.displayService;
            parentEntity = config.entity;
            relationship = config.relationship;

            var array;
            var edm = displayService.service.getEdm();
            var keys = edm.getPrimaryKeyProperties(relationship.ofType).concat(edm.getAllKeyProperties(relationship.ofType));
            var Type = relationship.ofType;
            var typeDisplay = displayService.getDisplayByType(Type);
            var queryable;
            var delegate = {
                actions: []
            };

            // If the parent isn't saved remotely use in memory.
            if (parentEntity[relationship.hasKey] == null) {
                array = [];
                queryable = array.asQueryable();

                if (typeDisplay.canAdd) {

                    delegate.actions.push({
                        name: "create",
                        label: function () {
                            return "Create";
                        },
                        isActionable: function () {
                            return true;
                        },
                        isPrimary: true,
                        callback: function () {
                            var entity = new Type();

                            var window = null;
                            return getEntityFormModal().chain(function (windowManager) {
                                window = windowManager.window;

                                window.setName("Add " + typeDisplay.labelInstance());

                                setupWindow(typeDisplay, window);

                                var controller = windowManager.controller;
                                var saveFuture = controller.setConfigAsync({
                                    displayService: displayService,
                                    parentEntity: parentEntity,
                                    entity: entity,
                                    relationship: relationship
                                });

                                windowManager.window.showAsync().try();
                                return saveFuture;
                            }).chain(function () {
                                array.push(entity);
                                parentEntity[relationship.hasMany].push(entity);
                            }).chain(function () {
                                collectionForm.searchAsync("").try();
                            }).finally(function () {
                                window.closeAsync().try();
                            }).try();
                        }
                    });
                }

                if (typeDisplay.canEdit) {
                    var edit = {
                        name: "edit",
                        label: function () {
                            return "Edit";
                        },
                        isActionable: function (items) {
                            return items.length === 1;
                        },
                        isPrimary: false,
                        callback: function (items) {
                            var entity = items[0];
                            var window = null;
                            return getEntityFormModal().chain(function (windowManager) {
                                window = windowManager.window;

                                window.setName("Edit " + typeDisplay.labelInstance());

                                setupWindow(typeDisplay, window);

                                var controller = windowManager.controller;
                                var saveFuture = controller.setConfigAsync({
                                    displayService: displayService,
                                    parentEntity: parentEntity,
                                    entity: entity,
                                    relationship: relationship
                                });

                                windowManager.window.showAsync().try();
                                return saveFuture
                            }).chain(function () {
                                collectionForm.searchAsync().try();
                            }).finally(function () {
                                window.closeAsync().try();
                            }).try();
                        }
                    };

                    delegate.actions.push(edit);

                    delegate.select = function (item, collectionForm) {
                        edit.callback([item], collectionForm);
                    };

                }

                if (typeDisplay.canDelete) {
                    delegate.actions.push({
                        name: "delete",
                        label: function () {
                            return "Delete";
                        },
                        isActionable: function (items) {
                            return items.length > 0;
                        },
                        isPrimary: false,
                        callback: function (items) {
                            var window;

                            return getConfirmDeleteModal().chain(function (windowManager) {
                                var controller = windowManager.controller;
                                var confirmFuture = controller.getConfirmationForMessageAsync("Are you sure you want to delete these items?");
                                window = windowManager.window;

                                windowManager.window.showAsync().try();

                                return confirmFuture;
                            }).chain(function () {
                                items.forEach(function (item) {
                                    array.pop(item);
                                    parentEntity[relationship.hasMany].pop(item);
                                });
                            }).chain(function () {
                                collectionForm.searchAsync().try();
                            }).try();
                        }
                    });
                }

            } else {
                queryable = displayService.service.asQueryable(relationship.ofType).where(function (expBuilder) {
                    return expBuilder.property(relationship.withForeignKey).isEqualTo(parentEntity[relationship.hasKey]);
                });

                if (typeDisplay.canAdd) {

                    delegate.actions.push({
                        name: "create",
                        label: function () {
                            return "Create";
                        },
                        isActionable: function (items) {
                            return true;
                        },
                        isPrimary: true,
                        callback: function () {
                            var entity = new Type();
                            var window = null;
                            var dataContext = new DataContext(displayService.service);
                            entity = dataContext.loadEntity(entity);

                            return getEntityFormModal().chain(function (windowManager) {
                                window = windowManager.window;

                                window.setName("Add " + typeDisplay.labelInstance());

                                setupWindow(typeDisplay, window);

                                var controller = windowManager.controller;
                                var saveFuture = controller.setConfigAsync({
                                    displayService: displayService,
                                    parentEntity: parentEntity,
                                    entity: entity,
                                    relationship: relationship
                                });

                                windowManager.window.showAsync().try();
                                return saveFuture
                            }).chain(function (entity) {
                                entity[relationship.withForeignKey] = parentEntity[relationship.hasKey];
                                return dataContext.saveChangesAsync();
                            }).catch(function (error) {
                                return getDialogModal().chain(function (windowManager) {
                                    var dialogWindow = windowManager.window;
                                    var controller = windowManager.controller;

                                    var fulfillment = controller.getConfirmationForMessageAsync("There was an error while saving: " + error.message);

                                    dialogWindow.setName("Error");
                                    dialogWindow.setColor("#c70000");

                                    return dialogWindow.showAsync().chain(function () {
                                        return fulfillment;
                                    });
                                });
                            }).chain(function () {
                                collectionForm.searchAsync("").try();
                            }).finally(function () {
                                dataContext.dispose();
                                window.closeAsync().try();
                            }).try();
                        }
                    });

                }

                if (typeDisplay.canEdit) {
                    var edit = {
                        name: "edit",
                        label: function () {
                            return "Edit";
                        },
                        isActionable: function (items) {
                            return items.length === 1;
                        },
                        isPrimary: false,
                        callback: function (items) {
                            var entity = items[0];
                            var window = null;

                            var firstEntity = entity;

                            var dataContext = new DataContext(displayService.service);
                            entity = dataContext.loadEntity(entity);

                            return getEntityFormModal().chain(function (windowManager) {
                                window = windowManager.window;

                                window.setName("Edit " + typeDisplay.labelInstance());

                                setupWindow(typeDisplay, window);

                                var controller = windowManager.controller;
                                var saveFuture = controller.setConfigAsync({
                                    displayService: displayService,
                                    parentEntity: parentEntity,
                                    entity: entity,
                                    relationship: relationship
                                });

                                windowManager.window.showAsync().try();
                                return saveFuture
                            }).chain(function (entity) {
                                return dataContext.saveChangesAsync();
                            }).catch(function (error) {
                                return getDialogModal().chain(function (windowManager) {
                                    var dialogWindow = windowManager.window;
                                    var controller = windowManager.controller;

                                    var fulfillment = controller.getConfirmationForMessageAsync("There was an error while saving: " + error.message);

                                    dialogWindow.setName("Error");
                                    dialogWindow.setColor("#c70000");

                                    return dialogWindow.showAsync().chain(function () {
                                        return fulfillment;
                                    });
                                });
                            }).chain(function () {
                                collectionForm.searchAsync().try();
                            }).finally(function () {
                                dataContext.dispose();
                                window.closeAsync().try();
                            }).try();
                        }
                    };

                    delegate.actions.push(edit);

                    delegate.select = function (item) {
                        edit.callback([item]);
                    };
                }

                if (typeDisplay.canDelete) {

                    delegate.actions.push({
                        name: "delete",
                        label: function () {
                            return "Delete";
                        },
                        isActionable: function (items) {
                            return items.length > 0;
                        },
                        isPrimary: false,
                        callback: function (items) {
                            var window = null;
                            var dataContext = new DataContext(displayService.service);
                            return getConfirmDeleteModal().chain(function (windowManager) {
                                var controller = windowManager.controller;
                                var confirmFuture = controller.getConfirmationForMessageAsync("Are you sure you want to delete these items?");
                                window = windowManager.window;
                                windowManager.window.showAsync().try();

                                return confirmFuture;
                            }).chain(function () {
                                items.forEach(function (item) {
                                    var loadedItem = dataContext.loadEntity(item);
                                    loadedItem.endDate = new Date();
                                });

                                return dataContext.saveChangesAsync();
                            }).catch(function (error) {
                                return getDialogModal().chain(function (windowManager) {
                                    var dialogWindow = windowManager.window;
                                    var controller = windowManager.controller;

                                    var fulfillment = controller.getConfirmationForMessageAsync("There was an error while saving: " + error.message);

                                    dialogWindow.setName("Error");
                                    dialogWindow.setColor("#c70000");

                                    return dialogWindow.showAsync().chain(function () {
                                        return fulfillment;
                                    });
                                });
                            }).chain(function () {
                                collectionForm.searchAsync().try();
                            }).finally(function () {
                                dataContext.dispose();
                                window.closeAsync().try();
                            }).try();
                        }
                    });

                }
            }

            delegate.getProperties = function () {
                return BASE.clone(typeDisplay.listProperties, true);
            };

            delegate.search = function (text, orderByAsc, orderByDesc) {
                return typeDisplay.search(queryable, text, orderByAsc, orderByDesc);
            };

            if (typeof typeDisplay.searchAsync === "function") {
                delegate.searchAsync = function () {
                    return typeDisplay.searchAsync.apply(typeDisplay, arguments);
                };
            }

            if (typeDisplay.viewComponent && typeDisplay.viewComponent.name) {
                delegate.select = function (entity) {
                    return getEntityViewFuture(typeDisplay.viewComponent).chain(function (windowManager) {
                        windowManager.controller.setConfig({
                            entity: entity,
                            displaySevice: displayService,
                            delegate: delegate
                        });

                        return windowManager.window.showAsync();
                    }).try();
                };
            }

            collectionForm.setDelegate(delegate);
            return fulfillment;
        };

    };
});