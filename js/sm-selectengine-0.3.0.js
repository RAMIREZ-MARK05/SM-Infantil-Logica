this.sm = this.sm || {};

(function () {
    var selectEngine = function (htmlCanvasId, cfg, animationEnd, unique) {
        this.initialize(htmlCanvasId, cfg, animationEnd, unique);
    };
   
    var p = selectEngine.prototype = new sm.BaseEngine();
    p.singleton = null;
    p.BaseEngine_initialize = p.initialize;

    p.initialize = function (htmlCanvasId, cfg, animationEnd, unique) {
        this.BaseEngine_initialize(htmlCanvasId, cfg, animationEnd, unique);
        this.imageSectionKey= "imagenes",
        this.cfg = cfg;
        this.objetos = [];
        
        //this.objetosEscena = [];
        this.aciertos = 0;
    };

    p.BaseEngine_setupObjects = p.setupObjects;
    p.setupObjects = function() {
        var dynDomE = document.getElementById("dynDomE");
        dynDomE.innerHTML = "";

        this.stage = this.getStage();

        if (this.animationEnd != null && this.animationEnd != undefined) {
            this.animationEnd.width = this.originalWidth;
            this.animationEnd.height = this.originalHeight;
            this.addChild(this.animationEnd);
        }

        this.aciertos = 0;
        if ((this.cfg.groups != undefined) && (this.cfg.groups != null)) {
            this.aciertos_selectObj = [];
            for (var i = 0; i <= this.cfg.groups.length - 1; i++) {
                this.aciertos_selectObj.push({ id: this.cfg.groups[i].id, successes: 0 });

            }
        }

        // BACKGROUND
        if (this.cfg.backgroundImage) {
            this.bkgImage = new createjs.Bitmap(ImageManager.getImage(this.cfg.backgroundImage.id, this.cfg.imageSectionKey));
            this.bkgImage.name = this.cfg.backgroundImage.id;
            this.bkgImage.x = this.cfg.backgroundImage.x;
            this.bkgImage.y = this.cfg.backgroundImage.y;
            this.bkgImage.z = -1;
            this.addChild(this.bkgImage);
        }

        if (this.cfg.imageObjects) {
            this.generateObjects(this.cfg.imageObjects);
        }

        this.buttonCorrect = new sm.Button(10, 10, 0, 0, null); // Esto es para que siempre esté creado.

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

    p.generateObjects = function (objectDefArray) {
        this.objetos = [];
        if (objectDefArray) {
            for (var o = 0; o < objectDefArray.length; o++) {
                var objDef = objectDefArray[o];
                var obj = new sm.ImageButton(objDef.x, objDef.y, ImageManager.getImage(objDef.imageId), ImageManager.getImage(objDef.imageId), ImageManager.getImage(objDef.imageId), createjs.proxy(this.onClickObject, this));
                obj.z = objDef.z ? objDef.z : 0;
                obj.objDef = objDef;
                obj.locked = false;
                obj.valid = objectDefArray[o].valid;
                obj.img_dragdrop = objDef.imagen_dragdrop;
                obj.img_dragdropX = objDef.imagen_dragdropX;
                obj.img_dragdropY = objDef.imagen_dragdropY;
                obj.x = objDef.x;
                obj.y = objDef.y;
                this.addChild(obj);
                this.objetos.push(obj);
            }
        }
    };

    p.onClickObject = function (obj) {
        if (obj.valid) {
            //Cargar imagenes y obtener acierto según tipo de imagen(tartas)
            if ((this.cfg.groups.length != 0) && ((this.cfg.groups != undefined) && (this.cfg.groups != null))) {
                var ok = false;
                var enc = false;
                //Buscamos la imagen al que pertenece el obj
                for (var x = 0; x <= this.aciertos_selectObj.length - 1; x++) {
                    //Buscamos el objeto
                    if (this.aciertos_selectObj[x].id == obj.objDef.groupId) {
                        //Comprobamos el número de aciertos
                        if (this.aciertos_selectObj[x].successes < this.cfg.groups[x].successes) {
                            //comprobamos si hay que cargar alguna imgaen.
                            if (obj.objDef.imagen_dragdrop != null) {
                                var obj2 = new createjs.Bitmap(ImageManager.getImage(obj.objDef.imagen_dragdrop, this.cfg.imageSectionKey));
                                obj2.x = obj.objDef.imagen_dragdropX;
                                obj2.y = obj.objDef.imagen_dragdropY;
                                this.addChild(obj2);
                                this.objetos.push(obj2);
                                obj.enabled = false;
                                obj.cursor = "default";
                            }
                            this.aciertos_selectObj[x].successes++;
                            this.aciertos++;
                            this.playAudio(this.cfg.audioOK);

                            break;
                        } else {
                            this.playAudio(this.cfg.audioKO);
                        }
                    }
                }
            } else {
                //Si hay que poner imagen encima.
                if ((obj.img_dragdrop != undefined) && (obj.img_dragdrop != null)) {
                    var objOn = new sm.ImageButton(obj.img_dragdropX, obj.img_dragdropY, ImageManager.getImage(obj.img_dragdrop), ImageManager.getImage(obj.img_dragdrop), ImageManager.getImage(obj.img_dragdrop), null);
                    objOn.x = obj.img_dragdropX;
                    objOn.y = obj.img_dragdropY;
                    objOn.valid = false;
                    this.addChild(objOn);
                    this.objetos.push(objOn);
                }
                this.playAudio(this.cfg.audioOK);
                this.aciertos++;
            }

            if (this.aciertos == this.cfg.successes) {
                this.aciertos = 0;
                this.disableObjects();
                setTimeout(createjs.proxy(this.notifyTotalSuccess, this), 1000);
            }
        }
        else {
            this.playAudio(this.cfg.audioKO);
        }
    };

    p.notifyTotalSuccess = function () {
        this.enabled = false;
        this.disableObjects();
        //this.repeatButton.setEnabled(false);

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
    p.onEndActivity = function() {
        if (this.activityEnded) {
            return;
        }
        this.activityEnded = true;
        this.repeatButton.setEnabled(true);
        if (this.isUnique() && this.animationEnd != null && this.animationEnd != undefined) {
            this.removeChild(this.animationEnd);
            this.addChild(this.animationEnd);
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
        var engine = (this instanceof sm.SelectEngine) ? this : this.parent;
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
        for (i = 0; i < this.objetos.length; i++) {
            this.objetos[i].enabled = false;
        }
    };

 ////////////////////////////////////

    sm.SelectEngine = selectEngine;
}(window));
