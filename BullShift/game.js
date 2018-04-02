var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var g_game;
// Main entry point into the application.
window.onload = function () {
    BullShift.MessageBus.initialize();
    BullShift.ComponentManager.initialize();
    var game = new BullShift.Game();
    //temp
    g_game = game;
    game.start();
};
/// <reference path="lib/pixi.d.ts" />
var BullShift;
(function (BullShift) {
    var GameScreenName;
    (function (GameScreenName) {
        GameScreenName["PLAY_SCREEN"] = "playScreen";
    })(GameScreenName || (GameScreenName = {}));
    var GameState;
    (function (GameState) {
        GameState[GameState["LEVEL_LOADING"] = 0] = "LEVEL_LOADING";
        GameState[GameState["PLAYING"] = 1] = "PLAYING";
        GameState[GameState["PAUSED"] = 2] = "PAUSED";
    })(GameState || (GameState = {}));
    var Game = /** @class */ (function () {
        function Game() {
            this._gameScreens = {};
            this._activeGameScreen = undefined;
            this._state = GameState.LEVEL_LOADING;
        }
        Game.prototype.update = function (dt) {
            if (this._state == GameState.LEVEL_LOADING) {
                if (!this._activeLevel.preloading) {
                    this._activeLevel.load();
                    this._state = GameState.PLAYING;
                }
                else {
                    console.log("Still preloading. Waiting...");
                }
            }
            // TODO: check for signals of a level change.
        };
        Game.prototype.start = function () {
            console.info("start");
            // TODO: fit to screen with given aspect ratio.
            this._application = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
            document.getElementById('content').appendChild(this._application.view);
            this.setActiveLevel(new BullShift.Level(this._application, "testLevel", "assets/levels/testLevel.json"));
            this.initializeUI();
            // Kickoff loading
            this.initialLoad();
            // delta is 1 if running at 100% performance
            // creates frame-independent transformation
            this._application.ticker.add(function (dt) {
                this.update(dt);
            }.bind(this));
        };
        Game.prototype.onMessage = function (message) {
            switch (message.name) {
                default:
                    break;
            }
        };
        Game.prototype.setActiveLevel = function (level) {
            if (this._activeLevel) {
                this._activeLevel.scene.deactivate();
                this._activeLevel.unload();
            }
            this._activeLevel = level;
            this._activeLevel.scene.activate();
        };
        Game.prototype.setActiveGameScreen = function (name) {
            if (this._activeGameScreen) {
                this._activeGameScreen.deactivate();
            }
            this._activeGameScreen = this._gameScreens[name];
            this._activeGameScreen.activate();
        };
        Game.prototype.initializeUI = function () {
            // Create and load all screens.
            this._gameScreens[GameScreenName.PLAY_SCREEN] = new BullShift.PlayScreen(this._application);
            this._gameScreens[GameScreenName.PLAY_SCREEN].load();
            this.setActiveGameScreen(GameScreenName.PLAY_SCREEN);
        };
        Game.prototype.initialLoad = function () {
            // Load all screens.
            for (var s in this._gameScreens) {
                this._gameScreens[s].load();
            }
        };
        Game.TILE_SIZE = 32;
        return Game;
    }());
    BullShift.Game = Game;
})(BullShift || (BullShift = {}));
var BullShift;
(function (BullShift) {
    var Scene = /** @class */ (function () {
        function Scene(application, name) {
            this._isActive = false;
            this._gameObjects = {};
            this._application = application;
            this.name = name;
            this._container = new PIXI.Container();
        }
        Scene.prototype.addObject = function (obj) {
            if (this._gameObjects[obj.name]) {
                throw new Error("Error: this scene already contains an game object called " + obj.name + ". Object names must be unique.");
            }
            this._gameObjects[obj.name] = obj;
            this._container.addChild(obj.internalData);
            obj.onSceneAdd(this);
        };
        Scene.prototype.activate = function () {
            this._isActive = true;
            this._application.stage.addChild(this._container);
        };
        Scene.prototype.deactivate = function () {
            this._isActive = false;
            this._application.stage.removeChild(this._container);
        };
        Scene.prototype.load = function () {
            for (var o in this._gameObjects) {
                this._gameObjects[o].load();
            }
        };
        return Scene;
    }());
    BullShift.Scene = Scene;
})(BullShift || (BullShift = {}));
var BullShift;
(function (BullShift) {
    var GameScreen = /** @class */ (function () {
        function GameScreen(application, name) {
            this._application = application;
            this.name = name;
            this._isActive = false;
            this._scene = new BullShift.Scene(application, "GSScene_" + name);
        }
        GameScreen.prototype.activate = function () {
            this._isActive = true;
            this._scene.activate();
        };
        GameScreen.prototype.deactivate = function () {
            this._isActive = false;
            this._scene.deactivate();
        };
        GameScreen.prototype.load = function () {
            this._scene.load();
        };
        GameScreen.prototype.addButton = function (name, assetPath, callback, x, y) {
            var obj = new BullShift.GameObject(name);
            obj.addComponent(new BullShift.UIButtonComponent(name = "_component", assetPath, callback));
            obj.x = x;
            obj.y = y;
            this._scene.addObject(obj);
            return obj;
        };
        return GameScreen;
    }());
    BullShift.GameScreen = GameScreen;
})(BullShift || (BullShift = {}));
/// <reference path="game.ts" />
var BullShift;
(function (BullShift) {
    var PlayScreen = /** @class */ (function (_super) {
        __extends(PlayScreen, _super);
        function PlayScreen(application) {
            var _this = _super.call(this, application, "PlayScreen") || this;
            _this._upCtrl = _this.addButton("upCtrl", 'assets/ctrl_up.png', _this.upPressed.bind(_this), BullShift.Game.TILE_SIZE * 2, _this._application.screen.height - (BullShift.Game.TILE_SIZE * 4));
            _this._downCtrl = _this.addButton("downCtrl", 'assets/ctrl_down.png', _this.downPressed.bind(_this), BullShift.Game.TILE_SIZE * 2, _this._application.screen.height - (BullShift.Game.TILE_SIZE * 2));
            _this._leftCtrl = _this.addButton("leftCtrl", 'assets/ctrl_left.png', _this.leftPressed.bind(_this), BullShift.Game.TILE_SIZE * 1, _this._application.screen.height - (BullShift.Game.TILE_SIZE * 3));
            _this._rightCtrl = _this.addButton("rightCtrl", 'assets/ctrl_right.png', _this.rightPressed.bind(_this), BullShift.Game.TILE_SIZE * 3, _this._application.screen.height - (BullShift.Game.TILE_SIZE * 3));
            return _this;
        }
        PlayScreen.prototype.leftPressed = function () {
            BullShift.Message.createAndSend("Player:moveLeft", this);
        };
        PlayScreen.prototype.rightPressed = function () {
            BullShift.Message.createAndSend("Player:moveRight", this);
        };
        PlayScreen.prototype.upPressed = function () {
            BullShift.Message.createAndSend("Player:moveUp", this);
        };
        PlayScreen.prototype.downPressed = function () {
            BullShift.Message.createAndSend("Player:moveDown", this);
        };
        return PlayScreen;
    }(BullShift.GameScreen));
    BullShift.PlayScreen = PlayScreen;
})(BullShift || (BullShift = {}));
var BullShift;
(function (BullShift) {
    var Message = /** @class */ (function () {
        function Message(name, sender, context) {
            this.name = name;
            this.sender = sender;
            6;
            this.context = context;
        }
        Message.createAndSend = function (name, sender, context) {
            new Message(name, sender, context).send();
        };
        Message.subscribe = function (name, handler) {
            MessageBus.addSubscriber(name, handler);
        };
        Message.prototype.send = function () {
            MessageBus.post(this);
        };
        return Message;
    }());
    BullShift.Message = Message;
    var MessageBus = /** @class */ (function () {
        function MessageBus() {
            this._subscriptions = {};
            if (MessageBus._inst) {
                throw new Error("Message bus already exists!");
            }
        }
        MessageBus.initialize = function () {
            MessageBus._inst = new MessageBus();
        };
        MessageBus.addSubscriber = function (name, handler) {
            console.log("Adding subscription for: " + name);
            if (!MessageBus._inst._subscriptions[name]) {
                MessageBus._inst._subscriptions[name] = [];
            }
            MessageBus._inst._subscriptions[name].push(handler);
        };
        MessageBus.post = function (message) {
            if (MessageBus._inst._subscriptions[message.name]) {
                for (var s in MessageBus._inst._subscriptions[message.name]) {
                    MessageBus._inst._subscriptions[message.name][s].onMessage(message);
                }
            }
            else {
                console.warn("Nothing is subscribed to message named " + message.name);
            }
        };
        return MessageBus;
    }());
    BullShift.MessageBus = MessageBus;
})(BullShift || (BullShift = {}));
var BullShift;
(function (BullShift) {
    var GameObject = /** @class */ (function () {
        function GameObject(name) {
            this._components = [];
            this._children = [];
            this._name = name;
            this._container = new PIXI.Container();
        }
        Object.defineProperty(GameObject.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "internalData", {
            get: function () {
                return this._container;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "x", {
            get: function () {
                return this._container.x;
            },
            set: function (value) {
                this._container.x = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "y", {
            get: function () {
                return this._container.y;
            },
            set: function (value) {
                this._container.y = value;
            },
            enumerable: true,
            configurable: true
        });
        GameObject.prototype.onSceneAdd = function (scene) {
            this._scene = scene;
        };
        GameObject.prototype.update = function (dt) {
            for (var c in this._components) {
                this._components[c].update(dt);
            }
            for (var c in this._children) {
                this._children[c].update(dt);
            }
        };
        GameObject.prototype.addChild = function (child) {
            this._children.push(child);
        };
        GameObject.prototype.addComponent = function (component) {
            component.gameObject = this;
            this._components.push(component);
        };
        GameObject.prototype.load = function () {
            for (var c in this._components) {
                this._components[c].load();
                var comp = this._components[c];
                if (isRenderable(comp)) {
                    this._container.addChild(comp.internalData);
                }
            }
        };
        return GameObject;
    }());
    BullShift.GameObject = GameObject;
    function isRenderable(object) {
        var myInterface = object;
        return myInterface.internalData !== undefined;
    }
    BullShift.isRenderable = isRenderable;
})(BullShift || (BullShift = {}));
/// <reference path="../igameobjectcomponent.ts" />
var BullShift;
(function (BullShift) {
    var SpriteComponentConfig = /** @class */ (function () {
        function SpriteComponentConfig() {
        }
        SpriteComponentConfig.prototype.populateFromJson = function (jsonConfiguration) {
            if (!jsonConfiguration.name) {
                throw new Error("SpriteComponentConfig json must contain a name!");
            }
            this.name = jsonConfiguration.name;
            if (!jsonConfiguration.asset) {
                throw new Error("SpriteComponentConfig json must contain an asset!");
            }
            this.assetPath = jsonConfiguration.asset;
        };
        SpriteComponentConfig.create = function (name, assetPath) {
            var config = new SpriteComponentConfig();
            config.name = name;
            config.assetPath = assetPath;
            return config;
        };
        return SpriteComponentConfig;
    }());
    BullShift.SpriteComponentConfig = SpriteComponentConfig;
    var SpriteComponent = /** @class */ (function () {
        function SpriteComponent(config) {
            this._config = config;
            this.name = config.name;
            this._assetPath = config.assetPath;
        }
        Object.defineProperty(SpriteComponent.prototype, "internalData", {
            get: function () {
                return this._sprite;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteComponent.prototype, "x", {
            get: function () {
                return this._sprite.x;
            },
            set: function (value) {
                this._sprite.x = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteComponent.prototype, "y", {
            get: function () {
                return this._sprite.y;
            },
            set: function (value) {
                this._sprite.y = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteComponent.prototype, "width", {
            get: function () {
                return this._sprite.width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteComponent.prototype, "height", {
            get: function () {
                return this._sprite.height;
            },
            enumerable: true,
            configurable: true
        });
        SpriteComponent.prototype.load = function () {
            this._sprite = PIXI.Sprite.fromImage(this._assetPath);
        };
        SpriteComponent.prototype.update = function (dt) {
        };
        SpriteComponent.prototype.clone = function () {
            return new SpriteComponent(this._config);
        };
        return SpriteComponent;
    }());
    BullShift.SpriteComponent = SpriteComponent;
})(BullShift || (BullShift = {}));
/// <reference path="sprite/spritecomponent.ts" />
var BullShift;
(function (BullShift) {
    var UIButtonComponent = /** @class */ (function (_super) {
        __extends(UIButtonComponent, _super);
        function UIButtonComponent(name, assetPath, callback) {
            var _this = _super.call(this, BullShift.SpriteComponentConfig.create(name, assetPath)) || this;
            _this._callback = callback;
            return _this;
        }
        UIButtonComponent.prototype.load = function () {
            _super.prototype.load.call(this);
            this._sprite.on('pointerup', this._callback);
            this._sprite.interactive = true;
            this._sprite.buttonMode = true;
        };
        UIButtonComponent.prototype.update = function (dt) {
        };
        UIButtonComponent.prototype.clone = function () {
            return new UIButtonComponent(this.name, this._assetPath, this._callback);
        };
        return UIButtonComponent;
    }(BullShift.SpriteComponent));
    BullShift.UIButtonComponent = UIButtonComponent;
})(BullShift || (BullShift = {}));
var BullShift;
(function (BullShift) {
    var TileMapComponent = /** @class */ (function () {
        function TileMapComponent(name, assetPath) {
            this._tiles = [];
            this.name = name;
            this._assetPath = assetPath;
        }
        Object.defineProperty(TileMapComponent.prototype, "internalData", {
            get: function () {
                return this._container;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TileMapComponent.prototype, "x", {
            get: function () {
                return this._container.x;
            },
            set: function (value) {
                this._container.x = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TileMapComponent.prototype, "y", {
            get: function () {
                return this._container.y;
            },
            set: function (value) {
                this._container.y = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TileMapComponent.prototype, "width", {
            get: function () {
                return this._tileSize * this._tilesWide;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TileMapComponent.prototype, "height", {
            get: function () {
                return this._tileSize * this._tilesHigh;
            },
            enumerable: true,
            configurable: true
        });
        TileMapComponent.prototype.load = function () {
            //this._sprite = PIXI.Sprite.fromImage( this._assetPath );
        };
        TileMapComponent.prototype.update = function (dt) {
        };
        TileMapComponent.prototype.clone = function () {
            return new TileMapComponent(this.name, this._assetPath);
        };
        return TileMapComponent;
    }());
    BullShift.TileMapComponent = TileMapComponent;
})(BullShift || (BullShift = {}));
var BullShift;
(function (BullShift) {
    var Level = /** @class */ (function () {
        function Level(application, name, jsonAssetPath) {
            this._preloadingDone = false;
            this._components = {};
            this.name = name;
            this._application = application;
            this._jsonAsset = jsonAssetPath;
            this._lookup = name + "_levelFile";
            this._scene = new BullShift.Scene(this._application, this.name + "_scene");
            var loader = new PIXI.loaders.Loader();
            loader.add(this._lookup, this._jsonAsset);
            loader.load(this.onConfigLoaded.bind(this));
        }
        Object.defineProperty(Level.prototype, "preloading", {
            get: function () {
                return !this._preloadingDone;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Level.prototype, "scene", {
            get: function () {
                return this._scene;
            },
            enumerable: true,
            configurable: true
        });
        Level.prototype.load = function () {
            if (!this._preloadingDone) {
                throw new Error("Level load called before preload finished!");
            }
            this._components = BullShift.ComponentManager.getComponentsFromConfiguration(this._configuration);
            if (this._configuration.scene && this._configuration.scene.objects) {
                var configSection = this._configuration.scene.objects;
                this.loadObjects(configSection, undefined);
            }
            // For now, loading the player separately and manually since it is a special case.
            // TODO: this is rubbish, should probably have a custom GO class or something.
            /*if ( this._configuration.scene.player ) {
                let playerConfig = this._configuration.scene.player;

                if ( playerConfig.x === undefined || playerConfig.y === undefined || playerConfig.asset === undefined ) {
                    throw new Error( "Player configuration must have x, y, and asset." );
                }
                let obj = new GameObject( "player" );
                obj.x = playerConfig.x;
                obj.y = playerConfig.y;

                let spriteConfig = new SpriteComponentConfig();
                spriteConfig.assetPath = playerConfig.asset;
                spriteConfig.name = "playerSpriteComponent";
                obj.addComponent( new SpriteComponent( spriteConfig ) );

                this._scene.addObject( obj );
            }*/
            this.scene.load();
        };
        Level.prototype.unload = function () {
        };
        Level.prototype.loadObjects = function (configSection, parentObject) {
            for (var o in configSection) {
                var objConfig = configSection[o];
                if (!objConfig.name) {
                    throw new Error("All game objects must have a name.");
                }
                var obj = new BullShift.GameObject(objConfig.name);
                // TODO: Check if a game object with that name already exists.
                // TODO: pass config to game object and let it parse the config.
                if (objConfig.x) {
                    obj.x = objConfig.x;
                }
                if (objConfig.y) {
                    obj.y = objConfig.y;
                }
                // Link components.
                if (objConfig.components) {
                    for (var c in objConfig.components) {
                        var componentName = objConfig.components[c];
                        if (!this._components[componentName]) {
                            throw new Error("Component not found during linking: " + componentName);
                        }
                        obj.addComponent(this._components[componentName].clone());
                    }
                }
                // Child game objects if there are any.
                if (objConfig.children) {
                    this.loadObjects(objConfig.children, obj);
                }
                // If in a child, make sure to parent it. Otherwise, add it directly to the scene.
                if (parentObject) {
                    parentObject.addChild(obj);
                }
                else {
                    this._scene.addObject(obj);
                }
            }
        };
        Level.prototype.onConfigLoaded = function (loader, resources) {
            console.info("data:", resources[this._lookup].data);
            this._preloadingDone = true;
            this._configuration = resources[this._lookup].data;
        };
        return Level;
    }());
    BullShift.Level = Level;
})(BullShift || (BullShift = {}));
var BullShift;
(function (BullShift) {
    var ComponentManager = /** @class */ (function () {
        function ComponentManager() {
            this._factories = [];
            // Add new factories here.
            this._factories.push(new BullShift.SpriteComponentFactory());
            this._factories.push(new BullShift.MoveComponentFactory());
        }
        ComponentManager.initialize = function () {
            if (!ComponentManager._inst) {
                ComponentManager._inst = new ComponentManager();
            }
        };
        /**
         * Gets components from the provided configuration.
         * @param configuration The JSON-formatted configuration.
         * @returns A dictionary of the name/components created from configuration.
         */
        ComponentManager.getComponentsFromConfiguration = function (configuration) {
            var components = {};
            if (configuration.components) {
                for (var f in ComponentManager._inst._factories) {
                    var extractedComponents = ComponentManager._inst._factories[f].getComponents(configuration.components);
                    for (var c in extractedComponents) {
                        var comp = extractedComponents[c];
                        if (components[comp.name]) {
                            throw new Error("A component named " + comp.name + " already exists. Component names must be unique.");
                        }
                        components[comp.name] = comp;
                    }
                }
            }
            return components;
        };
        return ComponentManager;
    }());
    BullShift.ComponentManager = ComponentManager;
})(BullShift || (BullShift = {}));
var BullShift;
(function (BullShift) {
    var SpriteComponentFactory = /** @class */ (function () {
        function SpriteComponentFactory() {
        }
        SpriteComponentFactory.prototype.getComponents = function (configuration) {
            var components = {};
            if (configuration.sprite) {
                for (var s in configuration.sprite) {
                    var config = new BullShift.SpriteComponentConfig();
                    config.populateFromJson(configuration.sprite[s]);
                    if (components[config.name]) {
                        throw new Error("A component named " + config.name + " already exists. Component names must be unique.");
                    }
                    components[config.name] = new BullShift.SpriteComponent(config);
                }
            }
            return components;
        };
        return SpriteComponentFactory;
    }());
    BullShift.SpriteComponentFactory = SpriteComponentFactory;
})(BullShift || (BullShift = {}));
var BullShift;
(function (BullShift) {
    var MoveComponentMessageConfig = /** @class */ (function () {
        function MoveComponentMessageConfig(name, axis, amount) {
            this.name = name;
            this.axis = axis;
            if (this.axis !== "x" && this.axis !== "y" && this.axis !== "X" && this.axis !== "Y") {
                throw new Error("Move component message axis must be either x or y.");
            }
            if (this.axis === "X") {
                this.axis = "x";
            }
            if (this.axis === "Y") {
                this.axis = "y";
            }
            this.amount = amount;
        }
        return MoveComponentMessageConfig;
    }());
    BullShift.MoveComponentMessageConfig = MoveComponentMessageConfig;
    var MoveComponentConfig = /** @class */ (function () {
        function MoveComponentConfig() {
            this.messages = [];
        }
        MoveComponentConfig.prototype.populateFromJson = function (jsonConfiguration) {
            if (!jsonConfiguration.name) {
                throw new Error("SpriteComponentConfig json must contain a name!");
            }
            this.name = jsonConfiguration.name;
            if (!jsonConfiguration.messages) {
                throw new Error("MoveComponentConfig requires messages to be set");
            }
            for (var m in jsonConfiguration.messages) {
                var cfg = jsonConfiguration.messages[m];
                var mcmc = new MoveComponentMessageConfig(cfg.name, cfg.axis, cfg.amount);
                this.messages.push(mcmc);
            }
        };
        return MoveComponentConfig;
    }());
    BullShift.MoveComponentConfig = MoveComponentConfig;
    var MoveComponent = /** @class */ (function () {
        function MoveComponent(config) {
            this._subscribedMessages = [];
            this._config = config;
            this.name = this._config.name;
            for (var m in config.messages) {
                var mcfg = config.messages[m];
                this._subscribedMessages.push(mcfg);
                BullShift.Message.subscribe(mcfg.name, this);
            }
        }
        MoveComponent.prototype.load = function () {
        };
        MoveComponent.prototype.update = function (dt) {
        };
        MoveComponent.prototype.clone = function () {
            var c = new MoveComponent(this._config);
            return c;
        };
        MoveComponent.prototype.onMessage = function (message) {
            var matches = this._subscribedMessages.filter(function (x) { return x.name == message.name; });
            if (matches.length > 0) {
                var msgCfg = matches[0];
                switch (msgCfg.axis) {
                    case "x":
                        this.gameObject.x += msgCfg.amount;
                        break;
                    case "y":
                        this.gameObject.y += msgCfg.amount;
                        break;
                }
            }
        };
        return MoveComponent;
    }());
    BullShift.MoveComponent = MoveComponent;
})(BullShift || (BullShift = {}));
var BullShift;
(function (BullShift) {
    var MoveComponentFactory = /** @class */ (function () {
        function MoveComponentFactory() {
        }
        MoveComponentFactory.prototype.getComponents = function (configuration) {
            var components = {};
            if (configuration.move) {
                for (var s in configuration.move) {
                    var config = new BullShift.MoveComponentConfig();
                    config.populateFromJson(configuration.move[s]);
                    if (components[config.name]) {
                        throw new Error("A component named " + config.name + " already exists. Component names must be unique.");
                    }
                    components[config.name] = new BullShift.MoveComponent(config);
                }
            }
            return components;
        };
        return MoveComponentFactory;
    }());
    BullShift.MoveComponentFactory = MoveComponentFactory;
})(BullShift || (BullShift = {}));
//# sourceMappingURL=game.js.map