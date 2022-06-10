this.sm = this.sm || {};

//Audio del Título de la actividad.
//Finalizar la actividad
//Btn Repetir

(function () {
    var memoryEngine = function (htmlCanvasId, cfg, animationEnd, unique) {
        this.initialize(htmlCanvasId, cfg, animationEnd, unique);
    };

    var p = memoryEngine.prototype = new sm.BaseEngine();
    p.singleton = null;
    p.BaseEngine_initialize = p.initialize;

    p.initialize = function (htmlCanvasId, cfg, animationEnd, unique) {
        this.BaseEngine_initialize(htmlCanvasId, cfg, animationEnd, unique);
        this.imageSectionKey = "imagenes",
        this.cfg = cfg;
        this.objetos = [];

        this.lastCard = null;
        this.card = null;
        this.aciertos = 0;
        this.timerId = 0;
    };

    p.BaseEngine_setupObjects = p.setupObjects;
    p.setupObjects = function () {
        var dynDomE = document.getElementById("dynDomE");
        dynDomE.innerHTML = "";

        this.stage = this.getStage();

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

        if (this.cfg.desk) {
            this.generateDesk(this.cfg.desk);
        }

        if (this.cfg.pairObjects) {
            this.generatePairObjects(this.cfg.pairObjects);
        }

        this.buttonCorrect = new sm.Button(10, 10, 0, 0, null); // Esto es para que siempre esté creado.
        
        this.volteo2 = 0;

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

    p.generateDesk = function (desk) {
        this.dummyCards = [];

        var width = 0;
        var height = 0;
        
        if (desk.cards.cardImg != null) {
            width = desk.cards.cardImg.width;
            height = desk.cards.cardImg.height;
        } else if (desk.cards.cardBackImg != null) {
            width = desk.cards.cardBackImg.width;
            height = desk.cards.cardBackImg.height;
        } else {
            width = desk.cards.width;
            height = desk.cards.height;
        }

        for (var i = 0; i < desk.cards.numCardsX; i++) {
            for (var j = 0; j < desk.cards.numCardsY; j++) {
                var card = new sm.Card(desk.x + i * (width + desk.cards.sepX), desk.y + j * (height + desk.cards.sepY),
                    width, height, desk.cards.backgroundColor, desk.cards.borderColor, desk.cards.borderSize,
                    desk.cards.roundSize, desk.cards.cardImg, desk.cards.cardBackImg, createjs.proxy(this.onClickObject, this));
                this.addChild(card);
                this.dummyCards.push(card);
            }
        }
    };

    p.generatePairObjects = function (objectDefArray) {
        this.cards = [];

        if (objectDefArray) {
            if (this.dummyCards == null || this.dummyCards == undefined || objectDefArray.length * 2 != this.dummyCards.length) {
                return;
            }

            for (var o = 0; o < objectDefArray.length; o++) {
                for (var j = 0; j < objectDefArray[o].length; j++) {
                    var number = 0;
                    number = randomInt(0, this.dummyCards.length - 1);
                    var card = this.dummyCards[number];
                    this.dummyCards.splice(number, 1);

                    // Se asigna el objeto a la carta
                    var objeto = objectDefArray[o][j];
                    card.order = this.cards.length;
                    card.pair = o;
                    card.setObject(objeto);
                    this.cards.push(card);
                }


            }
        }
    };

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    p.onClickObject = function (obj) {
        if (this.timerId != 0)
            return;

        if (this.volteo == true) return;
        this.volteo = true;

        obj.volverCard(obj);

        if (this.lastCard == null) {
            this.lastCard = obj;
        } else {
            this.card = obj;
            //this.timerId = setInterval(createjs.proxy(this.volverCartas, this), 1600);
        }
    };

    p.volverCartas = function (obj) {
        clearInterval(this.timerId);
        this.timerId = 0;

        if (this.lastCard.pair == this.card.pair) {
            this.aciertos++;
            this.lastCard = null;
            this.card = null;
            this.volteo = false;
            if (this.aciertos == this.cards.length / 2) {
                this.notifyTotalSuccess();
                this.aciertos = 0;
            } else {
                this.notifyPartialSuccess();
            }
        } else {
            setTimeout(new createjs.proxy(
		function(){
            		this.lastCard.volverCard(this.lastCard);
            		this.card.volverCard(this.card);
            		this.lastCard = null;
            		this.card = null;
            		this.volteo = false;
		},
		this), 1500);



            this.notifyError();
        }
    };

    p.notifyTotalSuccess = function () {
        this.enabled = false;
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

    p.notifyPartialSuccess = function () {
        if (this.cfg.audioOK != undefined)
            this.playAudio(this.cfg.audioOK);
    };

    p.notifyError = function () {
        if (this.cfg.audioKO != undefined)
            this.playAudio(this.cfg.audioKO);
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
        var engine = (this instanceof sm.MemoryEngine) ? this : this.parent;
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



    sm.MemoryEngine = memoryEngine;
}(window));

// ---------------------------------------------------------------------------------------------------------
// Card ----------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
(function () {
    var Card = function (x, y, width, height, backgroundColor, borderColor, borderSize, roundSize, cardImg, cardBackImg, callbackClick) {
        this.initialize(x, y, width, height, backgroundColor, borderColor, borderSize, roundSize, cardImg, cardBackImg, callbackClick);
    };
    var p = Card.prototype = new createjs.Container();

    p.backImage = null;
    p.cardImage = null;
    p.mouseIn = false;
    p.enabled = true;
    p.pair = null;
    p.order = null;
    p.frontImage = null;
    p.frontSound = null;
    p.frontText = null;

    p.Container_initialize = p.initialize;

    p.initialize = function (x, y, width, height, backgroundColor, borderColor, borderSize, roundSize, cardImgDef, cardBackImgDef, callbackClick) {
        this.Container_initialize();
        this.x = x + width / 2;
        this.y = y;
        this.width = width;
        this.height = height;
        this.backgroundColor = backgroundColor;
        this.borderColor = borderColor;
        this.borderSize = borderSize;
        this.roundSize = roundSize;
        this.enabled = true;
        this.cardImgDef = cardImgDef;
        this.cardBackImgDef = cardBackImgDef;
        this.timeEffect = 0;
        this.regX = this.width / 2;

        this.crearCardShp();
        this.callbackClick = callbackClick;

        this.on("click", function (event) {
            if (this.enabled) {
                if (this.callbackClick)
                    this.callbackClick(this);
            }
        });

    };


    p.volverCard = function (obj) {

        if ((obj.frontImage != null && obj.frontImage.visible) || (obj.frontText != null && obj.frontText.visible)) {
            obj.enabled = true;
            obj.generateEffectFront();
        } else {
            obj.enabled = false;
            obj.generateEffectBack();
        }
    };

    p.generateEffectBack = function () {
        createjs.Tween.get(this)
            .to({ scaleX: 0 }, 500)
            .call(function() {
                if (this.backImage != null) {
                    this.backImage.visible = false;
                }
                if (this.frontImage != null) {
                    this.frontImage.visible = true;
                }
                if (this.frontText != null) {
                    this.frontText.visible = true;
                }
            })
            .to({ scaleX: 1 }, 500)
            .call(function () {
                if (SoundManager != undefined && this.frontSound != null)
                    SoundManager.play(this.frontSound, undefined, createjs.proxy(
                        function() {
                            //this.parent.volteo = false;
                            this.parent.volteo2++;
                            if (this.parent.volteo2 == 2) {
                                this.parent.volteo2 = 0;
                                createjs.proxy(this.parent.volverCartas, this.parent).call();
                            } else {
                                this.parent.volteo = false;
                            }
                        }, this));
		if (!this.frontSound){
                            //this.parent.volteo = false;
                            this.parent.volteo2++;
                            if (this.parent.volteo2 == 2) {
                                this.parent.volteo2 = 0;
                                createjs.proxy(this.parent.volverCartas, this.parent).call();

                            } else {
                                this.parent.volteo = false;
                            }
		}
                
                //if (this.frontSound != null)
                //    this.parent.playAudio(this.frontSound);
            });
    };

    p.generateEffectFront = function () {
        createjs.Tween.get(this)
        	.to({ scaleX: 0 }, 500)
            .call(function () {
                if (this.frontImage != null) {
                    this.frontImage.visible = false;
                }
                if (this.backImage != null) {
                    this.backImage.visible = true;
                }
                if (this.frontText != null) {
                    this.frontText.visible = false;
                }
            })
			.to({ scaleX: 1 }, 500);
    };

    p.crearCardShp = function () {
        if (this.cardImgDef == null || this.cardImgDef == undefined) {
            this.removeChild(this.cardShp);
            this.cardShp = new createjs.Shape();
            this.cardShp.width = this.width;
            this.cardShp.height = this.height;
            this.cardShp.x = 0;
            this.cardShp.y = 0;
            this.cardShp.graphics.clear()
            .setStrokeStyle(this.borderSize)
            .beginStroke(this.borderColor)
            .beginFill(this.backgroundColor)
            .drawRoundRect(0, 0, this.cardShp.width, this.cardShp.height, this.roundSize)
            .endStroke();

            this.addChild(this.cardShp);
        } else {
            var imageFront = ImageManager.getImage(this.cardImgDef.id);
            if (imageFront != null) {
                this.cardImage = new createjs.Bitmap(imageFront);
                this.cardImage.x = this.cardImgDef.x;
                this.cardImage.y = this.cardImgDef.y;
                this.cardImage.scaleX = this.cardImgDef.width / imageFront.width;
                this.cardImage.scaleY = this.cardImgDef.height / imageFront.height;
                this.addChild(this.cardImage);
            }
        }


        if (this.cardBackImgDef) {
            var image = ImageManager.getImage(this.cardBackImgDef.id);
            if (image != null) {
                this.backImage = new createjs.Bitmap(image);
                this.backImage.x = this.cardBackImgDef.x;
                this.backImage.y = this.cardBackImgDef.y;
                this.backImage.scaleX = this.cardBackImgDef.width / image.width;
                this.backImage.scaleY = this.cardBackImgDef.height / image.height;
                //this.backImg.regX = this.backImg.x + this.width / 2;
                this.addChild(this.backImage);
            }
        }
    };

    //    p.draw = function (ctx, ignoreCache) {
    //        if (this.visible) {
    //            ctx.save();
    //            this.dummy.updateContext(ctx);
    //            this.dummy.draw(ctx);
    //            ctx.restore();
    //        } else {
    //            
    //        }
    //    };

    p.setObject = function (object) {
        if (object.image != undefined) {
            this.setImage(object);
        }
        if (object.text != undefined) {
            this.setText(object.text);
        }
        if (object.sound != undefined) {
            this.setSound(object.sound);
        }
    };
    p.setText = function (textDef) {
        this.frontText = new createjs.Text(textDef.id, textDef.font, textDef.fontColor);
        this.frontText.x = this.width/2;
        
        if (this.frontImage != null) {
            this.frontText.y = 0.85*this.height;          
        } else {
            this.frontText.y = this.height/2;
        }

        this.frontText.maxWidth = this.width;
        this.frontText.textAlign = "center";
        this.frontText.textBaseline = "middle";
        this.frontText.visible = false;
        this.addChild(this.frontText);
    };

    p.setImage = function (objectDef) {
        var imageDef = objectDef.image;
        if (imageDef) {
            var image = ImageManager.getImage(imageDef.id);
            if (image != null) {
                this.frontImage = new createjs.Bitmap(image);
                this.frontImage.regX = image.width / 2;
                this.frontImage.regY = image.height / 2;
                this.frontImage.x = this.width / 2;

                var heightMaxForImage = this.height;
                
                if (objectDef.text != undefined && objectDef.text != null) {
                    this.frontImage.y = 0.35*this.height;
                    heightMaxForImage = 0.7 * this.height;
                } else {
                    this.frontImage.y = 0.5*this.height;
                }
                    
                // si esto sucede se reescala la imagen para que entre en la tarjeta
                if (image.width > this.width || image.height > heightMaxForImage) {
                    var scaleX = this.width / image.width;
                    var scaleY = heightMaxForImage / image.height;
                    
                    if (scaleX < scaleY) {
                        scaleY = scaleX;
                    } else {
                        scaleX = scaleY;
                    }
                    
                    this.frontImage.scaleX = scaleX;
                    this.frontImage.scaleY = scaleY;
                }
                
                if (imageDef.width != undefined && imageDef.height != undefined) {
                    this.frontImage.scaleX = imageDef.width / image.width;
                    this.frontImage.scaleY = imageDef.height / image.height;
                }

                this.frontImage.visible = false;
                this.addChild(this.frontImage);
            }
        }
    };

    p.setSound = function (soundDef) {
        if (soundDef) {
            this.frontSound = soundDef.id;
        }
    };

    sm.Card = Card;
}(window));

