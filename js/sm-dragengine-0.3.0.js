this.sm = this.sm || {};

(function () {
    var dragEngine = function (htmlCanvasId, cfg, animationEnd, unique) {
        this.initialize(htmlCanvasId, cfg, animationEnd, unique);
    };
   
    var p = dragEngine.prototype = new sm.BaseEngine();
    //p.singleton = null;
    p.BaseEngine_initialize = p.initialize;

    p.initialize = function (htmlCanvasId, cfg, animationEnd, unique) {
        this.BaseEngine_initialize(htmlCanvasId, cfg, animationEnd, unique);
        this.imageSectionKey= "imagenes",
        this.cfg = cfg;
        this.imgObjetos = [];
        this.dragObjetos = [];
        this.hotAreas = [];
        this.aciertos = 0;
    };

    p.BaseEngine_setupObjects = p.setupObjects;
    p.setupObjects = function() {
        var dynDomE = document.getElementById("dynDomE");
        dynDomE.innerHTML = "";
        counterDynDomEids = 0;

        //ANIMACIÓN
        if (this.animationEnd != null && this.animationEnd != undefined) {
            this.animationEnd.width = this.originalWidth;
            this.animationEnd.height = this.originalHeight;
            this.addChild(this.animationEnd);
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

        //GENERACIÓN DE OBJETOS IMAGEN ESTÁTICOS
        if (this.cfg.imageObjects) {
            this.generateImageObjects(this.cfg.imageObjects);
        }

        //GENERACIÓN DE LAS ÁREAS CALIENTES
        this.hotAreas.length = 0;

        if (this.cfg.hotAreas) {
            this.generateHotAreas(this.cfg.hotAreas);
        }

        //GENERACIÓN DE OBJETOS QUE SE VAN A ARRASTRAR
        if (this.cfg.dragObjects) {
            this.generateDragObjects(this.cfg.dragObjects);
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

    p.generateImageObjects = function(objectDefArray) {
        this.objetos = [];
        if (objectDefArray) {
            for (var i = 0; i < objectDefArray.length; i++) {
                var objDef = objectDefArray[i];
                var obj = new createjs.Bitmap(ImageManager.getImage(objDef.id, this.cfg.imageSectionKey));
                obj.z = objDef.z ? objDef.z : 0;
                obj.x = objDef.x;
                obj.y = objDef.y;
                this.addChild(obj);
                this.imgObjetos.push(obj);
            }
        }

    }

    p.generateDragObjects = function (objectDefArray) {
        this.objetos = [];
        if (objectDefArray) {
            for (var o = 0; o < objectDefArray.length; o++) {
                var objDef = objectDefArray[o];
                var obj = new sm.ResizeableBitmap(ImageManager.getImage(objDef.id), this.cfg.resizePointSize);
                obj.z = objDef.z ? objDef.z : 0;
                obj.objDef = objDef;
                obj.locked = false;
                obj.multidrop = objDef.multidrop == undefined ? true : objDef.multidrop;
                obj.notCheckObjectArea = objDef.notCheckObjectArea;
                obj.num_succes = objDef.num_succes == undefined ? 1 : objDef.num_succes;
                obj.hotAreas = objDef.hotAreas;
                obj.dropImage = objDef.dropImage;
                if (objDef.hotAreas != undefined) {
                    for (var indexHotAreaDef = 0; indexHotAreaDef < objDef.hotAreas.length; indexHotAreaDef++) {
                        var hotAreaDef = objDef.hotAreas[indexHotAreaDef];
                        if (hotAreaDef.dropZones != undefined) {
                            for (var indexDropZoneDef = 0; indexDropZoneDef < hotAreaDef.dropZones.length; indexDropZoneDef++) {
                                var dropZoneDef = hotAreaDef.dropZones[indexDropZoneDef];
                                dropZoneDef.dropped = 0;
                            }
                        }
                    }
                } 

                obj.clonable = objDef.clonable;
                obj.canRemove = objDef.editable && objDef.clonable;
                
                if (objDef.draggable != undefined) {
                    obj.draggable = objDef.draggable;
                } else {
                    obj.draggable = true;
                    obj.onDragDrop = this.onDragDropObject;
                }

                if (objDef.visible != undefined) {
                    obj.visible = objDef.visible;
                } else {
                    obj.visible = true;
                }

                if (objDef.name != undefined) {
                    obj.name = objDef.name;
                } else {
                    obj.name = "objeto_noname";
                }

                obj.onActivate = this.onActivateObject;

                if (objDef.initScale) {
                    obj.initScale = objDef.initScale;
                    obj.scaleX = objDef.initScale;
                    obj.scaleY = objDef.initScale;
                }
                if (objDef.dropScale) {
                    obj.dropScale = objDef.dropScale;
                }

                if (objDef.dragScale) {
                    obj.dragScale = objDef.dragScale;
                }

                obj.x = objDef.x;
                obj.y = objDef.y;
                obj.cursor = "pointer";
                this.addChild(obj);
                this.dragObjetos.push(obj);
            }
        }
    };

    p.generateHotAreas = function (hotAreasDefArray) {
        this.targetHits = 0;

        if (hotAreasDefArray) {
            for (var h = 0 in hotAreasDefArray) {
                var hotDef = hotAreasDefArray[h];
                var hot = new sm.HotArea(hotDef.name, hotDef.points, hotDef.sizepos, hotDef.imagepos, hotDef.circle);
                hot.locked = false;
                hot.name = hotDef.name;
                hot.hotDef = hotDef;
                hot.multidrop = hotDef.multidrop;
                hot.enabled = hotDef.enabled != undefined ? hotDef.enabled : true;
                hot.hotAreaVisible = hotDef.hotAreaVisible != undefined ? hotDef.hotAreaVisible : false;
                hot.successes = hotDef.successes != undefined ? hotDef.successes : null;
                hot.aciertos = 0;

                hot.xIni = hot.hotDef.points[0].x;
                hot.xFin = hot.hotDef.points[1].x;
                hot.obj = [];

                hot.esAreaValida = hotDef.esAreaValida;
      
                hot.sound = null;
                if (hotDef.sound != undefined) {
                    hot.sound = hotDef.sound;
                }

                var addHot = hotDef.add != undefined ? hotDef.add : true;
                if (addHot) {
                    this.addChild(hot);
                }

                this.hotAreas.push(hot);
            }
        }
    };

    p.onDragDropObject = function(obj, mouseX, mouseY) {
        if (!this.parent.iniciado) {
            this.parent.com.IniciaEjecucion();
            this.parent.iniciado = true;
        }

        if (!obj.clonable) {
            var resultado = this.parent.processObject(obj, mouseX, mouseY);
            if (resultado[0]) {
                if (obj.parent != this.parent) {
                    this.parent.addChild(obj);
                    this.parent.reorderLayers();
                }

                if (obj.editable && obj.parent == this.parent) {
                    obj.activate();
                    obj.desactivate();
                    obj.activate();
                    this.parent.playAudio(this.parent.cfg.audioOK);
                }
                if (obj.dropImage != undefined) {
                    var objDrop = new createjs.Bitmap(ImageManager.getImage(obj.dropImage[resultado[1]].id, this.parent.cfg.imageSectionKey));
                    objDrop.x = (obj.dropImage[resultado[1]].x == "DROP") ? (mouseX - (objDrop.image.width / 2)) : obj.dropImage[resultado[1]].x;
                    objDrop.y = (obj.dropImage[resultado[1]].y == "DROP") ? (mouseY - (objDrop.image.height / 2)) : obj.dropImage[resultado[1]].y;
                    objDrop.z = -1;
                    this.parent.addChild(objDrop);
                    //this.parent.dragObjetos.pop(objDrop);
                    obj.visible = false;
                }
            } else {
                this.parent.playAudio(this.parent.cfg.audioKO);
            }
        } else {
            //hacer para el objeto clonable
            var resultado = this.parent.processObject(obj, mouseX, mouseY);
            if (resultado[0]) {
                if (obj.parent != this.parent) {
                    this.parent.addChild(obj);
                    this.parent.reorderLayers();
                }

                if (obj.editable && obj.parent == this.parent) {
                    obj.activate();
                    obj.desactivate();
                    obj.activate();
                    this.parent.playAudio(this.parent.cfg.audioOK);
                }
                if (obj.dropImage != undefined) {
                    var objDrop = new createjs.Bitmap(ImageManager.getImage(obj.dropImage[resultado[1]].id, this.parent.cfg.imageSectionKey));
                    objDrop.x = (obj.dropImage[resultado[1]].x == "DROP") ? (mouseX - (objDrop.image.width / 2)) : obj.dropImage[resultado[1]].x;
                    objDrop.y = (obj.dropImage[resultado[1]].y == "DROP") ? (mouseY - (objDrop.image.height / 2)) : obj.dropImage[resultado[1]].y;
                    objDrop.z = -1;
                    this.parent.addChild(objDrop);
                    //this.parent.dragObjetos.pop(objDrop);
                    //obj.visible = false;
                    obj.x = obj.origin.x;
                    obj.y = obj.origin.y;
                    obj.enabled = true;
                    obj.cursor = "pointer";
                }
            } else {
                this.parent.playAudio(this.parent.cfg.audioKO);
            }
     }
    

    // Para volver a poner por encima el header y el footer
        this.parent.addChild(this.parent.headerTool);
        this.parent.addChild(this.parent.footerTool);
    };

    //PARA VOLVER A PONER POR ENCIMA EL HEADER Y EL FOOTER
    p.onActivateObject = function () {
        this.parent.addChild(this.parent.headerTool);
        this.parent.addChild(this.parent.footerTool);
    };

    p.processObject = function (obj, mouseX, mouseY) {
        var game = this;
        var valido = false;
        var numArea = 0;
        var encHotArea = false;
        var dropX = null;
        var dropY = null;
        var dropZ = null;
        var hotArea = null;
        var ajustCoordX = true;
        var ajustCoordY = true;
        var dropZoneValida = null;


        //if ((obj.num_succes != null) && (obj.num_succes != undefined) && (obj.num_succes != 0)) {
        //    if (this.aciertos + obj.num_succes > game.cfg.successes) {
        //        obj.x = obj.origin.x;
        //        obj.y = obj.origin.y;
        //        return false;
        //    }
        //}

        if (!this.iniciado) {
            this.com.IniciaEjecucion();
            this.iniciado = true;
        }

        if (obj.hotAreas != undefined) {
            for (var i = 0; i < game.hotAreas.length; i++) {
                if (encHotArea) break;
                hotArea = game.hotAreas[i];
                //Buscamos el área seleccionada
                if (hotArea.enabled) {

                    for (var j = 0; j < obj.hotAreas.length; j++) {
                        numArea = j;
                        //Comprobamos que el objeto tenga ese área y que las coordenadas del ratón estén dentro del área
                        if (obj.hotAreas[j].hotArea == hotArea.name && hotArea.pointInHotArea(mouseX, mouseY) && (obj.hotAreas[j].esAreaValida)) {
                            if (hotArea.successes != null && hotArea.aciertos >= hotArea.successes) {
                                obj.x = obj.origin.x;
                                obj.y = obj.origin.y;
                                return false;
                            }
                            if (obj.hotAreas[j].dropZones != undefined) {
                                encHotArea = true;
                                for (var indexDropZone = 0; indexDropZone < obj.hotAreas[j].dropZones.length; indexDropZone++) {
                                    var dropZone = obj.hotAreas[j].dropZones[indexDropZone];
                                    if (dropZone.dropped == 0 || (obj.num_succes > dropZone.dropped)) {
                                        //Si el hotArea tiene algún objeto y el objeto tiene varios hotAreas no lo ponemos
                                        if (obj.multidrop == false && (game.hotAreas[i].linkObject != undefined) && (obj.hotAreas.length > 1)) {
                                            encHotArea = true;
                                        } else
                                        {
                                            dropX = dropZone.x;
                                            if (dropX < 0) dropX = 0;
                                            dropY = dropZone.y;
                                            if (dropY < 0) dropY = 0;

                                            if (dropZone.z != undefined) dropZ = dropZone.z;
                                            dropZone.dropped++;
                                            dropZoneValida = dropZone;

                                            //if ((obj.num_succes != null) && (obj.num_succes != undefined) && (obj.num_succes != 0)) {
                                            //    this.aciertos = this.aciertos + obj.num_succes;
                                            //} else {
                                            this.aciertos++;
                                            if (hotArea.successes != null) {
                                                hotArea.aciertos++;
                                            }
                                            //}
                                        }
                                        break;
                                    }
                                }
                            } else {
                                var objDropX = "same";
                                var objDropY = "same";
                                var objDropZ = 0;
                                if (obj.hotAreas[j].dropCases != undefined) {
                                    var validDropCase = false;
                                    for (var indexDropCase = 0; indexDropCase < obj.hotAreas[j].dropCases.length; indexDropCase++) {
                                        var dropCase = obj.hotAreas[j].dropCases[indexDropCase];
                                        if (dropCase.ang == obj.rotation) {
                                            objDropX = dropCase.x;
                                            objDropY = dropCase.y;
                                            validDropCase = true;
                                            this.buttonCorrect.setEnabled(true);
                                            break;
                                        }
                                    }

                                    if (!validDropCase) {
                                        break;
                                    }
                                } else {
                                    if (obj.hotAreas[j].dropX != undefined) {
                                        objDropX = obj.hotAreas[j].dropX;
                                    }
                                    if (obj.hotAreas[j].dropY != undefined) {
                                        objDropY = obj.hotAreas[j].dropY;
                                    }
                                    if (obj.hotAreas[j].dropZ != undefined) {
                                        objDropZ = obj.hotAreas[j].dropZ;
                                    }
                                }

                                var auxPosObj = { x: 0, y: 0 };
                                auxPosObj = obj.globalToLocal(mouseX, mouseY);

                                if (isNumeric(objDropX)) {
                                    dropX = objDropX;
                                } else {
                                    if (objDropX == "same") {
                                        dropX = mouseX; //mouseX - auxPosObj.x;
                                        ajustCoordX = false;
                                    }
                                }

                                if (isNumeric(objDropY)) {
                                    dropY = objDropY;
                                } else {
                                    if (objDropY == "same") {
                                        dropY = mouseY; //mouseY - auxPosObj.y;
                                        ajustCoordY = false;
                                    }
                                }

                                if (isNumeric(objDropZ)) {
                                    dropZ = objDropZ;
                                }
                            }

                            if (dropX != null && 
                                dropY != null && 
                                (dropX >= 0 || dropX == "DROP") && 
                                (dropY >= 0 || dropY == "DROP")) {
                                valido = true;
                            }
                            break;
                        }
                    }
                }
            }
        } else {
            obj.scaleX = obj.dropScale;
            obj.scaleY = obj.dropScale;
            obj.x = mouseX;
            obj.y = mouseY;
            obj.z = 1;
            this.buttonCorrect.setEnabled(true);
            return true;
        }

        if (valido && hotArea) {
            if (dropX >= 0 && dropY >= 0) {
                obj.scaleX = obj.dropScale;
                obj.scaleY = obj.dropScale;
                if (ajustCoordX) {
                    obj.x = dropX - ((obj.image.width - (obj.image.width * obj.scaleX)) / 2) + obj.regX;
                } else {
                    obj.x = dropX;
                }
                if (ajustCoordY) {
                    obj.y = dropY - ((obj.image.height - (obj.image.height * obj.scaleY)) / 2) + obj.regY;
                } else {
                    obj.y = dropY;
                }
                if (dropZ != null && dropZ >= 0) {
                    obj.z = dropZ;
                }
                hotArea.linkObject = obj;
            }
            if (dropZ == null || dropZ <= 0) {
                obj.z = 1;
            }

            obj.enabled = false;
            obj.draggable = false;
            obj.locked = true;

            obj.cursor = "default";
            if (obj.editable == true) {
                obj.enabled = true;
            }
            
        } else {
            obj.x = obj.origin.x;
            obj.y = obj.origin.y;
        }

        if (valido) {
            if (this.cfg.successes > 0 && this.aciertos == this.cfg.successes) {
                this.aciertos = 0;
                //this.disableObjects();
                this.playAudio(this.cfg.audioOK);
                setTimeout(createjs.proxy(this.notifyTotalSuccess, this), 1000);
            } else {
                this.playAudio(this.cfg.audioOK);
            }
        }
        return [valido, numArea];
    };

    p.notifyTotalSuccess = function () {
        this.enabled = false;
        
        if (this.dragObjetos.length > 0 &&
            this.dragObjetos[0].num_succes != null &&
            this.dragObjetos[0].num_succes != undefined &&
            this.dragObjetos[0].num_succes != 0 &&
            this.cfg.imgObjFinSuccesses != undefined) {
            var imgFinSuccesses = new createjs.Bitmap(ImageManager.getImage(this.cfg.imgObjFinSuccesses.id, this.cfg.imageSectionKey));
            //this.bkgImage.name = this.cfg.imgObjFinSuccesses.id;
            imgFinSuccesses.x = this.cfg.imgObjFinSuccesses.x;
            imgFinSuccesses.y = this.cfg.imgObjFinSuccesses.y;
            imgFinSuccesses.z = -1;
            this.addChild(imgFinSuccesses);
        }

        this.disableObjects();
        this.repeatButton.setEnabled(false);

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
        var engine = (this instanceof sm.DragEngine) ? this : this.parent;
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
            this.dragObjetos[i].mouseEnabled = false;
            try {
                this.dragObjetos[i].desactivate();
            } catch (err) {
            }
        }
    };
   
 ////////////////////////////////////

    sm.DragEngine = dragEngine;
}(window));
