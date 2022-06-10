this.sm = this.sm || {};

(function () {
    var bingoEngine = function (htmlCanvasId, cfg, animationEnd, unique) {
        this.initialize(htmlCanvasId, cfg, animationEnd, unique);
    };

    var p = bingoEngine.prototype = new sm.BaseEngine();
    p.singleton = null;
    p.BaseEngine_initialize = p.initialize;

    p.initialize = function (htmlCanvasId, cfg, animationEnd, unique) {
        this.BaseEngine_initialize(htmlCanvasId, cfg, animationEnd, unique);
        this.imageSectionKey = "imagenes",
        this.cfg = cfg;
        this.widthCarton = 0;
        this.heightCarton = 0;
    };

    p.BaseEngine_setupObjects = p.setupObjects;
    p.setupObjects = function () {
        this.removeAllChildren();
        var dynDomE = document.getElementById("dynDomE");
        dynDomE.innerHTML = "";

        this.stage = this.getStage();

        if (this.animationEnd != null && this.animationEnd != undefined) {
            this.animationEnd.width = this.originalWidth;
            this.animationEnd.height = this.originalHeight;
            this.addChild(this.animationEnd);
        }

        //PANTALLA PORTADA
        if (this.cfg.backgroundImage) {
            this.bkgImage = new createjs.Bitmap(ImageManager.getImage(this.cfg.backgroundImage.id, this.cfg.imageSectionKey));
            this.bkgImage.name = this.cfg.backgroundImage.id;
            this.bkgImage.x = this.cfg.backgroundImage.x;
            this.bkgImage.y = this.cfg.backgroundImage.y;
            this.bkgImage.z = -1;
            this.addChild(this.bkgImage);

        }

        this.buttonsPortada = [];
        this.buttons = [];
        this.textsPortada = [];
        this.nivel = 0;

        this.cells = [];
        this.elementosAux = [];
        this.soundCells = this.cfg.carton.elementos.slice(0);
        this.start = false;

        this.crearCarton();
        this.startButton = new smInfantil.AudioButton(createjs.proxy(this.onStartButtonClick, this));
        this.startButton.x = this.cfg.buttonStart.x;
        this.startButton.y = this.cfg.buttonStart.y;
        this.startButton.setEnabled(true);
        this.addChild(this.startButton);

        //Pastilla (HEADER)
        this.headerTool = new sm.HeaderTool(this.originalWidth);
        this.headerTool.setTituloEnunciado(this.cfg.enunciado);
        this.addChild(this.headerTool);

        //FOOTER
        this.footerTool = new sm.FooterTool(this.originalWidth, 0, this.originalHeight - styles.footerSM.height);
        this.addChild(this.footerTool);

        this.BaseEngine_setupObjects();
        if (this.cfg.audioEnunciado) {
            this.setAudio(this.cfg.audioEnunciado);
            this.playAudio(this.cfg.audioEnunciado);
        }
    };

    p.crearCarton = function () {
        this.containerCarton = new createjs.Container();

        //sombra
        var numColumns = this.cfg.cartonCfg.numColumn;
        var numRows = this.cfg.cartonCfg.numRow;
        this.widthCarton = numColumns * this.cfg.cartonCfg.cellWidth + 20;
        this.heightCarton = numRows * this.cfg.cartonCfg.cellHeight + 20;

        //var shadow = new createjs.Shape();
        //shadow.width = this.widthCarton;
        //shadow.height = this.heightCarton;
        //shadow.x = this.cfg.cartonCfg.x + 2;
        //shadow.y = this.cfg.cartonCfg.y + 2;
        //shadow.graphics.beginFill("#FFAB01").drawRoundRectComplex(0, 0, shadow.width, shadow.height, 8, 8, 8, 8);
        //this.containerCarton.addChild(shadow);

        //background celdas
        var bkg = new createjs.Shape();
        bkg.width = this.widthCarton; 
        bkg.height = this.heightCarton;
        bkg.x = this.cfg.cartonCfg.x;
        bkg.y = this.cfg.cartonCfg.y;
        bkg.graphics.setStrokeStyle(2);
        bkg.graphics.beginStroke(this.cfg.cartonCfg.cellBorderColor).beginFill(this.cfg.cartonCfg.cellBackgroundColor)
            .drawRoundRectComplex(0, 0, bkg.width, bkg.height, 8, 8, 8, 8)
            .endStroke();
        this.containerCarton.addChild(bkg);
        this.containerCarton.width = bkg.width;
        this.containerCarton.height = bkg.height;

        this.addChild(this.containerCarton);
        this.generateCells();
    };

    p.generateCells = function () {
        var cellsHueco = 0;
        this.containerCarton.cells=[];

        // Clonamos los elemetos para mantener el original.
        var cloneElementos = this.cfg.carton.elementos.slice(0);
        //Comprobamos si hay que poner celdas huecos
        var numCells = this.cfg.cartonCfg.numColumn * this.cfg.cartonCfg.numRow;
        //Si hay mas celdas que elementos creamos las celdas hueco
        if (numCells > cloneElementos.length) {
            cellsHueco = numCells - cloneElementos.length;
        }

        //Creamos una copia de los elementos
        for (var z = 0; z <= cloneElementos.length - 1; z++) {
            this.elementosAux.push(cloneElementos[z]);
        }
        
        if (cellsHueco > 0) {
            //Añadimos al array de elementos las celdas hueco
            while (cellsHueco > 0) {
                this.elementosAux.push(null);
                cellsHueco--;
            }
        }

        // Creamos un array con las celdas desordenadas.
        var cellsDesordenados = [];
        var cells = this.elementosAux;
        var index;
        while (cells.length > 0) {
            index = Math.floor(Math.random() * cells.length);
            cellsDesordenados.push(cells[index]);
            cells.splice(index, 1);
        }

        var offsetX = 10;
        var offsetY = 10;

        var numRows = this.cfg.cartonCfg.numRow;
        var numColums = this.cfg.cartonCfg.numColumn;
        var numRowsAux = 1;
        var numColumnsAux = 1;
        var widthCell = this.cfg.cartonCfg.cellWidth;
        var heightCell = this.cfg.cartonCfg.cellHeight;
        var posX = this.cfg.cartonCfg.x;
        var posY = this.cfg.cartonCfg.y;
        for (var i = 0; i <= cellsDesordenados.length - 1; i++) {
            this.containerCell = new createjs.Container();

            var shpBkg = new createjs.Shape();
            shpBkg.graphics.setStrokeStyle(1);
            shpBkg.graphics.beginStroke(this.cfg.cartonCfg.cellBorderColor).beginFill(this.cfg.cartonCfg.cellBackgroundColor)
                .drawRect(0, 0, widthCell, heightCell)
                .endStroke();
            this.containerCell.addChild(shpBkg);

            if (cellsDesordenados[i]== null) {
                //Fondo Celda vacia a cuadros tipo bingo
                var offsetXempty = 2;
                var offsetYempty = 2;
                var ancho = (widthCell - 6) / 10;
                var alto = (heightCell - 6) / 10;
                var cols = parseInt(widthCell / ancho, 10);
                var rows = parseInt(heightCell / alto, 10);
                var colorAlternativo = this.cfg.cartonCfg.cellHoleColor;
                var color = this.cfg.cartonCfg.cellBackgroundColor;
                var colors = [colorAlternativo, color, colorAlternativo];
                var idx = 0;
                var offsetColor = 0;
                for (var r = 0; r < rows; r++) {
                    for (var c = 0; c < cols; c++) {
                        color = colors[(idx % 2) + offsetColor];
                        //No pintamos celdas blancas
                        if (color === colorAlternativo) { 
                            var shpBkgRect = new createjs.Shape();
                            shpBkgRect.graphics.beginFill(color).drawRect(offsetXempty, offsetYempty, ancho, alto);
                            this.containerCell.addChild(shpBkgRect);
                        }
                        offsetXempty += ancho;
                        idx++;
                    }
                    if ((cols)%2 !== 0)
                    {
                        idx--;
                    }
                    offsetColor = offsetColor === 0 ? 1 : 0;
                    offsetXempty = 2;
                    offsetYempty += alto;
                    this.containerCell.name = null;
                }
            } else {
                //Si es una imagen
                if (cellsDesordenados[i].idImagen != "") {
                    var image = ImageManager.getImage(cellsDesordenados[i].idImagen);
                    var bmp = new createjs.Bitmap(image);
                    bmp.x = this.cfg.cartonCfg.cellWidth / 2;
                    bmp.y = this.cfg.cartonCfg.cellHeight / 2;
                    bmp.regX = image.width / 2;
                    bmp.regY = image.height / 2;
                    bmp.scaleX = (widthCell / image.width) - 0.1;
                    bmp.scaleY = (heightCell / image.height) - 0.1;
                    this.containerCell.addChild(bmp);

                } else {
                    var texto = new createjs.Text(cellsDesordenados[i].texto, cellsDesordenados[i].font, cellsDesordenados[i].color);
                    texto.x = ((widthCell / 2) - (texto.getMeasuredWidth() / 2));
                    texto.y = ((heightCell / 2) - (texto.getMeasuredHeight() / 2));
                    this.containerCell.addChild(texto);
                }
                this.containerCell.name = cellsDesordenados[i].audio;
            }
            this.addChild(this.containerCell);
            this.containerCell.x = posX + offsetX;
            this.containerCell.y = posY + offsetY;

            this.containerCell.Enabled = false;
            this.cells.push(this.containerCell);
            this.containerCarton.cells.push(this.containerCell);

            numColumnsAux++;
            if (numColumnsAux > numColums) {
                numColumnsAux = 1;
                numRowsAux++;
                if (numRowsAux > numRows) {
                    break;
                } else {
                    offsetX = 10;
                    posX = this.cfg.cartonCfg.x;
                    posY = posY + heightCell;
                    
                }
            } else {
                posX = posX + widthCell;
            }
        }
    };

    p.cellClick = function () {
        var owner = this.parent;
        var cell = this;
        if (this.name == owner.soundCells[0].audio) {
            owner.playAudio(owner.cfg.audioOK, function () { this.onStartButtonClick(); }, owner);
            if (owner.cfg.cartonCfg.imagenOk != undefined) {
                var imgOk = new createjs.Bitmap(ImageManager.getImage(owner.cfg.cartonCfg.imagenOk));
                imgOk.x = ((owner.cfg.cartonCfg.cellWidth / 2) - imgOk.image.width / 2);
                imgOk.y = ((owner.cfg.cartonCfg.cellHeight / 2) - imgOk.image.height / 2);
                this.addChild(imgOk);
            } else {
                cell.children[1].alpha = 1;
                createjs.Tween.get(cell.children[1])
                    .to({ alpha: 0 }, 800);
            }
            cell.off("click", cell.listenerOnClick);
            cell.listenerOnClick = null;
            showHandCursor(false);

            owner.soundCells.splice(0, 1);
        } else {
            owner.playAudio(owner.cfg.audioKO, function () { this.onStartButtonClick(); }, owner);
        }

        //setTimeout(createjs.proxy(owner.onStartButtonClick,owner), 1000);
    }

    p.onStartButtonClick = function () {
        if (!this.start) {

            //if (this.getSingelton().cfg.platform === "Infantil" && this.footerTool != undefined) {
            //    var audioButtonDef = styles.icons.Audio;
            //    var audioButtonImage = document.createElement("img");
            //    audioButtonImage.src = audioButtonDef.src.replace(/_/g, "/");
            //    audioButtonImage.width = audioButtonDef.width;
            //    audioButtonImage.height = audioButtonDef.height;

            //    var audioButtonRooloverDef = styles.icons.Audio_Rollover;
            //    var audioButtonRooloverImage = document.createElement("img");
            //    audioButtonRooloverImage.src = audioButtonRooloverDef.src.replace(/_/g, "/");
            //    audioButtonRooloverImage.width = audioButtonRooloverDef.width;
            //    audioButtonRooloverImage.height = audioButtonRooloverDef.height;

            //    var audioButtonDisabledDef = styles.icons.Audio_Desactivado;
            //    var audioButtonDisabledImage = document.createElement("img");
            //    audioButtonDisabledImage.src = audioButtonDisabledDef.src.replace(/_/g, "/");
            //    audioButtonDisabledImage.width = audioButtonDisabledDef.width;
            //    audioButtonDisabledImage.height = audioButtonDisabledDef.height;
            //    this.startButton.changeImages(audioButtonImage, audioButtonRooloverImage, audioButtonDisabledImage);
            //}

            // Desordenamos los audios
            var cellsSoundDesordenadas = [];
            var cellsSound = this.soundCells;
            var index;
            while (cellsSound.length > 0) {
                index = Math.floor(Math.random() * cellsSound.length);
                cellsSoundDesordenadas.push(cellsSound[index]);
                cellsSound.splice(index, 1);
            }
            this.soundCells = cellsSoundDesordenadas;

            //Añadimos a las celdas el evento Click, Mouseover y Mouseout
            for (var t = 0; t <= this.containerCarton.cells.length - 1; t++) {
                if (this.containerCarton.cells[t].name != null) {
                    var listener = this.containerCarton.cells[t].on("click", createjs.proxy(this.cellClick, this.containerCarton.cells[t]));
                    this.containerCarton.cells[t].listenerOnClick = listener;

                    this.containerCarton.cells[t].on("mouseover", function() {
                        if (this.listenerOnClick != null && this.listenerOnClick != undefined) {
                            showHandCursor(true);
                        };
                    });

                    this.containerCarton.cells[t].on("mouseout", function() {
                        showHandCursor(false);
                    });
                }
            }
            this.start = true;
        }

        if (this.soundCells.length == 0) {
            this.notifyTotalSuccess();
            //setTimeout(createjs.proxy(this.notifyTotalSuccess, this), 1000);
        }
        else
        {
            this.playAudio(this.soundCells[0].audio);
            console.log(this.soundCells[0].audio);
        }
    }

    p.notifyTotalSuccess = function () {
        this.enabled = false;

        this.startButton.setEnabled(false);
        if (this.audioButton) {
            this.audioButton.setEnabled(false);
        }

        if (this.cfg.audioFinal != undefined) {
            this.playAudio(this.cfg.audioFinal, this.onEndActivity, this);
        } else {
            this.onEndActivity();
        }
    };

    p.BaseEngine_onEndActivity = p.onEndActivity;
    p.onEndActivity = function () {
        if (this.activityEnded) {
            return;
        }
        this.activityEnded = true;
        this.repeatButton.setEnabled(true);
        if (this.isUnique() && this.animationEnd != null && this.animationEnd != undefined) {
            this.removeChild(this.animationEnd);
            this.addChild(this.animationEnd);
            this.addChild(this.headerTool);
            this.addChild(this.footerTool);
            this.animationEnd.run(this.onFinishAnimation);
            if (this.cfg.platform == "SM") {
                this.repeatButton = this.getRepeatButton();
                this.removeChild(this.repeatButton);
                this.addChild(this.repeatButton);
            } else if (this.cfg.platform === "Infantil") {
                this.repeatButton.setEnabled(true);
            } else {
                var repeatButton = this.educamosBarNav.getButton("Repeat");
                repeatButton.setEnabled(true);
            }
            if (this.infoVolverAJugar != null) this.infoVolverAJugar.visible = true;
        } else if (this.isUnique() == false) {
            this.getSingelton().onEndActivity();
        } else {
            if (this.cfg.platform == "SM") {
                this.repeatButton = this.getRepeatButton();
                this.removeChild(this.repeatButton);
                this.addChild(this.repeatButton);
            } else if (this.cfg.platform === "Infantil") {
                this.repeatButton.setEnabled(true);
            } else {
                var repeatButton = this.educamosBarNav.getButton("Repeat");
                repeatButton.setEnabled(true);
            }
        }
    };

    p.BaseEngine_onFinishAnimation = p.onFinishAnimation;
    p.onFinishAnimation = function () {
        if (this.infoVolverAJugar != null) this.infoVolverAJugar.visible = true;
    };

    p.BaseEngine_onRepeatActivity = p.onRepeatActivity;
    p.onRepeatActivity = function () {
        var engine = (this instanceof sm.BingoEngine) ? this : this.parent;
        if (engine.animationEnd != null && engine.animationEnd != undefined) {
            engine.animationEnd.stop();
            engine.removeChild(engine.animationEnd);
        }
        if (engine.cfg.platform === "Infantil") {
            this.repeatButton.setEnabled(false);
        } else {
            engine.removeChild(engine.getRepeatButton());
        }
        engine.reset();
    };

    p.disableObjects = function () {
        var i;

        for (i = 0; i < this.imgObjetos.length; i++) {
            this.imgObjetos[i].enabled = false;
        }

        for (i = 0; i < this.dragObjetos.length; i++) {
            this.dragObjetos[i].enabled = false;
            try {
                this.dragObjetos[i].desactivate();
            } catch (err) {
            }
        }
    };

    sm.BingoEngine = bingoEngine;
}(window));
