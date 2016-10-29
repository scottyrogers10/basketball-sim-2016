BASE.require([
		"jQuery",
        "BASE.data.DataContext"
], function () {
    var Future = BASE.async.Future;
    var DataContext = BASE.data.DataContext;

    BASE.namespace("components.gem.forms");

    components.gem.forms.IndependentCollection = function (elem, tags, services) {
        var self = this;
        var $elem = $(elem);
        var collectionForm = $(tags["collection"]).controller();
        var confirmDeleteModalFuture = null;
        var dialogModalFuture = null;
        var entityFormFuture = null;
        var entityViewFuture = null;

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
                    componentName: "gem-independent-entity-form",
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

        var createExpirableDelegate = function (Type, displayService) {
            var typeDisplay = displayService.getDisplayByType(Type);
            var edm = displayService.service.getEdm();
            var keys = edm.getPrimaryKeyProperties(Type).concat(edm.getAllKeyProperties(Type));

            var defaultActions = {
                "add": {
                    name: "create",
                    label: function () {
                        return "Create"
                    },
                    callback: function () {
                        var entity = new Type();
                        var window = null;
                        var dataContext = new DataContext(displayService.service);
                        dataContext.addEntity(entity);

                        return getEntityFormModal().chain(function (windowManager) {
                            window = windowManager.window;

                            window.setName("Create " + typeDisplay.labelInstance());

                            setupWindow(typeDisplay, window);

                            var controller = windowManager.controller;
                            var saveFuture = controller.setConfigAsync({
                                displayService: displayService,
                                entity: entity
                            });

                            windowManager.window.showAsync().try();
                            return saveFuture
                        }).chain(function () {
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
                    },
                    isActionable: function (items) {
                        return true;
                    },
                    isPrimary: true
                },
                "edit": {
                    name: "edit",
                    label: function () {
                        return "Edit"
                    },
                    callback: function (items) {
                        var entity = items[0];
                        var window = null;
                        var dataContext = new DataContext(displayService.service);
                        entity = dataContext.loadEntity(entity);

                        return getEntityFormModal().chain(function (windowManager) {
                            window = windowManager.window;

                            window.setName("Edit " + typeDisplay.labelInstance());

                            setupWindow(typeDisplay, window);

                            var controller = windowManager.controller;
                            var saveFuture = controller.setConfigAsync({
                                displayService: displayService,
                                entity: entity
                            });

                            windowManager.window.showAsync().try();
                            return saveFuture
                        }).chain(function () {
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
                            collectionForm.searchAsync();
                        }).finally(function () {
                            dataContext.dispose();
                            window.closeAsync().try();
                        }).try();
                    },
                    isActionable: function (items) {
                        return items.length === 1;
                    },
                    isPrimary: false
                },
                "delete": {
                    name: "delete",
                    label: function () {
                        return "Delete"
                    },
                    callback: function (items) {
                        var window;

                        return getConfirmDeleteModal().chain(function (windowManager) {
                            var controller = windowManager.controller;
                            var confirmFuture = controller.getConfirmationForMessageAsync("Are you sure you want to delete these items?");
                            window = windowManager.window;

                            windowManager.window.showAsync().try();

                            return confirmFuture;
                        }).chain(function () {
                            var removeItemFutures = items.map(function (item) {
                                return displayService.service.update(Type, item, { endDate: new Date() });
                            });
                            return Future.all(removeItemFutures);
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
                            window.closeAsync().try();
                        }).try();
                    },
                    isActionable: function (items) {
                        return items.length > 0;
                    },
                    isPrimary: false
                }
            };

            delegate = {};
            delegate.actions = typeDisplay.actions.slice(0);

            delegate.getProperties = function () {
                return BASE.clone(typeDisplay.listProperties, true);
            };

            delegate.search = function (text, orderByAsc, orderByDesc) {
                var queryable = displayService.service.asQueryable(Type);

                if (typeDisplay.isExpirable) {
                    queryable = queryable.where(function (expBuilder) {
                        return expBuilder.or(
                            expBuilder.property("isExpired").isEqualTo(false)
                            );
                    });
                }

                return typeDisplay.search(queryable, text, orderByAsc, orderByDesc);
            };

            if (typeDisplay.canAdd) {
                delegate.actions.push(defaultActions["add"]);
            }

            if (typeDisplay.canEdit) {
                delegate.actions.push(defaultActions["edit"]);

                delegate.select = function (item) {
                    defaultActions["edit"].callback([item]);
                };

            }

            if (typeDisplay.canDelete) {
                delegate.actions.push(defaultActions["delete"]);
            }

            return delegate;
        };

        var createDelegate = function (Type, displayService) {
            var typeDisplay = displayService.getDisplayByType(Type);

            var add = {
                name: "create",
                label: function () {
                    return "Create"
                },
                callback: function () {

                    var entity = new Type();
                    var window = null;
                    var dataContext = new DataContext(displayService.service);

                    dataContext.addEntity(entity);

                    return getEntityFormModal().chain(function (windowManager) {
                        window = windowManager.window;

                        window.setName("Create " + typeDisplay.labelInstance());

                        setupWindow(typeDisplay, window);

                        var controller = windowManager.controller;
                        var saveFuture = controller.setConfigAsync({
                            displayService: displayService,
                            entity: entity
                        });

                        windowManager.window.showAsync().try();
                        return saveFuture
                    }).chain(function () {
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
                },
                isActionable: function (items) {
                    return true;
                },
                isPrimary: true
            };

            var edit = {
                name: "edit",
                label: function () {
                    return "Edit"
                },
                callback: function (items) {
                    var entity = items[0];
                    var window = null;
                    var dataContext = new DataContext(displayService.service);
                    entity = dataContext.loadEntity(entity);

                    return getEntityFormModal().chain(function (windowManager) {
                        window = windowManager.window;

                        window.setName("Edit " + typeDisplay.labelInstance());

                        setupWindow(typeDisplay, window);

                        var controller = windowManager.controller;
                        var saveFuture = controller.setConfigAsync({
                            displayService: displayService,
                            entity: entity
                        });

                        windowManager.window.showAsync().try();
                        return saveFuture
                    }).chain(function () {
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
                },
                isActionable: function (items) {
                    return items.length === 1;
                },
                isPrimary: false
            };

            var remove = {
                name: "delete",
                label: function () {
                    return "Delete"
                },
                callback: function (items) {
                    var window;

                    return getConfirmDeleteModal().chain(function (windowManager) {
                        var controller = windowManager.controller;
                        var confirmFuture = controller.getConfirmationForMessageAsync("Are you sure you want to delete these items?");
                        window = windowManager.window;

                        windowManager.window.showAsync().try();

                        return confirmFuture;
                    }).chain(function () {
                        var removeItemFutures = items.map(function (item) {
                            return displayService.service.remove(Type, item);
                        });
                        return Future.all(removeItemFutures);
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
                        window.closeAsync().try();
                    }).try();
                },
                isActionable: function (items) {
                    return items.length > 0;
                },
                isPrimary: false
            };

            delegate = {};
            delegate.actions = typeDisplay.actions.slice(0);
            delegate.getProperties = function () {
                return BASE.clone(typeDisplay.listProperties, true);
            };
            delegate.search = function (text, orderByAsc, orderByDesc) {
                return typeDisplay.search(displayService.service.asQueryable(Type), text, orderByAsc, orderByDesc);
            };

            if (typeDisplay.canAdd) {
                delegate.actions.push(add);
            }

            if (typeDisplay.canEdit) {
                delegate.actions.push(edit);

                delegate.select = function (item) {
                    edit.callback([item]);
                };
            }

            if (typeDisplay.canDelete) {
                delegate.actions.push(remove);
            }

            if (Array.isArray(typeDisplay.actions)) {
                delegate.actions = delegate.actions.concat(typeDisplay.actions);
            }

            return delegate;
        };

        self.activated = function () {
            collectionForm.focusSearch();
        };

        self.setDisplay = function (Type, displayService) {
            var typeDisplay = displayService.getDisplayByType(Type);
            var delegate;
            entityViewFuture = null;

            if (typeDisplay.isExpirable) {
                delegate = createExpirableDelegate(Type, displayService);
            } else {
                delegate = createDelegate(Type, displayService);
            }

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
        };

        self.refreshAsync = function () {
           return collectionForm.searchAsync();
        };
    };
});