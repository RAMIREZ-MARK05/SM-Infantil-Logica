// Correccion Manual
// Deja pintar cualquier casilla de cualquier color, al pulsar corregir NO BORRA los colores incorrectos y guarda el estado y 
// da fin de ejecución aunque no este completamente ok. (Es el modo SM manual).

// Correccion Automática y Feedback activado
// Sólo deja pintar las casillas en el color correcto, NO HAY BOTÓN CORREGIR. No guarda el estado ni da fin de ejecución.
// (Es el modo SM automático). No deberíais utilizarlo.

// Correccion Automática y Feedback desactivado
// Deja PINTAR CUALQUIER CASILLA de cualquier color, al pulsar corregir BORRA todos los colores incorrectos y guarda el estado. 
// Registra fin de interactivo en cada correccón. (Modo Educamos).

this.sm = this.sm || {};
(function () {
    var drawingEngine = function (htmlCanvasId, cfg, animationEnd, unique) {
        this.initialize(htmlCanvasId, cfg, animationEnd, unique);
    };
    var p = drawingEngine.prototype = new sm.BaseEngine();
    p.singleton = null;

    p.BaseEngine_initialize = p.initialize;

    p.initialize = function (htmlCanvasId, cfg, animationEnd, unique) {
        this.BaseEngine_initialize(htmlCanvasId, cfg, animationEnd, unique);
        this.cfg = cfg;
        this.targetHits = 0;
        this.hits = 0;
        this.enabled = true;
    };

    p.navOnBtnClick = function (navigationTool, accion, step) {
        navigationTool.setTituloEnunciado("Accion: " + accion + ", STEP: " + step);
    };
    
    p.selOnBtnClick = function (step) {
        console.log("Barra Seleccion STEP: " + step);
    };

    p.onCheckedCuadrado = function (checkBox) {
        checkBox.setChecked(true);
        checkBox.parent.checkBox2.setChecked(false);
        checkBox.parent.fullCell = true;
    };

    p.onCheckedTriangulo = function (checkBox) {
        checkBox.setChecked(true);
        checkBox.parent.checkBox1.setChecked(false);
        checkBox.parent.fullCell = false;
    };
    
    p.onEndActivityClic = function () {
        var engine = this.parent;
        engine.notifyTotalSuccess();
        engine.traceTotal = 1;
        engine.traceIntentos++;
        engine.traceAciertos = 1;
        data = {
            total: engine.traceTotal,
            aciertos: engine.traceAciertos,
            intentos: engine.traceIntentos
        };
        engine.getSingelton().registerEnd(engine, data);
        var state = engine.getSingelton().getStateData();
        engine.getSingelton().saveState(state);
    };
    
    p.BaseEngine_setupObjects = p.setupObjects;
    p.setupObjects = function () {
       
        this.stage = this.getStage();

        // BACKGROUND
        if (this.cfg.backgroundImage != undefined && this.cfg.backgroundImage != "") {
            this.bkgImage = new createjs.Bitmap(ImageManager.getImage(this.cfg.backgroundImage.id));
            this.bkgImage.name = this.cfg.backgroundImage.id;
            this.bkgImage.x = this.cfg.backgroundImage.x;
            this.bkgImage.y = this.cfg.backgroundImage.y;
            this.bkgImage.z = 0;
            this.addChild(this.bkgImage);
        }    
        
        //DRAWING SECTION
        switch (this.cfg.drawingEngine.gameType) {
            case 'fillGridType':
                this.fillGridTypeActivity();
                break;
            case 'fillImageType':
                this.fillImageTypeActivity();
                break;
            default:
                console.log("Tipo de juego erróneo");
                break;
        }

        var buttonCallback = this.cfg.autoEvaluate == false ? this.onEndActivityClic : this.onCorregirClick; // Se ha cambiado la condición.
        if (this.educamosBarNav != null) {
            this.buttonCorrect = this.educamosBarNav.getButton("Corregir");
            this.buttonCorrect.owner = this;
            this.buttonCorrect.on("mousedown", function() {
                    if (this.buttonCorrect.enabled == true) {
                        buttonCallback.call(this.educamosBarNav);
                    } 
                }, this);
            this.buttonCorrect.setEnabled(!this.cfg.correctOnComplete);
            this.buttonCorrect.setEnabled(false);
        } else {
            //Corregir
            this.buttonCorrect = new sm.Button(this.cfg.buttonEnd.width, styles.button.buttonHeight, this.cfg.buttonEnd.x, this.cfg.buttonEnd.y, buttonCallback, styles.button);
            this.buttonCorrect.name = "btnCorregir";
            this.buttonCorrect.owner = this;
            this.buttonCorrect.setText(this.cfg.buttonEnd.textId);
            this.buttonCorrect.setEnabled(!this.cfg.correctOnComplete);
            this.addChild(this.buttonCorrect);
        }
        if (this.cfg.autoEvaluate == true && this.cfg.evalFeedback == true) {
            this.buttonCorrect.visible = false;
        }

        //objeto paleta
        var palette = new createjs.PaletteWnd("palette", this.cfg.paletteCfg, this.palette_OnSelectColour);
        palette.owner = this;
        palette.x = this.cfg.paletteCfg.paletteX;
        palette.y = this.cfg.paletteCfg.paletteY;
        palette.setEnabled(true);
        this.palette = palette;
        this.addChild(palette);

        if (this.animationEnd != null && this.animationEnd != undefined) {
            this.animationEnd.width = this.originalWidth;
            this.animationEnd.height = this.originalHeight;            
            this.addChild(this.animationEnd);
        }
        
        // AQUI MESSAGEBOX
        var width = this.stage.canvas.width * 0.5;
        var height = this.stage.canvas.height * 0.5;
        var x = 0.5 * (this.stage.canvas.width - width);
        var y = 0.5 * (this.stage.canvas.height - height);
        this.infoVolverAJugar = null; 
        if (this.cfg.msgEndActivity != null && this.cfg.msgEndActivity != undefined)
        {
            this.infoVolverAJugar = new sm.InfoPopupBigOkCancel(width, height, x, y, this.cfg.msgEndActivity.txtBtnAceptar, this.cfg.msgEndActivity.txtBtnCancelar, createjs.proxy(this.closeInfoOkCancel, this));       
            this.infoVolverAJugar.setText(this.cfg.msgEndActivity.txtConfirmacionRepetir);       
            this.addChild(this.infoVolverAJugar);
            this.infoVolverAJugar.visible = false;
        }

        //Creacion de elementos acordes al Estilo SM
        //Pastilla (HEADER)
        this.headerTool = new sm.HeaderTool(this.originalWidth);
        this.headerTool.setTituloEnunciado(this.cfg.enunciado);
        this.addChild(this.headerTool);
        //FOOTER
        this.footerTool = new sm.FooterTool(this.originalWidth, 0, this.originalHeight - styles.footerSM.height);
        this.addChild(this.footerTool);

        this.enableObjects();
        
        this.BaseEngine_setupObjects();
        if (this.cfg.audioEnunciado) {
            this.setAudio(this.cfg.audioEnunciado);
            this.playAudio(this.cfg.audioEnunciado);
        }
        if (!this.recoveredState) {
            this.recoveredState = true;
            this.getSingelton().loadState();
        }
    };

    p.BaseEngine_loadState = p.loadState;
    p.loadState = function () {
        (function (engine) {
            engine.com.RecuperaConfiguracion({
                onSuccess: function (data) {
                    /*
                     * El parámetro 'data' contiene un Json con los siguienetes datos:
                     *     - modo[P|A]:     Modo en el que se está ejecutando el contenido
                     *              P:  Modo Profesor
                     *              A:  Alumno
                     *     - estado:        último estado guardado de la actividad
                     */
                    engine.mode = data.mode;
                    if (data.estado != null) {
                        var state = data.estado;
                        engine.getSingelton().setStateData(state, engine.mode);
                    }
                    console.log('Configuracion recuperada correctamente');
                },
                onError: function (error) {
                    // Esta función se ejecutará en caso de que ocurra un error durante el proceso
                    // En caso de error la actividad debe cargarse en un estado inicial y en modo alumno(A)
                    console.log('Ocurrió un error al recuperar el estado' + JSON.stringify(error));
                },
                onComplete: function () {
                    // Esta función se ejecutará al finalizar el proceso tanto si este
                    // ha finalizado correctamente como si ha ocurrido algún error
                    console.log('Proceso de recuperación de estado finalizado');
                }
            });
        })(this);
    };

    p.BaseEngine_setStateData = p.setStateData;
    p.setStateData = function (state, mode) {
        var validState = false;
        var i;
        if (state.grid != undefined && state.grid != null && this.grid != null) {
            validState = state.grid.cells.length > 0;
            for (i = 0; i < state.grid.cells.length; i++) {
                var stateCell = state.grid.cells[i];
                if (stateCell[0] != "#FFFFFF" ||
                    stateCell[1] != "#FFFFFF" ||
                    stateCell[2] != "#FFFFFF" ||
                    stateCell[3] != "#FFFFFF" ||
                    stateCell[4] != "#FFFFFF") {
                    var gridCell = this.grid.cells[i];
                    gridCell.paintedColors = stateCell;
                    gridCell.rebuild(stateCell[4] == "#FFFFFF");
                    for (var j = 0; j < 5; j++) {
                        gridCell.trianglesFilled[j] = gridCell.paintedColors[j] != "#FFFFFF";
                    }
                }
            }
        } else {
            if (state.picture != undefined && state.picture != null) {
                validState = state.picture.colors.length > 0;
                for (i = 0; i < state.picture.colors.length; i++) {
                    var color = state.picture.colors[i];
                    var image = this.images[i];
                    var r = parseInt(color.substr(1, 2), 16) / 255.0;
                    var g = parseInt(color.substr(3, 2), 16) / 255.0;
                    var b = parseInt(color.substr(5, 2), 16) / 255.0;
                    image.filters = [
                        new createjs.ColorFilter(r, g, b, 1, 0, 0, 0, 0)
                    ];
                    image.cache(0, 0, image.width, image.height);
                    image.validColor = true;
                    image.color = color;
                    image.filled = true;
                }
            }
        }
        if (validState) {
            this.traceTotal = state.total;
            this.traceAciertos = state.aciertos;
            this.traceIntentos = state.intentos;

            if (this.traceAciertos != 0) {
                this.forceEnd();
            }
        }
    };

    p.BaseEngine_getStateData = p.getStateData;
    p.getStateData = function () {
        var state = {};
        var i;
        if (this.cfg.drawingEngine.gameType == 'fillGridType') {
            state = { grid: { cells: [] } };
            for (i = 0; i < this.grid.cells.length; i++) {
                var gridCell = this.grid.cells[i];
                state.grid.cells.push(gridCell.paintedColors);
            }
        } else {
            state = { picture: { colors: [] } };
            for (i = 0; i < this.images.length; i++) {
                var image = this.images[i];
                state.picture.colors.push(image.color);
            }
        }
        state.total = this.traceTotal;
        state.aciertos = this.traceAciertos;
        state.intentos = this.traceIntentos;
        return state;
    };

    p.BaseEngine_saveState = p.saveState;
    p.saveState = function (state) {
        this.com.AlmacenaEstado({
            estado: state,
            onSuccess: function () {
                // Esta función se ejecutará al finalizar el proceso de guardado
                console.log('Estado almacenado correctamente');
            },
            onError: function (error) {
                // Esta función se ejecutará en caso de que ocurra un error durante el proceso
                console.log('Ocurrió un error al almacenar el estado' + JSON.stringify(error));
            },
            onComplete: function () {
                // Esta función se ejecutará al finalizar el proceso de guardado tanto si este
                // ha finalizado correctamente como si ha ocurrido algún error
                console.log('Proceso de guardado finalizado');
            }
        });
    };

    p.forceEnd = function() {
        this.enabled = false;
        this.disableObjects();
        this.getSingelton().onEndActivity();
    };
    
    p.notifyTotalSuccess = function () {
        this.enabled = false;
        this.disableObjects();

        if (this.audioButton) {
            this.audioButton.setEnabled(false);
        }

        if (SoundManager != undefined && SoundManager != null && this.cfg.audioFinal != undefined && this.cfg.audioFinal != null) {
            this.playAudio(this.cfg.audioFinal, this.onEndActivity, this);
        } else {
            this.onEndActivity();
        }
    };

    p.BaseEngine_onEndActivity = p.onEndActivity;
    p.onEndActivity = function() {
        if (this.activityEnded){
            return;
        }
        this.activityEnded = true;
        var repeatButton;
        if(this.isUnique() && this.animationEnd != null && this.animationEnd != undefined) {
            this.removeChild(this.animationEnd);
            this.addChild(this.animationEnd);
            if (this.cfg.platform === "Infantil") {
                this.addChild(this.headerTool);
                this.addChild(this.footerTool);
            }
            this.animationEnd.run(this.onFinishAnimation);
            if (this.cfg.platform == "SM") {
                this.repeatButton = this.getRepeatButton();
                this.removeChild(this.repeatButton);
                this.addChild(this.repeatButton);
            } else if (this.cfg.platform === "Infantil") {
                this.repeatButton.setEnabled(true);
            } else {
                repeatButton = this.educamosBarNav.getButton("Repeat");
                repeatButton.setEnabled(true);
            }
            if (this.infoVolverAJugar != null) this.infoVolverAJugar.visible = true;
        }else if (this.isUnique() == false) {
            this.getSingelton().onEndActivity();
        }else {
            if (this.cfg.platform == "SM") {
                this.repeatButton = this.getRepeatButton();
                this.removeChild(this.repeatButton);
                this.addChild(this.repeatButton);
            } else if (this.cfg.platform === "Infantil") {
                this.repeatButton.setEnabled(true);
            } else {
                repeatButton = this.educamosBarNav.getButton("Repeat");
                repeatButton.setEnabled(true);
            }
        }       
    };
    
    p.BaseEngine_onFinishAnimation = p.onFinishAnimation;
    p.onFinishAnimation = function() {
        if (this.infoVolverAJugar != null) this.infoVolverAJugar.visible = true;
    };

    p.BaseEngine_onRepeatActivity = p.onRepeatActivity;
    p.onRepeatActivity = function() {
        var engine = (this instanceof sm.DrawingEngine) ? this : this.parent;
        if (engine != null) {
            if (engine.animationEnd != null) {
                engine.animationEnd.stop();
                engine.removeChild(engine.animationEnd);
            }
            if (engine.cfg.platform === "Infantil") {
                this.repeatButton.setEnabled(false);
            } else {
                engine.removeChild(engine.getRepeatButton());
            }
            engine.reset();
        }
    };
    
    p.disableObjects = function() {
        if (this.checkBox1 != undefined && this.checkBox2 != undefined && this.grid != undefined) {
            this.checkBox1.setEnabled(false);
            this.checkBox2.setEnabled(false);    
            this.grid.setEnabled(false);
        }

        if (this.buttonCorrect != undefined)
            this.buttonCorrect.setEnabled(false);

        this.palette.setEnabled(false);
        this.enabled = false;

    };
    
    p.enableObjects = function() {
        if (this.checkBox1 != undefined && this.checkBox2 != undefined && this.grid != undefined) {
            this.checkBox1.setEnabled(true);
            this.checkBox2.setEnabled(true);    
            this.grid.setEnabled(true);
        }
        
        if (this.buttonCorrect != undefined)
            this.buttonCorrect.setEnabled(this.iniciado);

        this.palette.setEnabled(true);
        this.enabled = true;

    };
    
    p.closeInfoOkCancel = function(boton) {
        switch(boton) {
            case 'Ok':
                this.infoVolverAJugar.visible = false;
                this.reset();
                if (SoundManager != undefined && SoundManager != null) SoundManager.stop();
                this.animationEnd.stop();
                this.enableObjects();                
            break;
            case 'Cancel':
                this.infoVolverAJugar.visible = false;
            break;            
        };
    };

    p.playAudioClic = function () {
        if (SoundManager != undefined && SoundManager != null) SoundManager.play(this.cfg.audioClic);
    };

    p.playAudioError = function () {
        if (SoundManager != undefined && SoundManager != null) SoundManager.play(this.cfg.audioKO);
    };

    p.increaseHit = function () {
        if (this.cfg.autoEvaluate == true) {
            this.hits++;
        }

        if (this.hits == this.targetHits) {
            this.notifyTotalSuccess();
            this.traceTotal = 1;
            this.traceIntentos++;
            this.traceAciertos = 1;
            data = {
                total: this.traceTotal,
                aciertos: this.traceAciertos,
                intentos: this.traceIntentos
            };
            this.getSingelton().registerEnd(this, data);
            var state = this.getSingelton().getStateData();
            this.getSingelton().saveState(state);
            this.hits = 0;
        } else {
            this.playAudioClic();
        }
    };

    p.fillGridTypeActivity = function () {
        this.fullCell = false;
        
        if (this.cfg.grid.triangleCell == true) {
            this.fullCell = false;
            this.checkBox1 = new sm.CheckBox(this.cfg.grid.checkBoxQuadPosX, this.cfg.grid.checkBoxQuadPosY, this.cfg.grid.checkBoxQuadWidth, this.onCheckedCuadrado);
            if (this.cfg.grid.checkBoxQuadText == undefined || this.cfg.grid.checkBoxQuadText == null)
            {
                this.checkBox1.setText("Pintar Cuadrados");
            }
            else
            {
                this.checkBox1.setText(eval(this.cfg.grid.checkBoxQuadText));
            }
            this.checkBox1.setChecked(this.fullCell);
            this.addChild(this.checkBox1);
            this.checkBox2 = new sm.CheckBox(this.cfg.grid.checkBoxTriPosX, this.cfg.grid.checkBoxTriPosY, this.cfg.grid.checkBoxTriWidth, this.onCheckedTriangulo);
            if (this.cfg.grid.checkBoxTriText == undefined || this.cfg.grid.checkBoxTriText == null)
            {
                this.checkBox2.setText("Pintar Triángulos");
            }
            else
            {
                this.checkBox2.setText(eval(this.cfg.grid.checkBoxTriText));
            }
            this.checkBox2.setChecked(!this.fullCell);
            this.addChild(this.checkBox2);
        } 

        //objeto rejilla
        this.grid = new createjs.Grid(this.cfg.grid, this.grid_OnShapeClick, false);
        this.grid.x = this.cfg.grid.posX;
        this.grid.y = this.cfg.grid.posY;
        this.addChild(this.grid);

        //objeto rejilla solución
        if (this.cfg.grid.posXSolution != undefined && this.cfg.grid.posYSolution != undefined) {
            var gridSolution = new createjs.GridSolution(this.cfg.grid);
            gridSolution.x = this.cfg.grid.posXSolution;
            gridSolution.y = this.cfg.grid.posYSolution;
            this.addChild(gridSolution);
        }
    };

    p.fillImageTypeActivity = function () {
        //Formas
        this.targetHits = 0;
        this.images = [];
        for (var img = this.cfg.imageObjects.length - 1; img >= 0; img--) {

            var idImage = this.cfg.imageObjects[img].imageId;

            var bmp = new createjs.Bitmap(ImageManager.getImage(idImage));
            bmp.x = this.cfg.imageObjects[img].x;
            bmp.y = this.cfg.imageObjects[img].y;
            bmp.height = bmp.image.height;
            bmp.width = bmp.image.width;
            bmp.allowedColors = this.cfg.imageObjects[img].allowedColors;
            bmp.filled = false;
            bmp.on("click", this.bitmap_onPress);
            bmp.hitable = this.cfg.imageObjects[img].hitable;
            bmp.validColor = false;
            bmp.color = "#FFFFFF";
            if(bmp.hitable == true) {
                this.targetHits++;
            }
            bmp.name = "image_" + idImage + "_" + img;
            this.addChild(bmp);
            this.images.push(bmp);
        }
    };

    p.bitmap_onPress = function (event) {
        var engine = this.parent;

        if (!engine.enabled)
            return;

        if (!engine.iniciado) {
            engine.com.IniciaEjecucion();
            engine.iniciado = true;
            if (engine.buttonCorrect != undefined)
                engine.buttonCorrect.setEnabled(true);
        }

        var onlyAllowedColors = engine.cfg.autoEvaluate && engine.cfg.evalFeedback;
        this.validColor = engine.allowedColor(engine.palette.selectedColor.color, this);
        if ((this.hitable == true) &&
            ((onlyAllowedColors && this.validColor) || (!onlyAllowedColors))) {
            var r = parseInt(engine.palette.selectedColor.color.substr(1, 2), 16) / 255.0;
            var g = parseInt(engine.palette.selectedColor.color.substr(3, 2), 16) / 255.0;
            var b = parseInt(engine.palette.selectedColor.color.substr(5, 2), 16) / 255.0;

            this.filters = [
                new createjs.ColorFilter(r, g, b, 1, 0, 0, 0, 0)
            ];
            this.cache(0, 0, this.width, this.height);
            
            this.color = engine.palette.selectedColor.color;
            
            if (this.filled == false && this.validColor && engine.cfg.evalFeedback) {
                engine.increaseHit();
                this.filled = true;
            } 
            else {
                engine.playAudioClic();
            }
            
        } else {
            engine.playAudioError();
        }
    };

    p.allowedColor = function (color, img) {
        var result = false;
        if (img.allowedColors == null || img.allowedColors == undefined) {
            result = true;
        } else {
            for (var i = 0; i < img.allowedColors.length; i++) {
                if (img.allowedColors[i] == color) {
                    result = true;
                    break;
                }
            }
        }

        return result;
    };

    p.grid_OnShapeClick = function (cell, shapeIndex) {
        var engine = this.parent;
        
        if (!engine.enabled)
            return;

        if (!engine.iniciado) {
            engine.com.IniciaEjecucion();
            engine.iniciado = true;
            if (engine.buttonCorrect != undefined)
                engine.buttonCorrect.setEnabled(true);
        }

        if (engine.fullCell == true) {
            shapeIndex = 5;
        }

        if (cell.isFilled(shapeIndex, engine.fullCell)) {
            var color = cell.paintedColors[shapeIndex - 1];
            if (color == engine.palette.selectedColor.color) {
                cell.ClearCell(shapeIndex, engine.fullCell);
                return;
            }
        }
        
        var onlyAllowedColors = engine.cfg.autoEvaluate && engine.cfg.evalFeedback;
        var cellOk = cell.FillCell(engine.palette.selectedColor.color, shapeIndex, engine.fullCell, onlyAllowedColors);
        
        if (engine.cfg.grid.triangleCell) {
            var sameColor = true;
            var firstColor = cell.paintedColors[0];
            for (var k = 1; k < 4; k++) {
                if (firstColor != cell.paintedColors[k]) {
                    sameColor = false;
                    break;
                }
            }
            if (sameColor) {
                cell.paintedColors[4] = firstColor;
                cell.trianglesFilled[4] = true;
            }
        }
        
        var gridComplete = engine.isGridOkCompleted();
        
        if (onlyAllowedColors) {
            if (!cellOk) {
                engine.playAudioError();
            } else if (!gridComplete) {
                engine.playAudioClic();
            } else {
                engine.notifyTotalSuccess();
                engine.traceTotal = 1;
                engine.traceIntentos++;
                engine.traceAciertos = 1;
                data = {
                    total: engine.traceTotal,
                    aciertos: engine.traceAciertos,
                    intentos: engine.traceIntentos
                };
                engine.getSingelton().registerEnd(engine, data);
                var state = engine.getSingelton().getStateData();
                engine.getSingelton().saveState(state);
            }
        } else {
            engine.playAudioClic();
        }
    };

    p.isGridOkCompleted = function () {
        for (var i = 0; i < this.grid.cells.length; i++) {
            var trianglesFilled = this.grid.cells[i].trianglesFilled;
            var hitables = this.grid.cells[i].hitables;
            if (this.cfg.grid.triangleCell == true) {
                for (var j = 0; j < trianglesFilled.length; j++) {
                    if ((hitables[j] == false && trianglesFilled[j] == true) ||
                        (hitables[j] == true && trianglesFilled[j] == false)) {
                        return false;
                    } else {
                        if (hitables[j] == true && trianglesFilled[j] == true) {
                            var colorValido = this.grid.cells[i].AllowedColor(j + 1, this.grid.cells[i].paintedColors[j], this.grid.cells[i].colors, false);
                            if (!colorValido) {
                                return false;
                            }
                        }
                    }
                }
            } else {
                if ((hitables[4] == false && trianglesFilled[4] == true) ||
                    (hitables[4] == true && trianglesFilled[4] == false)) {
                    return false;
                }
            }
        }
        return true;
    };

    p.isImagesOkCompleted = function() {
        for (var i = 0; i < this.images.length; i++) {
            var image = this.images[i];
            if (!image.validColor && image.allowedColors) {
                return false;
            }
        }
        return true;
    };
    
    p.palette_OnSelectColour = function (color) {
    };

    p.onCorregirClick = function () {
        var engine = this.parent;
        engine.traceTotal = 1; // Segun indicaciones siempre 1.
        engine.traceIntentos++;
        var data;
        if (engine.cfg.drawingEngine.gameType == 'fillGridType') {
            if (engine.isGridOkCompleted()) {
                engine.notifyTotalSuccess();
                engine.traceAciertos = 1;
                //data = {
                //    total: engine.traceTotal,
                //    aciertos: engine.traceAciertos,
                //    intentos: engine.traceIntentos
                //};
                //engine.getSingelton().registerEnd(engine, data);
            } else {
                engine.traceAciertos = 0;
                engine.clearFailCells();
            }
        } else {
            if (engine.isImagesOkCompleted()) {
                engine.notifyTotalSuccess();
                engine.traceAciertos = 1;
                //data = {
                //    total: engine.traceTotal,
                //    aciertos: engine.traceAciertos,
                //    intentos: engine.traceIntentos
                //};
                //engine.getSingelton().registerEnd(engine, data);
            } else {
                engine.traceAciertos = 0;
                engine.clearFailImages();
            }
        }

        // Se ha movido aquí para cada vez que puses ´corregir se registra fin de interactivo.
        data = {
            total: engine.traceTotal,
            aciertos: engine.traceAciertos,
            intentos: engine.traceIntentos
        };
        engine.getSingelton().registerEnd(engine, data);

        var state = engine.getSingelton().getStateData();
        engine.getSingelton().saveState(state);
    };

    p.clearFailCells = function() {
    // TODO: falta!!!
        for (var i = 0; i < this.grid.cells.length; i++) {
            var trianglesFilled = this.grid.cells[i].trianglesFilled;
            var hitables = this.grid.cells[i].hitables;
            if (this.cfg.grid.triangleCell == true) {
                var failCell = false;
                for (var j = 0; j < 5; j++) {
                    if (hitables[j] == false && trianglesFilled[j] == true) {
                        this.grid.cells[i].paintedColors[j] = "#FFFFFF";
                        this.grid.cells[i].trianglesFilled[j] = false;
                        failCell = true;
                    }
                    var colorValido = this.grid.cells[i].AllowedColor(j + 1, this.grid.cells[i].paintedColors[j], this.grid.cells[i].colors, false);
                    if (hitables[j] == true && !colorValido) {
                        this.grid.cells[i].paintedColors[j] = "#FFFFFF";
                        this.grid.cells[i].trianglesFilled[j] = false;
                        failCell = true;
                    }
                }
                if (failCell) {
                    this.grid.cells[i].rebuild(true);
                }
            } else {
                
            }
        }
    };
    
    p.clearFailImages = function() {
        for (var i = 0; i < this.images.length; i++) {
            var image = this.images[i];
            if (!image.validColor) {
                image.filters = [
                    new createjs.ColorFilter(1, 1, 1, 1, 0, 0, 0, 0)
                ];
                image.cache(0, 0, image.width, image.height);
                image.color = "#FFFFFF";
                image.filled = false;
            }
        }
    };
    
    sm.DrawingEngine = drawingEngine;
} (window));

// ---------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------

(function () {
    var paletteWnd = function (name, cfg, onSelectColorCallback) {
        this.initialize(name, cfg, onSelectColorCallback);
    };
    var p = paletteWnd.prototype = new createjs.Container();
    p.Container_initialize = p.initialize;

    p.initialize = function (name, cfg, onSelectColorCallback) {
        this.Container_initialize();

        this.name = name;
        this.cfg = cfg;
        this.onSelectColorCallback = onSelectColorCallback;
        this.enabled = true;
        this.selectedColor = null;

        // Asignamos eventos.
        (function (target) {
            target.doClick = function (paletteElementColor) {
                if (!target.enabled || paletteElementColor == null) return;
                if (target.selectedColor != null && target.selectedColor != undefined) {
                    target.selectedColor.setSelected(false);
                }
                target.selectedColor = paletteElementColor;
                target.selectedColor.setSelected(true);
                target.onSelectColorCallback(paletteElementColor.color);
            };
        })(this);

        var paletteCols = this.cfg.paletteColumns;
        if (paletteCols == 0) {
            paletteCols = 1;
        }
        if (paletteCols > this.cfg.colors.length) {
            paletteCols = this.cfg.colors.length;
        }


        /////////// FONDO DE LA PALETA ///////////
        if (this.cfg.drawPaletteShape) { //Modo Shape
            var paletteRows = Math.ceil(this.cfg.colors.length / paletteCols);

            if (paletteCols == 0) {
                paletteRows = 1;
                paletteCols = 1;
            }

            var paletteHeight = ((paletteRows + 1) * this.cfg.colorSpace) + (paletteRows * this.cfg.colorElementSize);
            var paletteWidth = ((paletteCols + 1) * this.cfg.colorSpace) + (paletteCols * this.cfg.colorElementSize);



            this.shpBkg = new createjs.Shape();
            this.shpBkg.name = "shpBkg";
            this.shpBkg.graphics.setStrokeStyle(2);
            this.shpBkg.graphics.beginStroke(this.cfg.contourColor).beginFill(this.cfg.backgroundColor)
                .drawRoundRectComplex(0, 0, paletteWidth, paletteHeight, 8, 8, 8, 8)
                .endStroke();
            this.shpBkg.alpha = this.cfg.backgroundTransparency;
            this.addChild(this.shpBkg);
        }
        else
            if (this.cfg.imageIdPalette != null && this.cfg.imageIdPalette != undefined && this.cfg.imageIdPalette != "") { //Modo Bitmap
                var bmp = new createjs.Bitmap(ImageManager.getImage(this.cfg.imageIdPalette));
                bmp.x = 0;
                bmp.y = 0;
                bmp.height = bmp.image.height;
                bmp.width = bmp.image.width;
                this.addChild(bmp);
            }


        ///////////  COLORES DE LA PALETA ///////////
        var offsetX = this.cfg.colorSpace;
        var offsetY = this.cfg.colorSpace;
        var colCount = 0;
        var colores = [];
        for (var c = 0; c < this.cfg.colors.length; c++) {

            var cfgColor = this.cfg.colors[c];
            var color = new createjs.PaletteElementColor("color" + c, cfgColor, this.cfg, this.doClick);
            color.owner = this;

            //Modo shape, colocamos los elementos color por columnas
            if (this.cfg.drawPaletteShape) {
                color.x = offsetX;
                color.y = offsetY;

                colCount += 1;

                if (paletteCols > colCount) {
                    offsetX += this.cfg.colorElementSize + this.cfg.colorSpace;
                } else {
                    offsetY += this.cfg.colorElementSize + this.cfg.colorSpace;
                    offsetX = this.cfg.colorSpace;
                    colCount = 0;
                }
            }

            this.addChild(color);
            colores.push(color);
        }
        this.selectedColor = null;
        if (colores.length > 0) {
            colores[0].setSelected(true);
            this.selectedColor = colores[0];
        }
    };

    p.setEnabled = function (value) {
        this.enabled = value;
    };

    createjs.PaletteWnd = paletteWnd;
} (window));


(function () {
    var paletteElementColor = function (name, cfgColor, cfgPalette, onClickCallback) {
        this.initialize(name, cfgColor, cfgPalette, onClickCallback);
    };
    var p = paletteElementColor.prototype = new createjs.Container();
    p.Container_initialize = p.initialize;

    p.initialize = function (name, cfgColor, cfgPalette, onClickCallback) {
        this.Container_initialize();

        this.name = name;
        this.cfgColor = cfgColor;
        this.cfgPalette = cfgPalette;
        this.onClickCallback = onClickCallback;
        this.enabled = true;
        this.size = this.cfgPalette.colorElementSize;
        this.color = cfgColor.rgb;

        this.on("click", this.onClickElement);

        if (this.size < 32) {
            this.size = 32;
        }

        if (this.cfgPalette.drawPaletteShape) { //Modo shape
            this.shp = new createjs.Shape();
            this.shp.graphics.setStrokeStyle(2);
            this.shp.graphics.beginStroke(this.cfgPalette.contourColor).beginFill("#FFFFFF")
                .drawRoundRectComplex(0, 0, this.size, this.size, cfgColor.round, cfgColor.round, cfgColor.round, cfgColor.round)
                .endStroke()
                .beginFill(this.color)
                .drawRoundRectComplex(2, 2, this.size - 4, this.size - 4, cfgColor.round, cfgColor.round, cfgColor.round, cfgColor.round);

            this.addChild(this.shp);
        }
        else
            if (cfgColor.imageId != null && cfgColor.imageId != undefined && cfgColor.imageId != "") { //Modo bitmap 
                this.bmpColor = new createjs.Bitmap(ImageManager.getImage(cfgColor.imageId));
                this.bmpColor.x = cfgColor.posX;
                this.bmpColor.y = cfgColor.posY;
                this.bmpColor.height = this.bmpColor.image.height;
                this.bmpColor.width = this.bmpColor.image.width;
                this.bmpColor.alpha = 0.4;

                this.addChild(this.bmpColor);
            }
    };

    p.onClickElement = function (event) {
        if (!this.enabled) return;
        this.onClickCallback(this);
    };

    p.setEnabled = function (value) {
        this.enabled = value;
    };

    p.setSelected = function (flag) {
        if (this.bmpColor != null && this.bmpColor != undefined) { //Modo bitmap

            if (flag) {
                this.bmpColor.alpha = 1;
            } else {
                this.bmpColor.alpha = 0.4;
            }
        }
        else { //Modo shape
            this.removeChild(this.shp);

            var strokeColor = flag ? this.cfgPalette.contourSelectedColor : this.cfgPalette.contourColor;

            this.shp = new createjs.Shape();
            this.shp.graphics.setStrokeStyle(2);
            this.shp.graphics.beginStroke(strokeColor).beginFill("#FFFFFF")
                .drawRoundRectComplex(0, 0, this.size, this.size, this.cfgColor.round, this.cfgColor.round, this.cfgColor.round, this.cfgColor.round)
                .endStroke()
                .beginFill(this.color)
                .drawRoundRectComplex(2, 2, this.size - 4, this.size - 4, this.cfgColor.round, this.cfgColor.round, this.cfgColor.round, this.cfgColor.round);

            this.addChild(this.shp);
        }
    };

    createjs.PaletteElementColor = paletteElementColor;
} (window));



// ---------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
(function () {
    var cell = function (cellSize, onCellCallBack, colors, isSolution, configGrid, posX, posY) {
        this.initialize(cellSize, onCellCallBack, colors, isSolution, configGrid, posX, posY);
    };
    var p = cell.prototype = new createjs.Container();

    p.Container_initialize = p.initialize;

    p.initialize = function (cellSize, onCellCallBack, colors, isSolution, configGrid, posX, posY) {
        this.Container_initialize();
        this.cellSize = cellSize;
        this.colors = colors;
        this.isSolution = isSolution;
        this.configGrid = configGrid;
        this.shpCell = new createjs.Shape();
        this.posX = posX;
        this.posY = posY;
        this.paintedColors = ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"];

        (function (target) {
            target.on("click", function (evt) {
                var aux = target.parent.owner.globalToLocal(evt.stageX, evt.stageY);
                var point = {
                    X: aux.x,
                    Y: aux.y
                };


                if (target.parent.configGrid.triangleCell == true) {
                    if (target.parent.PointInPolygon(target.parent.tri1points, point)) {
                        target.parent.OnCellCallBack(target.parent, 1);
                    }
                    if (target.parent.PointInPolygon(target.parent.tri2points, point)) {
                        target.parent.OnCellCallBack(target.parent, 2);
                    }
                    if (target.parent.PointInPolygon(target.parent.tri3points, point)) {
                        target.parent.OnCellCallBack(target.parent, 3);
                    }
                    if (target.parent.PointInPolygon(target.parent.tri4points, point)) {
                        target.parent.OnCellCallBack(target.parent, 4);
                    }
                } else {
                    target.parent.OnCellCallBack(target.parent, 5);
                }

            });
        })(this.shpCell);

        this.trianglesFilled = [false, false, false, false, false];
        this.hitables = [false, false, false, false, false];

        this.tri1points = [{ X: 0, Y: 0 }, { X: this.cellSize, Y: 0 }, { X: this.cellSize / 2, Y: this.cellSize / 2}];
        this.tri2points = [{ X: this.cellSize, Y: 0 }, { X: this.cellSize, Y: this.cellSize }, { X: this.cellSize / 2, Y: this.cellSize / 2}];
        this.tri3points = [{ X: this.cellSize, Y: this.cellSize }, { X: 0, Y: this.cellSize }, { X: this.cellSize / 2, Y: this.cellSize / 2}];
        this.tri4points = [{ X: 0, Y: this.cellSize }, { X: 0, Y: 0 }, { X: this.cellSize / 2, Y: this.cellSize / 2}];


        this.OnCellCallBack = onCellCallBack;

        this.rebuild(this.configGrid.triangleCell);

        this.addChild(this.shpCell);
        this.owner = this;
        // Asignamos eventos.
    };

    p.PointInPolygon = function (polygonPoints, point) {
        var cn = 0;
        for (var i = 0; i < polygonPoints.length; i++) {
            if (((polygonPoints[i].Y <= point.Y) && (polygonPoints[(i + 1) % polygonPoints.length].Y > point.Y)) ||
                ((polygonPoints[i].Y > point.Y) && (polygonPoints[(i + 1) % polygonPoints.length].Y <= point.Y))) {
                var vt = (point.Y - polygonPoints[i].Y) / (polygonPoints[(i + 1) % polygonPoints.length].Y - polygonPoints[i].Y);
                if (point.X < polygonPoints[i].X + vt * (polygonPoints[(i + 1) % polygonPoints.length].X - polygonPoints[i].X))
                    ++cn;
            }
        }
        return (cn % 2 == 1);
    };

    p.isFilled = function (shapeIndex, fullCell) {
        var result = true;
        if (fullCell) {
            for (var i = 0; i < this.trianglesFilled.length; i++) {
                if (!this.trianglesFilled[i]) {
                    result = false;
                    break;
                }
            }
        } else {
            result = this.trianglesFilled[shapeIndex - 1];
        }
        return result;
    };

    p.FillCell = function (color, shapeIndex, fullCell, onlyAllowedColors) {
        var colorValido = this.AllowedColor(shapeIndex, color, this.colors, fullCell);
        if (!colorValido && onlyAllowedColors) {
            return false;
        }

        if (fullCell) {
            this.fillShape(shapeIndex, color, color, this.shpCell);
            for (var i = 0; i < this.trianglesFilled.length; i++) {
                this.trianglesFilled[i] = true;
            }
        } else {
            this.trianglesFilled[shapeIndex - 1] = true;
            this.fillShape(shapeIndex, color, color, this.shpCell);
        }

        return true;
    };

    p.ClearCell = function (shapeIndex, fullCell) {
        var shapeColor = styles.grid.shapeColor;
        var borderShapeColor = styles.grid.borderShapeColor;
        this.paintedColors[shapeIndex - 1] = shapeColor;
        this.rebuild(this.configGrid.triangleCell);
        if (fullCell) {
            this.fillShape(shapeIndex, borderShapeColor, shapeColor, this.shpCell);
            for (var i = 0; i < this.trianglesFilled.length; i++) {
                this.trianglesFilled[i] = false;
            }
        } else {
            this.trianglesFilled[shapeIndex - 1] = false;
            this.fillShape(shapeIndex, borderShapeColor, shapeColor, this.shpCell);
        }
    };

    p.AllowedColor = function (shapeIndex, color, colors, fullCell) {
        var result = false;

        if (colors != null) {
            if (fullCell == false) {
                for (var i = 0; i < colors.length; i++) {
                    if (colors.length == 4 || colors[i][0] == shapeIndex || colors[i][0] == undefined || this.configGrid.triangleCell == false) {
                        for (var j = 0; j < colors[i][1].length; j++) {
                            if (colors[i][1][j] == color) {
                                result = true;
                                break;
                            }
                        }
                    }
                }
            } else {
                for (var shapeId = 0; shapeId < 4; shapeId++) {
                    result = this.AllowedColor(shapeId + 1, color, colors, false);
                    if (result == false)
                        break;
                }
            }
        }

        return result;
    };

    p.getShapeColor = function (shapeIndex, colors, triangleCell) {
        var result = null;

        if (colors != null) {
            for (var i = 0; i < colors.length; i++) {
                if (colors[i][0] == shapeIndex || colors[i][0] == undefined || triangleCell == false) {
                    result = colors[i][1][0];
                    break;
                }
            }
        }
        ;

        return result;
    };

    p.rebuild = function (triangleCell) {
        var shapeColor = styles.grid.shapeColor;
        var borderShapeColor = styles.grid.borderShapeColor;

        this.shpCell.graphics.clear();

        var colorLine;
        var colorFill;

        if (triangleCell == true) {
            shapeColor = this.getShapeColor(1, this.colors, this.configGrid.triangleCell);
            borderShapeColor = shapeColor;
            this.hitables[0] = true;
            if (!this.isSolution || shapeColor == null || shapeColor == undefined) {
                if (shapeColor == undefined || shapeColor == null) {
                    this.hitables[0] = false;
                }
                shapeColor = styles.grid.shapeColor;
                borderShapeColor = styles.grid.borderShapeColor;
            }

            if (this.paintedColors[0] != shapeColor) {
                colorLine = this.paintedColors[0];
                colorFill = this.paintedColors[0];
            } else {
                colorLine = borderShapeColor;
                colorFill = shapeColor;
            }

            this.fillShape(1, colorLine, colorFill, this.shpCell);

            shapeColor = this.getShapeColor(2, this.colors, this.configGrid.triangleCell);
            borderShapeColor = shapeColor;
            this.hitables[1] = true;

            if (!this.isSolution || shapeColor == null || shapeColor == undefined) {
                if (shapeColor == undefined || shapeColor == null) {
                    this.hitables[1] = false;
                }
                shapeColor = styles.grid.shapeColor;
                borderShapeColor = styles.grid.borderShapeColor;
            }

            if (this.paintedColors[1] != shapeColor) {
                colorLine = this.paintedColors[1];
                colorFill = this.paintedColors[1];
            } else {
                colorLine = borderShapeColor;
                colorFill = shapeColor;
            }

            this.fillShape(2, colorLine, colorFill, this.shpCell);

            shapeColor = this.getShapeColor(3, this.colors, this.configGrid.triangleCell);
            borderShapeColor = shapeColor;
            this.hitables[2] = true;
            if (!this.isSolution || shapeColor == null || shapeColor == undefined) {
                if (shapeColor == undefined || shapeColor == null) {
                    this.hitables[2] = false;
                }
                shapeColor = styles.grid.shapeColor;
                borderShapeColor = styles.grid.borderShapeColor;
            }

            if (this.paintedColors[2] != shapeColor) {
                colorLine = this.paintedColors[2];
                colorFill = this.paintedColors[2];
            } else {
                colorLine = borderShapeColor;
                colorFill = shapeColor;
            }

            this.fillShape(3, colorLine, colorFill, this.shpCell);

            shapeColor = this.getShapeColor(4, this.colors, this.configGrid.triangleCell);
            borderShapeColor = shapeColor;
            this.hitables[3] = true;
            if (!this.isSolution || shapeColor == null || shapeColor == undefined) {
                if (shapeColor == undefined || shapeColor == null) {
                    this.hitables[3] = false;
                }
                shapeColor = styles.grid.shapeColor;
                borderShapeColor = styles.grid.borderShapeColor;
            }

            if (this.paintedColors[3] != shapeColor) {
                colorLine = this.paintedColors[3];
                colorFill = this.paintedColors[3];
            } else {
                colorLine = borderShapeColor;
                colorFill = shapeColor;
            }

            this.fillShape(4, colorLine, colorFill, this.shpCell);
        } else {
            shapeColor = this.getShapeColor(5, this.colors, this.configGrid.triangleCell);
            borderShapeColor = shapeColor;
            this.hitables[0] = true;
            this.hitables[1] = true;
            this.hitables[2] = true;
            this.hitables[3] = true;
            this.hitables[4] = true;
            if (!this.isSolution || shapeColor == null || shapeColor == undefined) {
                if (shapeColor == undefined || shapeColor == null) {
                    this.hitables[0] = false;
                    this.hitables[1] = false;
                    this.hitables[2] = false;
                    this.hitables[3] = false;
                    this.hitables[4] = false;
                }
                shapeColor = styles.grid.shapeColor;
                borderShapeColor = styles.grid.borderShapeColor;
            }

            if (this.paintedColors[4] != shapeColor) {
                colorLine = this.paintedColors[4];
                colorFill = this.paintedColors[4];
            } else {
                colorLine = borderShapeColor;
                colorFill = shapeColor;
            }
            this.fillShape(5, colorLine, colorFill, this.shpCell);
        }
        if (this.hitables[0] == true && this.hitables[1] == true && this.hitables[2] == true && this.hitables[3] == true) {
            this.hitables[4] = true;
        }
    };

    p.fillShape = function (index, borderShapeColor, shapeColor, shape) {
        var xColor = "#DAE8F7";
        if (borderShapeColor == shapeColor) {
            xColor = borderShapeColor;
        } else if (index == 5) {
            xColor = "#FFFFFF";
        }

        switch (index) {
            case 1:
                shape.graphics.setStrokeStyle(1).beginStroke(borderShapeColor).beginFill(shapeColor)
                .moveTo(0, 0).lineTo(this.cellSize, 0).beginStroke(xColor)
                .lineTo(this.cellSize, 0).lineTo(this.cellSize / 2, this.cellSize / 2).lineTo(0, 0).endStroke();
                shape.width = this.cellSize;
                shape.height = this.cellSize;
                break;
            case 2:
                shape.graphics.setStrokeStyle(1).beginStroke(borderShapeColor).beginFill(shapeColor)
                .moveTo(this.cellSize, 0).lineTo(this.cellSize, this.cellSize).beginStroke(xColor)
                .lineTo(this.cellSize, this.cellSize).lineTo(this.cellSize / 2, this.cellSize / 2).lineTo(this.cellSize, 0).endStroke();

                shape.width = this.cellSize;
                shape.height = this.cellSize;
                break;
            case 3:
                shape.graphics.setStrokeStyle(1).beginStroke(borderShapeColor).beginFill(shapeColor)
                .moveTo(this.cellSize, this.cellSize).lineTo(0, this.cellSize).beginStroke(xColor)
                .lineTo(0, this.cellSize).lineTo(this.cellSize / 2, this.cellSize / 2).lineTo(this.cellSize, this.cellSize).endStroke();

                shape.width = this.cellSize;
                shape.height = this.cellSize;
                break;
            case 4:
                shape.graphics.setStrokeStyle(1).beginStroke(borderShapeColor).beginFill(shapeColor)
                .moveTo(0, this.cellSize).lineTo(0, 0).beginStroke(xColor)
                .lineTo(0, 0).lineTo(this.cellSize / 2, this.cellSize / 2).lineTo(0, this.cellSize).endStroke();

                shape.width = this.cellSize;
                shape.height = this.cellSize;
                break;
            case 5:
                //shape.graphics.setStrokeStyle(1).beginStroke(borderShapeColor).beginFill(shapeColor).drawRect(0,0,this.cellSize,this.cellSize).endStroke();
                shape.graphics.setStrokeStyle(1).beginStroke(borderShapeColor).beginFill(shapeColor)
                .moveTo(0, 0).lineTo(this.cellSize, 0).beginStroke(xColor)
                .lineTo(this.cellSize, 0).lineTo(this.cellSize / 2, this.cellSize / 2).lineTo(0, 0).endStroke();
                shape.graphics.setStrokeStyle(1).beginStroke(borderShapeColor).beginFill(shapeColor)
                .moveTo(this.cellSize, 0).lineTo(this.cellSize, this.cellSize).beginStroke(xColor)
                .lineTo(this.cellSize, this.cellSize).lineTo(this.cellSize / 2, this.cellSize / 2).lineTo(this.cellSize, 0).endStroke();
                shape.graphics.setStrokeStyle(1).beginStroke(borderShapeColor).beginFill(shapeColor)
                .moveTo(this.cellSize, this.cellSize).lineTo(0, this.cellSize).beginStroke(xColor)
                .lineTo(0, this.cellSize).lineTo(this.cellSize / 2, this.cellSize / 2).lineTo(this.cellSize, this.cellSize).endStroke();
                shape.graphics.setStrokeStyle(1).beginStroke(borderShapeColor).beginFill(shapeColor)
                .moveTo(0, this.cellSize).lineTo(0, 0).beginStroke(xColor)
                .lineTo(0, 0).lineTo(this.cellSize / 2, this.cellSize / 2).lineTo(0, this.cellSize).endStroke();
                shape.width = this.cellSize;
                shape.height = this.cellSize;
                break;
            default:
                break;
        }
        this.paintedColors[index - 1] = shapeColor;
        if (index == 5) {
            for (var k = 0; k < 4; k++) {
                this.paintedColors[k] = shapeColor;      
            }
        }
    };

    createjs.Cell = cell;
} (window));

// ---------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
(function () {
    var grid = function (configGrid, onShapeClickCallback, isSolution) {
        this.initialize(configGrid, onShapeClickCallback, isSolution);
    };
    var p = grid.prototype = new createjs.Container();

    p.Container_initialize = p.initialize;

    p.initialize = function (configGrid, onShapeClickCallback, isSolution) {
        this.enabled = true;
        this.configGrid = configGrid;
        this.Container_initialize();
        this.isSolution = isSolution;

        this.rows = configGrid.rows;
        this.columns = configGrid.columns;
        this.cellSize = configGrid.cellSize;
        this.onShapeClickCallback = onShapeClickCallback;
        this.cellcolors = configGrid.cellcolors;

        this.shpGrid = new createjs.Shape();
        this.shpGrid.graphics.setStrokeStyle(1).beginStroke("#FFFFFF").drawRect(0, 0, this.columns * this.cellSize, this.rows * this.cellSize);
        this.addChild(this.shpGrid);

        (function (target) {
            target.ShapeClick = function (objcell, shapeIndex) {
                if (target.enabled && !target.isSolution) {
                    target.onShapeClickCallback(objcell, shapeIndex);
                }
            };
        })(this);

        this.cells = [];
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
                var colors = this.getColors(i, j);
                var cell = new createjs.Cell(this.cellSize, this.ShapeClick, colors, isSolution, this.configGrid, j * this.cellSize, i * this.cellSize);
                cell.x = j * this.cellSize;
                cell.y = i * this.cellSize;
                cell.name = "cell_" + i + "_" + j;
                this.addChild(cell);
                this.cells[this.cells.length] = cell;
            }
        }
        // Creamos el objeto a testear ejemplo un boton.
        this.owner = this;
        // Asignamos eventos.
    };

    p.getColors = function (row, column) {
        var colors = null;
        for (var i = 0; i < this.cellcolors.length; i++) {
            if (this.cellcolors[i].row == row && this.cellcolors[i].column == column) {
                colors = this.cellcolors[i].triangle;
                return colors;
            }
        }

        return colors;
    };

    p.checkEndActivity = function () {
        for (var i = 0; i < this.cells.length; i++) {
            var trianglesFilled = this.cells[i].trianglesFilled;
            var hitables = this.cells[i].hitables;
            if (this.configGrid.triangleCell == true) {
                for (var j = 0; j < trianglesFilled.length; j++) {
                    if (hitables[j] == true && trianglesFilled[j] == false) {
                        return false;
                    }

                }
            } else {
                if (hitables[4] == true && trianglesFilled[4] == false) {
                    return false;
                }
            }
        }

        return true;
    };

    p.setEnabled = function (value) {
        this.enabled = value;
    };

    createjs.Grid = grid;
} (window));

// ---------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
(function () {
    var gridSolution = function (configGrid) {
        this.initialize(configGrid);
    };
    var p = gridSolution.prototype = new createjs.Container();

    p.Container_initialize = p.initialize;

    p.initialize = function (configGrid) {
        this.configGrid = configGrid;
        this.Container_initialize();

        this.rows = configGrid.rows;
        this.columns = configGrid.columns;
        this.cellSize = configGrid.cellSize * this.configGrid.scaleSolution;
        this.cellcolors = configGrid.cellcolors;

        this.shpGrid = new createjs.Shape();
        this.shpGrid.graphics.setStrokeStyle(1).beginStroke("#FFFFFF").drawRect(0, 0, this.columns * this.cellSize, this.rows * this.cellSize);

        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
                var colors = this.getColors(i, j);
                this.drawCell(i, j, colors, this.configGrid, this.shpGrid);
            }
        }

        this.addChild(this.shpGrid);


        // Creamos el objeto a testear ejemplo un boton.
        this.owner = this;
    };

    p.getColors = function (row, column) {
        var colors = null;
        for (var i = 0; i < this.cellcolors.length; i++) {
            if (this.cellcolors[i].row == row && this.cellcolors[i].column == column) {
                colors = this.cellcolors[i].triangle;
                return colors;
            }
        }

        return colors;
    };

    p.drawCell = function (numRow, numCol, colors, configGrid, shpGrid) {
        var shapeColor;
        var cellSize = configGrid.cellSize * configGrid.scaleSolution;

        var borderShapeColor;

        if (configGrid.triangleCell == true) {

            shapeColor = this.getShapeColor(1, colors, this.configGrid.triangleCell);
            borderShapeColor = shapeColor;

            if (shapeColor == null) {
                shapeColor = styles.grid.shapeColor;
                borderShapeColor = styles.grid.borderShapeColor;
            }

            this.fillShape(numCol * cellSize, numRow * cellSize, 1, borderShapeColor, shapeColor, shpGrid, cellSize);

            shapeColor = this.getShapeColor(2, colors, configGrid.triangleCell);
            borderShapeColor = shapeColor;

            if (shapeColor == null) {
                shapeColor = styles.grid.shapeColor;
                borderShapeColor = styles.grid.borderShapeColor;
            }

            this.fillShape(numCol * cellSize, numRow * cellSize, 2, borderShapeColor, shapeColor, shpGrid, cellSize);

            shapeColor = this.getShapeColor(3, colors, this.configGrid.triangleCell);
            borderShapeColor = shapeColor;

            if (shapeColor == null) {
                shapeColor = styles.grid.shapeColor;
                borderShapeColor = styles.grid.borderShapeColor;
            }

            this.fillShape(numCol * cellSize, numRow * cellSize, 3, borderShapeColor, shapeColor, shpGrid, cellSize);

            shapeColor = this.getShapeColor(4, colors, this.configGrid.triangleCell);
            borderShapeColor = shapeColor;

            if (shapeColor == null) {
                shapeColor = styles.grid.shapeColor;
                borderShapeColor = styles.grid.borderShapeColor;
            }

            this.fillShape(numCol * cellSize, numRow * cellSize, 4, borderShapeColor, shapeColor, shpGrid, cellSize);
        } else {
            shapeColor = this.getShapeColor(5, colors, this.configGrid.triangleCell);
            borderShapeColor = shapeColor;

            if (shapeColor == null) {
                shapeColor = styles.grid.shapeColor;
                borderShapeColor = styles.grid.borderShapeColor;
            }

            this.fillShape(numCol * cellSize, numRow * cellSize, 5, borderShapeColor, shapeColor, shpGrid, cellSize);
        }
    };

    p.getShapeColor = function (shapeIndex, colors, triangleCell) {
        var result = null;

        if (colors != null) {
            for (var i = 0; i < colors.length; i++) {
                if (colors[i][0] == shapeIndex || colors[i][0] == undefined || triangleCell == false) {
                    result = colors[i][1][0];
                    break;
                }
            }
        };

        return result;
    };

    p.fillShape = function (x, y, index, borderShapeColor, shapeColor, shape) {
        var xColor = "#DAE8F7";
        if (borderShapeColor == shapeColor) {
            xColor = borderShapeColor;
        } else if (index == 5) {
            xColor = "#FFFFFF";
        }
        switch (index) {
            case 1:
                shape.graphics.setStrokeStyle(1).beginStroke(borderShapeColor).beginFill(shapeColor)
                .moveTo(x, y).lineTo(x + this.cellSize, y).beginStroke(xColor)
                .lineTo(x + this.cellSize, y).lineTo(x + this.cellSize / 2, y + this.cellSize / 2).lineTo(x, y).endStroke();
                break;
            case 2:
                shape.graphics.setStrokeStyle(1).beginStroke(borderShapeColor).beginFill(shapeColor)
                .moveTo(x + this.cellSize, y).lineTo(x + this.cellSize, y + this.cellSize).beginStroke(xColor)
                .lineTo(x + this.cellSize, y + this.cellSize).lineTo(x + this.cellSize / 2, y + this.cellSize / 2).lineTo(x + this.cellSize, y).endStroke();
                break;
            case 3:
                shape.graphics.setStrokeStyle(1).beginStroke(borderShapeColor).beginFill(shapeColor)
                .moveTo(x + this.cellSize, y + this.cellSize).lineTo(x, y + this.cellSize).beginStroke(xColor)
                .lineTo(x, y + this.cellSize).lineTo(x + this.cellSize / 2, y + this.cellSize / 2).lineTo(x + this.cellSize, y + this.cellSize).endStroke();
                break;
            case 4:
                shape.graphics.setStrokeStyle(1).beginStroke(borderShapeColor).beginFill(shapeColor)
                .moveTo(x, y + this.cellSize).lineTo(x, y).beginStroke(xColor)
                .lineTo(x, y).lineTo(x + this.cellSize / 2, y + this.cellSize / 2).lineTo(x, y + this.cellSize).endStroke();
                break;
            case 5:
                shape.graphics.setStrokeStyle(1).beginStroke(borderShapeColor).beginFill(shapeColor)
                .moveTo(x, y).lineTo(x + this.cellSize, y).beginStroke(xColor)
                .lineTo(x + this.cellSize, y).lineTo(x + this.cellSize / 2, y + this.cellSize / 2).lineTo(x, y).endStroke();
                shape.graphics.setStrokeStyle(1).beginStroke(borderShapeColor).beginFill(shapeColor)
                .moveTo(x + this.cellSize, y).lineTo(x + this.cellSize, y + this.cellSize).beginStroke(xColor)
                .lineTo(x + this.cellSize, y + this.cellSize).lineTo(x + this.cellSize / 2, y + this.cellSize / 2).lineTo(x + this.cellSize, y).endStroke();
                shape.graphics.setStrokeStyle(1).beginStroke(borderShapeColor).beginFill(shapeColor)
                .moveTo(x + this.cellSize, y + this.cellSize).lineTo(x, y + this.cellSize).beginStroke(xColor)
                .lineTo(x, y + this.cellSize).lineTo(x + this.cellSize / 2, y + this.cellSize / 2).lineTo(x + this.cellSize, y + this.cellSize).endStroke();
                shape.graphics.setStrokeStyle(1).beginStroke(borderShapeColor).beginFill(shapeColor)
                .moveTo(x, y + this.cellSize).lineTo(x, y).beginStroke(xColor)
                .lineTo(x, y).lineTo(x + this.cellSize / 2, y + this.cellSize / 2).lineTo(x, y + this.cellSize).endStroke();
                break;
            default:
                break;
        }
    };

    createjs.GridSolution = gridSolution;
} (window));
