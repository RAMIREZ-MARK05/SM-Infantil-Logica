window.sm = window.sm || {};

(function () {
    var multiPlayerEngine = function (htmlCanvasId, cfg, animationEnd) {
        this.initialize(htmlCanvasId, cfg, animationEnd);
    };
    var p = multiPlayerEngine.prototype = new sm.BaseEngine();
    p.singelton = null;
    p.BaseEngine_initialize = p.initialize;

    p.initialize = function (htmlCanvasId, cfg, animationEnd) {
        this.BaseEngine_initialize(htmlCanvasId, cfg, animationEnd, false);
        p.singelton = this;
        window.mainEngine = this;
        this.setupEnvironment();
        this.disableFade = this.cfg.disableFade;
        this.loaded = false;
        $("#preloadContent").css("background-color", styles.baseColor1);
        $("#preloadText").text(cadenas.cargando);

        //Nos agregamos al stage.
        this.Stage.addChild(this);
    };

    p.stringToFunction = function (str) {
        var arr = str.split(".");
        var fn = (window || this);
        for (var i = 0, len = arr.length; i < len; i++) {
            fn = fn[arr[i]];
        }
        if (typeof fn !== "function") {
            throw new Error("function not found");
        }
        return fn;
    };

    p.BaseEngine_preload = p.preload;
    p.preload = function () {
        createjs.Sound.registerPlugins([createjs.HTMLAudioPlugin, createjs.WebAudioPlugin, createjs.FlashAudioPlugin]);

        if (!createjs.Sound.isReady()) {
            alert("error");
        }

        var audiosForRegister = [];
        var audioPath = "data/audios/";
        for (var fx = 0 in audios) {
            audiosForRegister.push({ id: audios[fx], src: audios[fx] + ".mp3" });
        }
        if (navigator.userAgent.indexOf("MSIE") > -1) {
            createjs.Sound.alternateExtensions = ["ogg"];
            createjs.Sound.registerSounds(audiosForRegister, audioPath);
            this.handleLoad();
        } else {
            createjs.Sound.addEventListener("fileload", createjs.proxy(this.handleLoad, this));
            createjs.Sound.alternateExtensions = ["ogg"];
            createjs.Sound.registerSounds(audiosForRegister, audioPath);
        }
    };

    p.BaseEngine_handleLoad = p.handleLoad;
    p.handleLoad = function () {
        createjs.Sound.removeAllEventListeners();
        $("#preloadContent").css("background-image", "url('data/imgs/loaded.png')");
        $("#preloadContent").css("cursor", "pointer");
        $("#preloadText").text("");
        //$("#preloadContent").bind('click', function () {
            window.onresize = p.singelton.onResizeWindow;
            if (p.singelton != null) {
                p.singelton.fadeOut(1000, createjs.proxy(p.singelton.runTimed, p.singelton), p.singelton, document.getElementById("preloadContent"));
            } else {
                this.setupObjects();
            }
            this.running = true;
        //});
    };

    p.BaseEngine_setupObjects = p.setupObjects;
    p.setupObjects = function () {
        this.numItems = this.cfg.items.length;
        this.activeIndex = 0;

        // Creamos el menu de seleci�n de n�mero de jugadores.
        var startCallback = this.disableFade ? createjs.proxy(this.start, this): this.fadeIn(2000, createjs.proxy(this.start, this), this);
        this.menuNumPlayers = new sm.MenuNumPlayers(this.cfg.menuNumPlayers, this, startCallback);

        // Creamos el menu de selecci�n de icono de jugador.
        this.menuIconPlayer = new sm.MenuIconPlayer(this.cfg.menuSelIconPlayer, this);

        // Creamos el menu de turno de jugador.
        this.menuTurnPlayers = new sm.MenuTurnPlayers(this.cfg.menuSelIconPlayer, this);

        // Creamos el menu de turno de jugador.
        this.endScene = new sm.EndScene(this.cfg.menuSelIconPlayer, this);

        // Creamos las pantallas de actividades.
        this.engines = [];
        this.states = { interactives: [] };
        for (var i = 0 in this.cfg.items) {
            var itemDef = this.cfg.items[i];
            itemDef.cfg.autoEvaluate = this.cfg.autoEvaluate;
            itemDef.cfg.platform = this.cfg.platform;
            var classEngine = this.stringToFunction(itemDef.engine);
            sm.ClassEngine = classEngine;
            var engine = new sm.ClassEngine(this.htmlCanvasId, itemDef.cfg, null, false);
            engine.imageSectionKey = itemDef.imageSectionKey;
            engine.originalWidth = this.originalWidth;
            engine.originalHeight = this.originalHeight;
            engine.getSingelton = this.getSingelton;
            engine.visible = false;
            engine.onReset = createjs.proxy(this.onReset, this);
            this.addChild(engine);
            this.engines.push(engine);
            this.states.interactives.push(null);
            this.traceTotal++;
        }

        // Creamos la barra de progreso.
        this.progressBar = new sm.ProgressImageBar(this.engines.length, 2, styles.icons.Steps, styles.icons.StepsActive);

        // Animaci�n final
        if (this.animationEnd != null && this.animationEnd != undefined) {
            this.animationEnd.width = this.originalWidth;
            this.animationEnd.height = this.originalHeight;
        }

        this.BaseEngine_setupObjects();
        this.resizeCanvas();
    };

    p.BaseEngine_onReset = p.onReset;
    p.onReset = function (target) {
        this.progressBar.x = 20;
        this.progressBar.y = 0;
        target.footerTool.addChild(this.progressBar);
    };

    p.BaseEngine_run = p.run;
    p.run = function () {
        this.resizePreload();
        window.onresize = createjs.proxy(this.resizePreload, this);
        this.Stage = this.getStage();
        this.preload();
    };

    p.showLoadingScreen = function() {
        $("#preloadContent").css("display", "block");
        $("#preloadContent").css("opacity", "1");
        $("#mainContent").css("display", "none");
    };

    p.hideLoadingScreen = function () {
        $("#preloadContent").css("display", "none");
        $("#preloadContent").css("opacity", "0");
        $("#mainContent").css("display", "block");
    };

    p.runTimed = function () {
        this.hideLoadingScreen();
        document.body.style.width = '960px';
        this.setupObjects();
        this.menuNumPlayers.show();



        //this.fadeIn(1000, createjs.proxy(this.start, this), this);
    };

    p.start = function () {
        this.menuNumPlayers.setAudio(this.cfg.menuNumPlayers.audioText);
        this.playAudio(this.cfg.menuNumPlayers.audioText);
    };

    p.BaseEngine_stop = p.stop;
    p.stop = function () {
        this.running = false;
        if (!this.iniciado) {
            this.states = { interactives: [] };
        }
        for (var indexEngine = 0; indexEngine < this.engines.length; indexEngine++) {
            this.engines[indexEngine].stop();
            if (!this.iniciado) {
                this.states.interactives.push({});
            }
        }
    };

    p.BaseEngine_tick = p.tick;
    p.tick = function () {
        p.singelton.Stage.update();
        p.singelton.BaseEngine_tick();
    };

    p.resizePreload = function() {
        var factorW = window.innerWidth / this.originalWidth;
        var factorH = window.innerHeight / this.originalHeight;
        switch (this.cfg.sizeMode) {
            case 0:
                // Tama�o original. 
                break;
            case 1:
                // FullScreen manteniendo proporciones. 
                if (factorW <= factorH) {
                    $("#preloadContent").css("zoom", factorW);
                    document.body.style.width = window.innerWidth + "px";
                } else {
                    $("#preloadContent").css("zoom", factorH);
                    document.body.style.width = (this.originalWidth * window.innerHeight / this.originalHeight) + "px";
                }
                break;
            case 2:
                // FullScreen ajustando a pantalla. 
                $("#preloadContent").css("zoom", factorW);
                $("#preloadContent").css("zoom", factorH);
                document.body.style.width = window.innerWidth + "px";
                document.body.style.height = window.innerHeight + "px";
                break;
        }
    };

    p.BaseEngine_onResizeWindow = p.onResizeWindow;
    p.onResizeWindow = function () {
        if (p.singelton != null) {
            p.singelton.resizeCanvas();
        }
    };

    p.BaseEngine_rescaleElements = p.rescaleElements;
    p.rescaleElements = function () {
        this.BaseEngine_rescaleElements();
        for (var indexEngine = 0; indexEngine < this.engines.length; indexEngine++) {
            this.engines[indexEngine].originalWidth = this.originalWidth;
            this.engines[indexEngine].originalHeight = this.originalHeight;
            this.engines[indexEngine].rescaleElements();
        }
    };

    p.BaseEngine_getSingelton = p.getSingelton;
    p.getSingelton = function () {
        return p.singelton;
    };

    p.BaseEngine_getActiveEngine = p.getActiveEngine;
    p.getActiveEngine = function () {
        var scenesToPlayArray = this.players[this.activePlayerIndex].scenesToPlay;
        var activeScenePlayerIndex = scenesToPlayArray[this.activeIndex];
        return this.engines[activeScenePlayerIndex];
    }

    p.onSelectNumPlayers = function (numPlayers, playActivities) {
        this.numPlayers = numPlayers;
        this.playActivities = playActivities;
        this.activePlayerIndex = 0;
        this.players = [];
        var arrayTest = [];
        for (var i = 0; i < this.numPlayers; i++) {
            var scenesToPlayArray = [];
            do {
                scenesToPlayArray = this.GetSceneToPlay(this.numPlayers==1 && !this.cfg.randomScenes);
                arrayTest.push(scenesToPlayArray);
                if (this.samePositions(arrayTest)) {
                    arrayTest.pop();
                } else {
                    break;
                }
            } while (true)
            this.players.push({ avatarIndex: 0, sceneIndex: 0, scenesToPlay: scenesToPlayArray });
        }
        this.stopAudio();
        this.selectedAvatarIndex = [];
        this.progressBar.setSteps(this.playActivities);
        if (this.disableFade) {
            this.showMenuIconPlayers();
        } else {
            this.fadeOut(1000, createjs.proxy(this.showMenuIconPlayers, this), this);
        }
    };

    p.GetSceneToPlay = function(noRamdom) {
        var result = [];
        var aux = [];
        var i;
        // Llenamos un array con los �ndices de 0 a playActivities-1.
        for (i = 0; i < this.playActivities; i++) {
            aux.push(i);
        }
        if (!noRamdom) {
            for (i = 0; i < this.playActivities; i++) {
                var index = Math.floor((Math.random() * aux.length)); // Retorna un n� de 0 a aux.length-1.
                result.push(aux[index]);
                aux.splice(index, 1);
            }
            return result;
        } else {
            return aux;
        }
    };

    p.samePositions = function(arrayTest) {
        if (arrayTest.length < 2) return false;
        for (var i = 0; i < arrayTest.length - 1; i++) {
            for (var j = i + 1; j < arrayTest.length; j++) {
                if (this.elementInSamePosition(arrayTest[i], arrayTest[j])) {
                    return true;
                }
            }
        }
        return false;
    };

    p.elementInSamePosition = function(array1, array2) {
        // Asumimos que las longitudes de ambos arrays son iguales.
        for (var i = 0; i < array1.length; i++) {
            if (array1[i] == array2[i]) {
                return true;
            }
        }
        return false;
    };

    p.showMenuIconPlayers = function () {
        this.menuNumPlayers.hide();
        this.menuIconPlayer.show(this.onSelectIconPlayer);
        if (this.numPlayers == 1) {
            this.menuIconPlayer.setText(this.menuIconPlayer.cfg.messageTextOnlyOnePlayer);
        } else {
            this.menuIconPlayer.setText(this.menuIconPlayer.cfg.messagesText[this.activePlayerIndex]);
        }
        if (this.disableFade) {
            this.onShowMenuIconPlayer();
        } else {
            this.fadeIn(1000, createjs.proxy(this.onShowMenuIconPlayer, this), this);
        }
    };

    p.onShowMenuIconPlayer = function () {
        // TODO: asignar el audio al bot�n de "play audio" del menu de avatars.
        if (this.numPlayers == 1) {
            this.menuIconPlayer.setAudio(this.cfg.menuSelIconPlayer.audioTextOnlyOnePlayer);
            this.playAudio(this.cfg.menuSelIconPlayer.audioTextOnlyOnePlayer);
        } else {
            this.menuIconPlayer.setAudio(this.cfg.menuSelIconPlayer.audiosText[this.activePlayerIndex]);
            this.playAudio(this.cfg.menuSelIconPlayer.audiosText[this.activePlayerIndex]);
        }
    };

    p.onSelectIconPlayer = function (scope, avatarIndex) {
        this.stopAudio();
        this.selectedAvatarIndex.push(avatarIndex);
        if (!this.avatars) {
            this.avatars = [];
            this.miniAvatars = [];
            for (var index in this.cfg.avatars.avatarsId) {
                var avatarId = this.cfg.avatars.avatarsId[index];
                var imageAvatar = ImageManager.getImage(avatarId, this.cfg.avatars.imageSectionKey);
                this.avatars.push(imageAvatar);
                var miniAvatar = new createjs.Bitmap(imageAvatar);
                miniAvatar.scaleX = 0.25;
                miniAvatar.scaleY = 0.25;
                miniAvatar.regY = imageAvatar.height / 2;
                miniAvatar.width = imageAvatar.width * miniAvatar.scaleX;
                this.miniAvatars.push(miniAvatar);
            }
        }
        this.players[this.activePlayerIndex].avatarIndex = avatarIndex;
        if (this.activePlayerIndex < this.numPlayers - 1) {
            this.activePlayerIndex ++;
            this.menuIconPlayer.setText(this.menuIconPlayer.cfg.messagesText[this.activePlayerIndex]);
            this.menuIconPlayer.disableIcons(this.selectedAvatarIndex);
            if (this.disableFade) {
                this.onShowMenuIconPlayer();
            } else {
                this.fadeIn(1000, createjs.proxy(this.onShowMenuIconPlayer, this), this);
            }
        } else {
            this.menuIconPlayer.hide();
            this.activePlayerIndex = 0;
            this.processTurnPlayer();
        }
    };

    p.processTurnPlayer = function() {
        this.stopAudio();
        for (var i = 0; i < this.engines.length; i++) {
            this.engines[i].visible = false;
            this.engines[i].playerIndex = undefined;
        }
        if (this.numPlayers > 1) {
            var avatar = this.avatars[this.players[this.activePlayerIndex].avatarIndex];
            var text = this.cfg.menuTurnPlayers.messagesText[this.activePlayerIndex];
            var style = this.cfg.menuTurnPlayers.styles[this.activePlayerIndex];
            this.menuTurnPlayers.show(avatar, text, style, this.onStartTurnPlayer);

            this.menuTurnPlayers.footerTool.removeChild(this.menuTurnPlayers.footerTool.miniAvatar);
            this.menuTurnPlayers.footerTool.miniAvatar = this.miniAvatars[this.players[this.activePlayerIndex].avatarIndex];
            this.menuTurnPlayers.footerTool.miniAvatar.y = (styles.footerSM.height - styles.footerSM.baseLineHeight) / 2;
            this.menuTurnPlayers.footerTool.addChild(this.menuTurnPlayers.footerTool.miniAvatar);
            this.progressBar.x = this.menuTurnPlayers.footerTool.miniAvatar.x + this.menuTurnPlayers.footerTool.miniAvatar.width;
            this.progressBar.y = 0;
            this.menuTurnPlayers.footerTool.addChild(this.progressBar);
            this.progressBar.setProgress(this.players[this.activePlayerIndex].sceneIndex + 1);

            if (this.disableFade) {
                this.onShowTurnPlayer();
            } else {
                this.fadeIn(1000, createjs.proxy(this.onShowTurnPlayer, this), this);
            }
        } else {
            this.processNextScene(this, this.players[this.activePlayerIndex].sceneIndex);
        }
    }

    p.onShowTurnPlayer = function () {
        // TODO: asignar el audio al bot�n de "play audio" del menu de turno.
        this.menuTurnPlayers.setAudio(this.cfg.menuTurnPlayers.audiosText[this.activePlayerIndex]);
        this.playAudio(this.cfg.menuTurnPlayers.audiosText[this.activePlayerIndex]);
    };

    p.onStartTurnPlayer = function () {
        this.menuTurnPlayers.hide();
        this.processNextScene(this, this.players[this.activePlayerIndex].sceneIndex);
    };

    p.processNextScene = function (scope, sceneIndex) {
        this.stopAudio();

        for (var i = 0; i < this.engines.length; i++) {
            this.engines[i].visible = false;
            this.engines[i].playerIndex = undefined;
        }
        var activeEngine = this.getActiveEngine();
        if (activeEngine.running) {
            activeEngine.stop();
            activeEngine.running = false;
            this.activeIndex = sceneIndex;
            activeEngine = this.getActiveEngine();
            activeEngine.stop();
            activeEngine.running = false;
            this.progressBar.setProgress(sceneIndex + 1);
        }
        if (!activeEngine.running) {
            activeEngine.enabled = true;
            activeEngine.visible = true;
            activeEngine.onRunning = this.onRunning;
            ImageManager.defaultSectionKey = activeEngine.imageSectionKey;
            activeEngine.playerIndex = this.activePlayerIndex;
            activeEngine.run();
            this.activeScene = activeEngine;
        } 
        if (this.disableFade) {
            this.onShowScene();
        } else {
            this.fadeIn(1000, createjs.proxy(this.onShowScene, this), this);
        }
    }

    p.onShowScene = function () {
        this.hideLoadingScreen();
        var activeEngine = this.getActiveEngine();
        if (activeEngine.cfg.audioEnunciado) {
            // TODO: asignar el audio al bot�n de "play audio" de la actividad.
            activeEngine.setAudio(activeEngine.cfg.audioEnunciado);
            //this.playAudio(activeEngine.cfg.audioEnunciado);
        }
    };

    p.onRunning = function (target) {
        target.footerTool.removeChild(target.footerTool.miniAvatar);
        target.footerTool.miniAvatar = p.singelton.miniAvatars[p.singelton.players[p.singelton.activePlayerIndex].avatarIndex];
        target.footerTool.miniAvatar.y = (styles.footerSM.height - styles.footerSM.baseLineHeight) / 2;
        target.footerTool.addChild(target.footerTool.miniAvatar);
        p.singelton.progressBar.x = target.footerTool.miniAvatar.x + target.footerTool.miniAvatar.width;
        p.singelton.progressBar.y = 0;
        target.footerTool.addChild(p.singelton.progressBar);
        p.singelton.progressBar.setProgress(p.singelton.players[p.singelton.activePlayerIndex].sceneIndex + 1);
        target.footerTool.addChild(p.singelton.progressBar);
        target.getRepeatButton().visible = p.singelton.cfg.canReset;
    };

    p.BaseEngine_onEndActivity = p.onEndActivity;
    p.onEndActivity = function () {
        // Incrementamos el indice de escena al jugador actual.
        this.players[this.activePlayerIndex].sceneIndex++;
        // pasamos al siguiente jugador.
        this.activePlayerIndex++;
        if (this.activePlayerIndex > this.numPlayers - 1) {
            this.activePlayerIndex = 0;
            var nextSceneIndex = this.players[this.activePlayerIndex].sceneIndex;
            if (nextSceneIndex >= this.playActivities) {
                if (this.animationEnd != null && this.animationEnd != undefined) {
                    this.removeChild(this.activeScene);
                    this.removeChild(this.animationEnd);
                    this.addChild(this.endScene);
                    var avatarImages = [];
                    for (var i in this.players) {
                        var avatarIndex = this.players[i].avatarIndex;
                        avatarImages.push(this.avatars[avatarIndex]);
                    }
                    this.endScene.show(avatarImages, this.animationEnd, this.onHomeClick);
                }
                return;
            }
        }
        if (this.disableFade) {
            setTimeout(createjs.proxy(this.processTurnPlayer, this), 1000);
        } else {
            this.fadeOut(1000, createjs.proxy(this.processTurnPlayer, this), this);
        }
    };

    p.onHomeClick = function () {
        this.stopAudio();
        this.removeChild(this.endScene);
        this.runTimed();
    };

    p.BaseEngine_onRepeatScene = p.onRepeatScene;
    p.onRepeatScene = function () {
        var engine = this.engines[this.activeIndex];
        if (this.animationEnd != null) {
            this.animationEnd.stop();
            this.removeChild(this.animationEnd);
        }
        this.removeChild(engine.getRepeatButton());
        this.reset();
    };

    p.hideProgressBar = function() {
        this.progressBar.visible = false;
    }

    sm.MultiPlayerEngine = multiPlayerEngine;
}(window));

(function () {
    var menuNumPlayers = function (cfg, owner, callbackOnReady) {
        this.initialize(cfg, owner, callbackOnReady);
    };

    var p = menuNumPlayers.prototype = new createjs.Container();

    p.Container_initialize = p.initialize;
    p.initialize = function (cfg, owner, callbackOnReady) {
        this.Container_initialize();
        this.name = "menuNumPlayers";
        this.owner = owner;
        this.callbackOnReady = callbackOnReady;
        this.cfg = cfg;
        ImageManager.loadImages("data/imgs/" + this.cfg.imageSectionKey + ".js", this.cfg.imageSectionKey, this.setupObjects, this);
    };

    p.setupObjects = function () {
        this.selectors = [];
        for (var index in this.cfg.selectorsNumPlayer) {
            var selectorNumPlayerDef = this.cfg.selectorsNumPlayer[index];
            var image = ImageManager.getImage(selectorNumPlayerDef.button.imageId, this.cfg.imageSectionKey);
            var imageRoll = ImageManager.getImage(selectorNumPlayerDef.button.imageRollId, this.cfg.imageSectionKey);
            var imageDisabled = ImageManager.getImage(selectorNumPlayerDef.button.imageDisabledId, this.cfg.imageSectionKey);
            var btnSelector = new sm.ImageButton(selectorNumPlayerDef.button.x, selectorNumPlayerDef.button.y, image, imageRoll, imageDisabled, createjs.proxy(this.onButtonClick, this));
            btnSelector.numPlayers = selectorNumPlayerDef.numPlayers;
            btnSelector.playActivities = selectorNumPlayerDef.playActivities;
            this.addChild(btnSelector);
            this.selectors.push(btnSelector);
        }
        //Pastilla (HEADER)
        ImageManager.defaultSectionKey = "global";
        this.headerTool = new sm.HeaderTool(this.owner.originalWidth);

        var audioButtonDef = styles.icons.Audio;
        var audioButtonImage = document.createElement("img");
        audioButtonImage.src = audioButtonDef.src.replace(/_/g, "/");
        audioButtonImage.width = audioButtonDef.width;
        audioButtonImage.height = audioButtonDef.height;

        var audioButtonRooloverDef = styles.icons.Audio_Rollover;
        var audioButtonRooloverImage = document.createElement("img");
        audioButtonRooloverImage.src = audioButtonRooloverDef.src.replace(/_/g, "/");
        audioButtonRooloverImage.width = audioButtonRooloverDef.width;
        audioButtonRooloverImage.height = audioButtonRooloverDef.height;

        var audioButtonDisabledDef = styles.icons.Audio_Desactivado;
        var audioButtonDisabledImage = document.createElement("img");
        audioButtonDisabledImage.src = audioButtonDisabledDef.src.replace(/_/g, "/");
        audioButtonDisabledImage.width = audioButtonDisabledDef.width;
        audioButtonDisabledImage.height = audioButtonDisabledDef.height;

        var audioButtonX = 2;
        var audioButtonY = styles.headerSM.height / 2;
        this.audioButton = new sm.ImageButton(audioButtonX, audioButtonY, audioButtonImage, audioButtonRooloverImage, audioButtonDisabledImage, createjs.proxy(this.onPlayEnunciado, this));
        this.audioButton.regX = 0;
        this.audioButton.regY = audioButtonImage.height / 2;
        this.audioButton.x = audioButtonX;
        this.audioButton.y = styles.headerSM.height / 2;
        this.headerTool.addChild(this.audioButton);
        this.headerTool.setTituloEnunciado(this.cfg.messageText);
        this.headerTool.enunciado.x = audioButtonImage.width + styles.headerSM.objectDistanceBorder;
        this.addChild(this.headerTool);

        //FOOTER
        this.footerTool = new sm.FooterTool(this.owner.originalWidth, 0, this.owner.originalHeight - styles.footerSM.height);
        this.addChild(this.footerTool);
        if (this.callbackOnReady) {
            this.callbackOnReady();
        }
    };

    p.onButtonClick = function (button) {
        if (this.owner.onSelectNumPlayers && button.numPlayers) {
            this.setEnabled(false);
            this.owner.onSelectNumPlayers(button.numPlayers, button.playActivities);
        }
    };

    p.show = function () {
        this.owner.addChild(this);
        this.setEnabled(true);
    };

    p.hide = function () {
        this.owner.removeChild(this);
    };

    p.onPlayEnunciado = function () {
        if (this.audioButton.audioId != undefined && this.audioButton.audioId != null) {
            this.owner.playAudio(this.audioButton.audioId);
        }
    };

    p.setAudio = function (audioId) {
        if (this.audioButton) {
            this.audioButton.audioId = audioId;
        }
    };

    p.setEnabled = function(value) {
        this.enabled = value;
        for (var index in this.selectors) {
            var selector = this.selectors[index];
            selector.setEnabled(value);
        }
    };

    sm.MenuNumPlayers = menuNumPlayers;
}(window));

(function () {
    var menuIconPlayer = function (cfg, owner) {
        this.initialize(cfg, owner);
    };

    var p = menuIconPlayer.prototype = new createjs.Container();

    p.Container_initialize = p.initialize;
    p.initialize = function (cfg, owner) {
        this.Container_initialize();
        this.name = "menuIconPlayer";
        this.owner = owner;
        this.cfg = cfg;

        ImageManager.loadImages("data/imgs/" + this.cfg.imageSectionKey + ".js", this.cfg.imageSectionKey, this.setupObjects, this);
    };

    p.setupObjects = function () {
        this.selectors = [];
        for (var index in this.cfg.selectorsIconPlayer) {
            var selectorsIconPlayerDef = this.cfg.selectorsIconPlayer[index];
            var image = ImageManager.getImage(selectorsIconPlayerDef.button.imageId, this.cfg.imageSectionKey);
            var imageRoll = ImageManager.getImage(selectorsIconPlayerDef.button.imageRollId, this.cfg.imageSectionKey);
            var imageDisabled = ImageManager.getImage(selectorsIconPlayerDef.button.imageDisabledId, this.cfg.imageSectionKey);
            var btnSelector = new sm.ImageButton(selectorsIconPlayerDef.button.x, selectorsIconPlayerDef.button.y, image, imageRoll, imageDisabled, createjs.proxy(this.onButtonClick, this));
            btnSelector.avatarIndex = selectorsIconPlayerDef.avatarIndex;
            this.addChild(btnSelector);
            this.selectors.push(btnSelector);
        }
        //Pastilla (HEADER)
        ImageManager.defaultSectionKey = "global";
        this.headerTool = new sm.HeaderTool(this.owner.originalWidth);

        //FOOTER
        this.footerTool = new sm.FooterTool(this.owner.originalWidth, 0, this.owner.originalHeight - styles.footerSM.height);
        this.addChild(this.footerTool);

        var audioButtonDef = styles.icons.Audio;
        var audioButtonImage = document.createElement("img");
        audioButtonImage.src = audioButtonDef.src.replace(/_/g, "/");
        audioButtonImage.width = audioButtonDef.width;
        audioButtonImage.height = audioButtonDef.height;

        var audioButtonRooloverDef = styles.icons.Audio_Rollover;
        var audioButtonRooloverImage = document.createElement("img");
        audioButtonRooloverImage.src = audioButtonRooloverDef.src.replace(/_/g, "/");
        audioButtonRooloverImage.width = audioButtonRooloverDef.width;
        audioButtonRooloverImage.height = audioButtonRooloverDef.height;

        var audioButtonDisabledDef = styles.icons.Audio_Desactivado;
        var audioButtonDisabledImage = document.createElement("img");
        audioButtonDisabledImage.src = audioButtonDisabledDef.src.replace(/_/g, "/");
        audioButtonDisabledImage.width = audioButtonDisabledDef.width;
        audioButtonDisabledImage.height = audioButtonDisabledDef.height;

        var audioButtonX = 2;
        var audioButtonY = styles.headerSM.height / 2;
        this.audioButton = new sm.ImageButton(audioButtonX, audioButtonY, audioButtonImage, audioButtonRooloverImage, audioButtonDisabledImage, createjs.proxy(this.onPlayEnunciado, this));
        this.audioButton.regX = 0;
        this.audioButton.regY = audioButtonImage.height / 2;
        this.audioButton.x = audioButtonX;
        this.audioButton.y = styles.headerSM.height / 2;
        this.headerTool.addChild(this.audioButton);
        this.headerTool.setTituloEnunciado(this.cfg.messageText);
        this.headerTool.enunciado.x = audioButtonImage.width + styles.headerSM.objectDistanceBorder;
        this.addChild(this.headerTool);
    };

    p.onButtonClick = function (button) {
        this.owner.stopAudio();
        this.setEnabled(false);
        if (this.owner.disableFade) {
            createjs.proxy(this.onSelectIcon, this.owner, this.owner, button.avatarIndex).call();
        } else {
            this.owner.fadeOut(1000, createjs.proxy(this.onSelectIcon, this.owner, button.avatarIndex), this.owner);
        }
    };

    p.setText = function(text) {
        this.headerTool.setTituloEnunciado(text);
    };

    p.show = function (onSelectIconCallback) {
        this.owner.addChild(this);
        this.setEnabled(true);
        this.onSelectIcon = onSelectIconCallback;
    };

    p.disableIcons = function(disabledIcons) {
        this.setEnabled(true);
        for (var i in disabledIcons) {
            var avatarIndex = disabledIcons[i];
            for (var j in this.selectors) {
                var btnSelector = this.selectors[j];
                if (btnSelector.avatarIndex == avatarIndex) {
                    btnSelector.setEnabled(false);
                    break;
                }
            }
        }
    };

    p.hide = function () {
        this.owner.removeChild(this);
    };

    p.onPlayEnunciado = function () {
        if (this.audioButton.audioId != undefined && this.audioButton.audioId != null) {
            this.owner.playAudio(this.audioButton.audioId);
        }
    };

    p.setAudio = function (audioId) {
        if (this.audioButton) {
            this.audioButton.audioId = audioId;
        }
    };

    p.setEnabled = function (value) {
        this.enabled = value;
        for (var index in this.selectors) {
            var selector = this.selectors[index];
            selector.setEnabled(value);
        }
    };

    sm.MenuIconPlayer = menuIconPlayer;
}(window));

(function () {
    var menuTurnPlayers = function (cfg, owner) {
        this.initialize(cfg, owner);
    };

    var p = menuTurnPlayers.prototype = new createjs.Container();

    p.Container_initialize = p.initialize;
    p.initialize = function (cfg, owner) {
        this.Container_initialize();
        this.owner = owner;
        this.cfg = cfg;
        this.name = "menuTurnPlayers";
        ImageManager.loadImages("data/imgs/" + this.cfg.imageSectionKey + ".js", this.cfg.imageSectionKey, this.setupObjects, this);
    };

    p.setupObjects = function() {
        //Pastilla (HEADER)
        ImageManager.defaultSectionKey = "global";
        this.headerTool = new sm.HeaderTool(this.owner.originalWidth);
        var audioButtonDef = styles.icons.Audio;
        var audioButtonImage = document.createElement("img");
        audioButtonImage.src = audioButtonDef.src.replace(/_/g, "/");
        audioButtonImage.width = audioButtonDef.width;
        audioButtonImage.height = audioButtonDef.height;

        var audioButtonRooloverDef = styles.icons.Audio_Rollover;
        var audioButtonRooloverImage = document.createElement("img");
        audioButtonRooloverImage.src = audioButtonRooloverDef.src.replace(/_/g, "/");
        audioButtonRooloverImage.width = audioButtonRooloverDef.width;
        audioButtonRooloverImage.height = audioButtonRooloverDef.height;

        var audioButtonDisabledDef = styles.icons.Audio_Desactivado;
        var audioButtonDisabledImage = document.createElement("img");
        audioButtonDisabledImage.src = audioButtonDisabledDef.src.replace(/_/g, "/");
        audioButtonDisabledImage.width = audioButtonDisabledDef.width;
        audioButtonDisabledImage.height = audioButtonDisabledDef.height;

        var audioButtonX = 2;
        var audioButtonY = styles.headerSM.height / 2;
        this.audioButton = new sm.ImageButton(audioButtonX, audioButtonY, audioButtonImage, audioButtonRooloverImage, audioButtonDisabledImage, createjs.proxy(this.onPlayEnunciado, this));
        this.audioButton.regX = 0;
        this.audioButton.regY = audioButtonImage.height / 2;
        this.audioButton.x = audioButtonX;
        this.audioButton.y = styles.headerSM.height / 2;
        this.headerTool.addChild(this.audioButton);
        this.headerTool.setTituloEnunciado("");
        this.headerTool.enunciado.x = audioButtonImage.width + styles.headerSM.objectDistanceBorder;
        this.addChild(this.headerTool);

        this.footerTool = new sm.FooterTool(this.owner.originalWidth, 0, this.owner.originalHeight - styles.footerSM.height);
        this.addChild(this.footerTool);

        this.startButton = new smInfantil.StartButton(createjs.proxy(this.onStartButtonClick, this));
        this.startButton.regY = this.startButton.height / 2;
        this.startButton.x = this.owner.originalWidth - (this.startButton.width * 1.5);
        this.startButton.y = this.owner.originalHeight / 2;
    };

    p.onStartButtonClick = function() {
        this.owner.stopAudio();
        if (this.owner.disableFade) {
            createjs.proxy(this.onStart, this.owner).call();
        } else {
            this.owner.fadeOut(1000, createjs.proxy(this.onStart, this.owner), this.owner);
        }
    };

    p.show = function (avatarImage, text, style, onStartCallback) {
        this.removeAllChildren();
        this.bkg = new createjs.Shape();
        this.bkg.graphics.beginFill(style.backgroundColor).rect(0, 0, mainEngine.originalWidth, mainEngine.originalHeight);
        this.addChild(this.bkg);
        this.avatarBitmap = new createjs.Bitmap(avatarImage);
        this.avatarBitmap.x = mainEngine.originalWidth / 2 - avatarImage.width / 2;
        //this.avatarBitmap.y = mainEngine.originalHeight / 2.5 - avatarImage.height / 2;
        this.avatarBitmap.y = mainEngine.originalHeight / 2 - avatarImage.height / 2;
        this.addChild(this.avatarBitmap);
        this.messageText = new createjs.Text(text, style.font, style.foreColor);
        this.messageText.x = mainEngine.originalWidth / 2;
        this.messageText.y = mainEngine.originalHeight / 5 * 3;
        this.messageText.textAlign = "center";
        //this.addChild(this.messageText);
        this.addChild(this.startButton);
        this.addChild(this.headerTool);
        this.addChild(this.footerTool);
        this.owner.addChild(this);
        this.headerTool.setTituloEnunciado(text);
        this.onStart = onStartCallback;
    };

    p.hide = function() {
        this.removeAllChildren();
        this.owner.removeChild(this);
    };

    p.onPlayEnunciado = function () {
        if (this.audioButton.audioId != undefined && this.audioButton.audioId != null) {
            this.owner.playAudio(this.audioButton.audioId);
        }
    };

    p.setAudio = function (audioId) {
        if (this.audioButton) {
            this.audioButton.audioId = audioId;
        }
    };

    sm.MenuTurnPlayers = menuTurnPlayers;
}(window));

(function () {
    var endScene = function (cfg, owner) {
        this.initialize(cfg, owner);
    };

    var p = endScene.prototype = new createjs.Container();

    p.Container_initialize = p.initialize;
    p.initialize = function (cfg, owner) {
        this.Container_initialize();
        this.owner = owner;
        this.cfg = cfg;
        this.name = "endScene";
        this.setupObjects();
    };

    p.setupObjects = function () {
    };

    p.onHomeButtonClick = function () {
        this.owner.stopAudio();
        if (this.owner.disableFade) {
            createjs.proxy(this.onHomeCallback, this.owner).call();
        } else {
            this.owner.fadeOut(1000, createjs.proxy(this.onHomeCallback, this.owner), this.owner);
        }
    };

    p.show = function (avatarImages, animationEnd, onHomeCallback) {
        this.removeAllChildren();
        this.animationEnd = animationEnd;
        this.onHomeCallback = onHomeCallback;

        ImageManager.defaultSectionKey = "global";
        this.headerTool = new sm.HeaderTool(this.owner.originalWidth);
        this.footerTool = new sm.FooterTool(this.owner.originalWidth, 0, this.owner.originalHeight - styles.footerSM.height);

        this.homeButton = new smInfantil.HomeButton(createjs.proxy(this.onHomeButtonClick, this));
        this.homeButton.regX = this.homeButton.width / 2;
        this.homeButton.regY = this.homeButton.height / 2;
        this.homeButton.x = this.owner.originalWidth / 2;
        this.homeButton.y = (styles.footerSM.height - styles.footerSM.baseLineHeight) / 2;
        this.footerTool.addChild(this.homeButton);

        var sep = this.owner.originalWidth / (avatarImages.length + 1);
        for (var index = 0; index < avatarImages.length; index++) {
            var avatarImage = avatarImages[index];
            var avatarBitmap = new createjs.Bitmap(avatarImage);
            avatarBitmap.regX = avatarImage.width / 2;
            avatarBitmap.x = sep * (index + 1);
            avatarBitmap.y = mainEngine.originalHeight / 2 - avatarImage.height / 2;
            this.addChild(avatarBitmap);
        }


        this.addChild(this.animationEnd);
        this.addChild(this.headerTool);
        this.addChild(this.footerTool);
        this.animationEnd.run(null);
    };

    p.hide = function () {
        this.removeAllChildren();
        this.owner.removeChild(this);
    };

    sm.EndScene = endScene;
}(window));

(function () {
    var soundManagerDummy = function () {
        this.initialize();
    };

    var p = soundManagerDummy.prototype;

    p.initialize = function () {
    };

    p.inicializarSnd = function() {

    };

    p.play = function (audioId, onPlayCallback, onEndCallback) {
        if (!audioId) return;
        this.stop();
        window.audioInstance = createjs.Sound.play(audioId, createjs.Sound.INTERRUPT_ANY, 0, 0, false);
        if (onEndCallback) {
            window.audioInstance.on("complete", onEndCallback);
        }
    };

    p.stop = function() {
        createjs.Sound.stop();
    };

    sm.SoundManagerDummy = soundManagerDummy;
}(window));

$(document).ready(function() {
    SoundManager = new sm.SoundManagerDummy();
});