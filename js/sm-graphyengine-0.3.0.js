this.sm = this.sm || {};

var degToRad = Math.PI / 180;
var radToDeg = 180 / Math.PI;

(function () {
    var graphyengine = function (htmlCanvasId, cfg, animationEnd, unique) {
        this.initialize(htmlCanvasId, cfg, animationEnd, unique);
    };

    var p = graphyengine.prototype = new sm.BaseEngine();

    p.BaseEngine_initialize = p.initialize;

    p.initialize = function (htmlCanvasId, cfg, animationEnd, unique) {
        this.BaseEngine_initialize(htmlCanvasId, cfg, animationEnd, unique);
        this.cfg = cfg;
    };

    p.BaseEngine_setupObjects = p.setupObjects;
    p.setupObjects = function () {
        this.removeAllChildren();
        createjs.Tween.removeAllTweens();

        // Establecemos el rádio de los puntos de control.
        this.radiusCp = this.cfg.trace.thickness / 2;
        this.radiusSmallPoints = this.radiusCp / 6;

        // BACKGROUND
        if (this.cfg.backgroundImage) {
            this.bkgImage = new createjs.Bitmap(ImageManager.getImage(this.cfg.backgroundImage.id));
            this.bkgImage.name = this.cfg.backgroundImage.id;
            this.bkgImage.x = this.cfg.backgroundImage.x;
            this.bkgImage.y = this.cfg.backgroundImage.y;
            this.bkgImage.z = 0;
            this.addChild(this.bkgImage);
        }

        this.pattern = new createjs.Bitmap(ImageManager.getImage(this.cfg.pattern.imageId));
        this.pattern.name = this.cfg.pattern.imageId;
        this.pattern.x = this.cfg.pattern.x;
        this.pattern.y = this.cfg.pattern.y;
        this.pattern.z = 1;
        this.addChild(this.pattern);

        this.controlPoints = [];
        this.controlPointsNumber = [];
        this.points = [];
        this.allPoints = [];
        this.traces = [];
        var globalIndex = 0;
        var subTraceIndex = 0;
        for (var index in this.cfg.pattern.traces) {
            var traceDef = this.cfg.pattern.traces[index];
            var trace = { controlPoints: [], points: [], allPoints: [], indicators: [] };
            var traceIndex = 0;
            for (var idxPoint in traceDef.controlPoints) {
                var pointDef = traceDef.controlPoints[idxPoint];
                var pointObj = null;
                if (pointDef.controlpoint) {
                    pointObj = new createjs.Shape();
                    pointObj.index = globalIndex;
                    pointObj.traceIndex = traceIndex;
                    pointObj.name = "pto" + idxPoint;
                    pointObj.isControlPoint = true;
                    pointObj.breakingTrace = pointDef.breakingTrace;
                    pointObj.graphics.beginFill(this.cfg.pointColor).drawCircle(0, 0, this.radiusCp);
                    pointObj.x = pointDef.x + this.cfg.pattern.x;
                    pointObj.y = pointDef.y + this.cfg.pattern.y;
                    pointObj.visible = false;
                    pointObj.mouseEnabled = true;
                    trace.controlPoints.push(pointObj);
                    this.controlPoints.push(pointObj);

                    var textNumberControlPoint;
                    if (pointDef.indicator != undefined) {
                        textNumberControlPoint = new createjs.Text(pointDef.indicator.text, pointDef.indicator.font, pointDef.indicator.color);
                        textNumberControlPoint.textAlign = "center";
                        textNumberControlPoint.textBaseline = "middle";
                        textNumberControlPoint.x = pointObj.x;
                        textNumberControlPoint.y = pointObj.y;
                        this.controlPointsNumber.push(textNumberControlPoint);
                        trace.indicators.push(textNumberControlPoint);
                    } else {
                        textNumberControlPoint = new createjs.Text("", "", "#000000");
                        this.controlPointsNumber.push(textNumberControlPoint);
                        trace.indicators.push(textNumberControlPoint);
                    }

                    pointObj.forzeEnd = pointDef.forzeEnd ? pointDef.forzeEnd : false;

                } else {
                    pointObj = new createjs.Shape();
                    pointObj.index = globalIndex;
                    pointObj.traceIndex = traceIndex;
                    pointObj.name = "pto" + idxPoint;
                    pointObj.isControlPoint = false;
                    pointObj.breakingTrace = pointDef.breakingTrace;
                    pointObj.graphics.beginFill(this.cfg.pointTraceColor).drawCircle(0, 0, this.radiusSmallPoints);
                    pointObj.x = pointDef.x + this.cfg.pattern.x;
                    pointObj.y = pointDef.y + this.cfg.pattern.y;
                    pointObj.visible = false;
                    pointObj.mouseEnabled = true;
                    trace.points.push(pointObj);
                    this.points.push(pointObj);
                }
                pointObj.subTraceIndex = subTraceIndex;
                globalIndex++;
                traceIndex++;
                trace.allPoints.push(pointObj);
                this.allPoints.push(pointObj);
            }
            this.traces.push(trace);
            subTraceIndex++;
        }

        this.puntero = null;
        if (this.cfg.pointer) {
            this.puntero = new createjs.Bitmap(ImageManager.getImage(this.cfg.pointer.img));
            this.puntero.x = this.cfg.pointer.x;
            this.puntero.y = this.cfg.pointer.y;
            this.puntero.alpha = 0;
        }

        //HEADER
        this.headerTool = new sm.HeaderTool(this.originalWidth);
        this.headerTool.setTituloEnunciado(this.cfg.enunciado);
        this.headerTool.name = "header";
        this.addChild(this.headerTool);

        //FOOTER
        this.footerTool = new sm.FooterTool(this.originalWidth, 0, this.originalHeight - styles.footerSM.height);
        this.footerTool.name = "footer";
        this.addChild(this.footerTool);

        if (this.cfg.includeDemo) {
            this.startButton = new smInfantil.StartButton(createjs.proxy(this.showDemo, this));
            this.startButton.x = this.cfg.buttonStart.x;
            this.startButton.y = this.cfg.buttonStart.y;
            this.startButton.setEnabled(true);
            this.addChild(this.startButton);
        } else {
            this.doGame();
        }

        this.BaseEngine_setupObjects();
        if (this.cfg.audioEnunciado) {
            this.setAudio(this.cfg.audioEnunciado);
            this.playAudio(this.cfg.audioEnunciado);
        }
    };

    p.showDemo = function () {
        this.removeChild(this.startButton);

        //linea de tiempo
        var timeline = new createjs.Timeline();
        timeline._useTicks = true;

        // Colocamos el puntero en el primer punto de control del primer trazo.
        if (this.puntero != null && this.traces.length > 0) {
            this.puntero.x = this.traces[0].controlPoints[0].x;
            this.puntero.y = this.traces[0].controlPoints[0].y;
        }

        var tweenPuntero;
        if (this.puntero != null) {
            tweenPuntero = createjs.Tween.get(this.puntero);
        }
        var tweenPattern = createjs.Tween.get(this.pattern);

        // FadeIn
        if (this.puntero != null) {
            timeline.addTween(tweenPuntero.to({ alpha: 1 }, 10));
        }
        timeline.addTween(tweenPattern.to({ alpha: 1 }, 10));

        var tweenPoints = createjs.Tween.get(this.pattern);
        tweenPoints.wait(20);

        var ptos, idxTrace, trace;

        // Generamos los trazados automáticos.
        var trazos = [];
        for (idxTrace in this.traces) {
            trace = this.traces[idxTrace];
            var trazo = new createjs.Shape();
            trazo.alpha = 0.8;
            trazo.graphics.setStrokeStyle(this.cfg.trace.thickness + 2, "round", "round").beginStroke(this.cfg.trace.color);
            trazos.push(trazo);
            trace.trazo = trazo;
        }

        for (idxTrace in this.traces) {
            trace = this.traces[idxTrace];

            // Visualizamos el primer punto de control del trazo.
            tweenPoints.call(createjs.proxy(
                function (point) {
                    this.addChild(point);
                    point.visible = true;
                }, this), [trace.controlPoints[0]]);

            // Generamos la animación de los puntitos del subtrazado.
            for (ptos = 0; ptos < trace.points.length; ptos++) {
                tweenPoints.wait(1).call(createjs.proxy(
                    function (point, t) {
                        this.addChild(point);
                        if (this.puntero != null) this.addChild(this.puntero);
                        this.addChild(t.controlPoints[0]);
                        point.visible = true;
                    }, this), [trace.points[ptos], trace]);
            }

            // Visualizamos el último punto de control del trazo.
            tweenPoints.wait(1).call(createjs.proxy(
                function (point) {
                    this.addChild(point);
                    point.visible = true;

                }, this), [trace.controlPoints[1]]);

            // Animación de trazado del trazo.
            trace.trazo.graphics.moveTo(-1000, -1000).lineTo(-100, -100); // Esto es necesario pq sino el trazo lo pinta fino... algún bbug del easy.
            for (ptos = 0; ptos < trace.allPoints.length; ptos++) {
                tweenPoints.call(createjs.proxy(
                    function (point, t) {
                        if (point.traceIndex === 0) {
                            t.trazo.graphics.endStroke();
                            t.trazo.graphics.setStrokeStyle(this.cfg.trace.thickness + 2, "round", "round").beginStroke(this.cfg.trace.color);
                            t.trazo.graphics.moveTo(point.x, point.y);
                        }
                        t.trazo.graphics.lineTo(point.x, point.y);
                        if (this.puntero != null) {
                            this.puntero.x = point.x;
                            this.puntero.y = point.y;
                        }
                        this.addChild(t.trazo);
                        if (this.puntero != null) this.addChild(this.puntero);
                    }, this), [trace.allPoints[ptos], trace]).wait(3);
            }
        }

        // Es peramos un instante y ocultamos el trazado y los puntos.
        tweenPoints.wait(20).call(createjs.proxy(
            function () {
                if (this.puntero != null) this.puntero.visible = false;
                for (idxTrace in this.traces) {
                    for (ptos in this.traces[idxTrace].allPoints) {
                        this.traces[idxTrace].allPoints[ptos].visible = false;
                    }
                    this.traces[idxTrace].trazo.visible = false;
                }
                createjs.Tween.removeAllTweens();
            }, this), []);

        // Comenzamos el juego.
        tweenPoints.call(createjs.proxy(this.doGame, this), []);

        timeline.addTween(tweenPoints);
        this.timeline = timeline;
    };

    p.doGame = function () {
        // Inicializamos la variable de verificación de trazo completado.
        this.trazoOk = false;

        var idx, point;

        // Aumentamos el tamaño de los puntos intermedios.
        for (idx in this.points) {
            point = this.points[idx];
            point.graphics.clear().beginFill(this.cfg.pointTraceColor).drawCircle(0, 0, this.radiusCp + this.cfg.errorRange);
        }

        this.startCp = this.allPoints[0];
        this.puntosTrazos = []; // Array de shapes por cada trazado (en el shape estan pintados todos los puntitos).
        this.startCp.alpha = 1;
        this.activeTraceIndex = 0;
        this.activeTrace = this.traces[this.activeTraceIndex];

        var trazo = new createjs.Shape();
        trazo.mouseEnabled = true;
        trazo.numPuntos = 0;
        for (idx in this.allPoints) {
            trazo.numPuntos += 1;
            point = this.allPoints[idx];
            point.alpha = 0.01;
            this.addChild(point);
            point.visible = true;
            if (point.isControlPoint) {
                if (idx > 0) {
                    trazo.visible = false;
                    this.puntosTrazos.push(trazo);
                    this.addChild(trazo);
                }
                trazo = new createjs.Shape();
                if (this.cfg.tracePointAlpha) {
                    trazo.alpha = this.cfg.tracePointAlpha; // Transparencia de los puntitos del trazado MOD
                } 
                trazo.mouseEnabled = true;
                trazo.numPuntos = 0;
            } else {
                if (!this.cfg.hideTracePoint) {
                    var ptoTrazoX = this.allPoints[idx].x;
                    var ptoTrazoY = this.allPoints[idx].y;
                    var ptoSubTraceIndex = this.allPoints[idx].subTraceIndex;

                    function checkIfpaint(ptos) {
                        for (var kk = 0; kk < idx - 1; kk++) {
                            if (ptos[kk].x == ptoTrazoX && ptos[kk].y == ptoTrazoY && ptos[kk].subTraceIndex == ptoSubTraceIndex) {
                                return true;
                            }
                        }
                        return false;
                    }

                    if (!checkIfpaint(this.allPoints)) {
                        trazo.graphics.beginFill(this.cfg.pointTraceColor).drawCircle(ptoTrazoX, ptoTrazoY, this.radiusSmallPoints);
                    }
                }
            }
        }

        this.trazo = new createjs.Shape();
        this.trazo.alpha = 0.8;
        this.addChild(this.trazo);

        this.cpActiveIndex = 0;
        this.cpActiveIndexVisible = 1;
        this.trazadoUsuarioCoords = [];
        this.activeTraceIndex = 0;

        this.resetDrawing(false);
    };

    p.doEnd = function () {
        //console.log("end");
        this.trazoOk = true;
        var idx;
        for (idx in this.allPoints) {
            this.allPoints[idx].visible = false;
            this.allPoints[idx].removeAllEventListeners();
        }

        for (idx in this.controlPointsNumber) {
            this.controlPointsNumber[idx].visible = false;
        }

        for (idx in this.puntosTrazos) {
            this.puntosTrazos[idx].visible = false;
        }

        this.startCp.off("pressmove", this.onPressMoveControlPoint);
        if (SoundManager != undefined && SoundManager != null) SoundManager.play(this.cfg.audioOK);
        setTimeout(createjs.proxy(this.notifyTotalSuccess, this), 500);
    };

    p.resetDrawing = function (playKo) {

        if (this.cfg.resetOnFail || !playKo) {

            this.trazo.graphics.clear();

            if (this.cfg.resetCompletedTraces) {
                this.trazadoUsuarioCoords = [];
                this.cpActiveIndex = 0;
                this.cpActiveIndexVisible = 1;
                this.activeTraceIndex = 0;
                this.activeTrace = this.traces[this.activeTraceIndex];
            } else {
                this.activeTrace = this.traces[this.activeTraceIndex];
                this.cpActiveIndex = this.traces[this.activeTraceIndex].controlPoints[0].index;
                //this.cpActiveIndexVisible = this.activeTraceIndex + 1;
                var auxArray = [];
                for (var ip = 0; ip < this.trazadoUsuarioCoords.length; ip++) {
                    var p = this.trazadoUsuarioCoords[ip];
                    if (p.subTraceIndex < this.activeTraceIndex) {
                        auxArray.push(p);
                    }
                }
                this.trazadoUsuarioCoords = auxArray;
                if (this.trazadoUsuarioCoords.length > 0) {
                    this.trazo.graphics.clear().setStrokeStyle(this.cfg.trace.thickness, "round", "round").beginStroke(this.cfg.trace.color);
                    this.trazo.graphics.moveTo(this.trazadoUsuarioCoords[0].x, this.trazadoUsuarioCoords[0].y);
                    for (var ip = 1; ip < this.trazadoUsuarioCoords.length; ip++) {
                        var p = this.trazadoUsuarioCoords[ip];
                        if (p.initial) {
                            this.trazo.graphics.endStroke();
                            this.trazo.graphics.setStrokeStyle(this.cfg.trace.thickness, "round", "round").beginStroke(this.cfg.trace.color);
                        }
                        this.trazo.graphics.lineTo(p.x, p.y);
                    }
                }
            }

            // Ocultamos el resto de puntitos de trazos posteriores.
            for (var i = 0; i < this.puntosTrazos.length; i++) {
                this.puntosTrazos[i].visible = false;
            }
            // Visualizamos los puntitos de referencia del trazo activo
            var aux = this.activeTraceIndex;
            if (this.activeTraceIndex > 0) {
                aux = this.cpActiveIndexVisible - 1;
            }
            this.puntosTrazos[aux].visible = true;
            if (this.cfg.showPoints === false) {
                this.puntosTrazos[aux].visible = false;
            }

            // Ocultamos (alpha 0) todos los puntos de control gordos y mostramos los del activo
            for (var x = 0; x < this.controlPoints.length; x++) {
                if (this.controlPoints[x].subTraceIndex == this.activeTraceIndex) {
                    this.controlPoints[x].alpha = 1;
                    this.controlPointsNumber[x].alpha = 1;
                    this.addChild(this.controlPoints[x]);
                    this.addChild(this.controlPointsNumber[x]);
                } else {
                    this.controlPoints[x].alpha = 0;
                    this.controlPointsNumber[x].alpha = 0;
                }
            }

            //this.puntosTrazos[0].visible = true;
            //if (this.cfg.showPoints == false) {
            //    this.puntosTrazos[0].visible = false;
            //}
            //if (this.puntosTrazos != undefined) {
            //    for (var i = 1; i < this.puntosTrazos.length; i++) {
            //        this.puntosTrazos[i].visible = false;
            //    }
            //}

            //for (var x = 0; x < this.controlPoints.length; x++) {
            //    this.controlPoints[x].alpha = 0;
            //    this.controlPointsNumber[x].alpha = 0;
            //}

            //this.controlPoints[0].alpha = 1;
            //this.controlPointsNumber[0].alpha = 1;
            //this.addChild(this.controlPoints[0]);
            //this.addChild(this.controlPointsNumber[0]);
            //this.controlPoints[1].alpha = 1;
            //this.controlPointsNumber[1].alpha = 1;
            //this.addChild(this.controlPoints[1]);
            //this.addChild(this.controlPointsNumber[1]);

            this.startCp.removeAllEventListeners();
            this.startCp = this.activeTrace.controlPoints[0];
            this.startCp.on("mousedown", this.onMouseDownControlPoint, this);
            this.startCp.on("pressup", this.onPressUpControlPoint, this);
        } else {
            this.startCp.removeAllEventListeners();
            this.startCp = this.allPoints[this.cpActiveIndex];
            this.startCp.on("mousedown", this.onMouseDownControlPoint, this);
            this.startCp.on("pressup", this.onPressUpControlPoint, this);
            this.startCp.graphics.clear().beginFill(this.cfg.pointColor).drawCircle(0, 0, this.radiusCp);
            this.startCp.alpha = 1;
            this.addChild(this.startCp);
        }
    };

    p.onPressUpControlPoint = function () {
        var canUp = false;
        if (this.failTrace) return;

        if (this.cpActiveIndex + 1 < this.allPoints.length &&
            (this.allPoints[this.cpActiveIndex].breakingTrace || this.allPoints[this.cpActiveIndex + 1].breakingTrace)) {

            this.puntosTrazos[this.cpActiveIndexVisible].visible = true; // MOD
            if (this.cfg.showPoints === false) {
                this.puntosTrazos[this.cpActiveIndexVisible].visible = false;
            }

            this.startCp.removeAllEventListeners();
            this.cpActiveIndex = this.activeTrace.controlPoints[0].index;
            this.cpActiveIndexVisible++; // TODO: Esto habría que quitarlo si hay ruptura de trazo y los trazos son consecutivos, pero hay que dejarlo pq si no lo son no salta al siguiente.
            //console.log(this.cpActiveIndexVisible);
            this.activeTrace.controlPoints[0].alpha = 1;
            this.activeTrace.controlPoints[1].alpha = 1;
            this.activeTrace.indicators[0].alpha = 1;
            this.activeTrace.indicators[1].alpha = 1;
            this.addChild(this.puntosTrazos[this.cpActiveIndexVisible]);
            this.addChild(this.activeTrace.controlPoints[0]);
            this.addChild(this.activeTrace.controlPoints[1]);
            this.addChild(this.activeTrace.indicators[0]);
            this.addChild(this.activeTrace.indicators[1]);


            this.startCp = this.allPoints[this.cpActiveIndex];
            this.startCp.removeAllEventListeners();
            this.startCp.on("mousedown", this.onMouseDownControlPoint, this);
            this.startCp.on("pressup", this.onPressUpControlPoint, this);

            if (this.cpActiveIndex + 1 < this.allPoints.length) {
                this.allPoints[this.cpActiveIndex + 1].on("mousedown", this.dummyMouse);
            }
            canUp = true;
        }

        if (!this.trazoOk && !canUp) {
            this.playAudio(this.cfg.audioKO, null, this); 
            this.resetDrawing(true);
        }
    };

    p.onMouseDownControlPoint = function (evt) {
        this.failTrace = false;
        this.startCp.alpha = 0.01;
        this.controlPointsNumber[this.cpActiveIndexVisible - 1].alpha = 0;

        var point = new createjs.Point(evt.stageX / globalScaleX, evt.stageY / globalScaleX);

        this.trazadoUsuarioCoords.push({ "x": point.x, "y": point.y, "initial": true, subTraceIndex: this.activeTraceIndex });

        this.addChild(this.trazo);

        this.trazo.xant = (this.stage.mouseX / globalScaleX);
        this.trazo.yant = (this.stage.mouseY / globalScaleX);

        this.trazo.graphics.endStroke();
        this.trazo.graphics.setStrokeStyle(1, "round", "round").beginFill(this.cfg.trace.color);
        this.trazo.graphics.drawCircle(point.x, point.y, this.cfg.trace.thickness / 2);
        this.trazo.graphics.endFill().setStrokeStyle(this.cfg.trace.thickness, "round", "round").beginStroke(this.cfg.trace.color);
        this.trazo.graphics.moveTo(point.x, point.y);

        if (this.cpActiveIndex >= this.allPoints.length - 1) {
            //console.log("end");
            this.doEnd();
            return;
        }

        this.firstAssign = false;
        this.startCp.on("pressmove", this.onPressMoveControlPoint, this);

        if (this.cpActiveIndex >= this.allPoints.length - 2 || this.startCp.forzeEnd == true) {  // OJO ESO ES UNA APAÑO PARA LAS i
            //console.log("end");
            this.doEnd();
            return;
        }
    };

    p.onPressMoveControlPoint = function (evt) {
        var pointText = this.pattern.globalToLocal(evt.stageX, evt.stageY);

        var inPatron = false;
        if (this.hitCircleWithShape(pointText.x, pointText.y, this.cfg.errorRange, this.pattern)) {

            var x = (evt.stageX / globalScaleX);
            var y = (evt.stageY / globalScaleX);

            //this.trazo.graphics.setStrokeStyle(this.cfg.trace.thickness, "round", "round").beginStroke(this.cfg.trace.color).lineTo(this.trazo.xant, this.trazo.yant).lineTo(x, y);

            // MODO NUEVO DE PINTADO =>
            this.trazadoUsuarioCoords.push({ "x": x, "y": y, "initial": false, subTraceIndex: this.activeTraceIndex });
            this.trazo.graphics.clear().setStrokeStyle(this.cfg.trace.thickness, "round", "round").beginStroke(this.cfg.trace.color);
            this.trazo.graphics.moveTo(this.trazadoUsuarioCoords[0].x, this.trazadoUsuarioCoords[0].y);
            for (var ip = 1; ip < this.trazadoUsuarioCoords.length; ip++) {
                var p = this.trazadoUsuarioCoords[ip];
                if (p.initial) {
                    this.trazo.graphics.endStroke();
                    this.trazo.graphics.setStrokeStyle(this.cfg.trace.thickness, "round", "round").beginStroke(this.cfg.trace.color);
                }
                this.trazo.graphics.lineTo(p.x, p.y);
            }
            //console.clear();
            //for (var ip in this.trazadoUsuarioCoords) {
            //    var pt = this.trazadoUsuarioCoords[ip];
            //    console.log(pt.x+","+pt.y);
            //}
            // <=

            this.trazo.xant = (this.stage.mouseX / globalScaleX);
            this.trazo.yant = (this.stage.mouseY / globalScaleX);

            inPatron = true;
        } else {
            if (this.cpActiveIndex < this.allPoints.length - 1) {
                this.playAudio(this.cfg.audioKO, null, this);
                this.resetDrawing(true);
            }
        }

        var objectsUnderPoint = this.stage.getObjectsUnderPoint(evt.stageX, evt.stageY, 2);
        var cpValid = false;

        for (var indexObj = 0; indexObj < objectsUnderPoint.length; indexObj++) {
            if (this.isObjectControlPoint(objectsUnderPoint[indexObj])) {
                var pointNextCp = objectsUnderPoint[indexObj].globalToLocal(evt.stageX, evt.stageY);
                if (objectsUnderPoint[indexObj].hitTest(pointNextCp.x, pointNextCp.y)) {

                    if (objectsUnderPoint[indexObj].index === this.cpActiveIndex
                        || objectsUnderPoint[indexObj].index === this.cpActiveIndex + 1
                        || objectsUnderPoint[indexObj].index === this.cpActiveIndex - 1) {
                        cpValid = true;

                        if (!this.firstAssign) {
                            this.asignActivesControlPoints(objectsUnderPoint, indexObj);
                            this.firstAssign = true;
                        }
                    }

                    if (cpValid && objectsUnderPoint[indexObj].index === this.cpActiveIndex + 1) {

                        this.cpActiveIndex++;
                        this.asignActivesControlPoints(objectsUnderPoint, indexObj);

                        if (objectsUnderPoint[indexObj].index === this.controlPoints[this.cpActiveIndexVisible].index) {
                            this.controlPoints[this.cpActiveIndexVisible].alpha = 0.01;
                            this.controlPointsNumber[this.cpActiveIndexVisible].alpha = 0.01;
                            if (this.controlPoints[this.cpActiveIndexVisible + 1] != undefined) {
                                if (!this.allPoints[this.cpActiveIndex + 1].breakingTrace) {
                                    this.addChild(this.controlPoints[this.cpActiveIndexVisible + 1]);
                                    this.addChild(this.controlPointsNumber[this.cpActiveIndexVisible + 1]);
                                    this.controlPoints[this.cpActiveIndexVisible + 1].alpha = 1;
                                    this.controlPointsNumber[this.cpActiveIndexVisible + 1].alpha = 1;
                                }

                                if (this.cpActiveIndexVisible + 1 < this.puntosTrazos.length) {
                                    if (this.puntosTrazos[this.cpActiveIndexVisible + 1].numPuntos > 1) {

                                        for (var i = 0; i < this.puntosTrazos.length; i++) {
                                            this.puntosTrazos[i].visible = false;
                                        }

                                        this.puntosTrazos[this.cpActiveIndexVisible + 1].visible = true;
                                        if (this.cfg.showPoints === false) {
                                            this.puntosTrazos[this.cpActiveIndexVisible + 1].visible = false;
                                        }

                                        this.playAudio(this.cfg.audioOK, null, this);
                                        //if (SoundManager != undefined && SoundManager != null) SoundManager.play(this.cfg.audioOK);
                                        this.activeTraceIndex++;
                                        //console.log("this.activeTraceIndex: " + this.activeTraceIndex);
                                        this.activeTrace = this.traces[this.activeTraceIndex];
                                    }
                                    this.cpActiveIndexVisible++;
                                    //console.log(this.cpActiveIndexVisible);
                                    // MOD =>
                                    if (this.allPoints[this.cpActiveIndex + 1].breakingTrace) {
                                        this.startCp.removeAllEventListeners();
                                        this.startCp.on("mousedown", this.onMouseDownControlPoint, this);
                                        this.startCp.on("pressup", this.onPressUpControlPoint, this);
                                        this.puntosTrazos[this.cpActiveIndexVisible].visible = false;
                                    }
                                    // MOD <=
                                }
                            }

                        }

                        if (this.cpActiveIndex >= this.allPoints.length - 1) {
                            for (var i = 0; i < this.puntosTrazos.length; i++) {
                                this.puntosTrazos[i].visible = false;
                            }

                            // MODO NUEVO DE PINTADO =>
                            x = this.allPoints[this.allPoints.length - 1].x;
                            y = this.allPoints[this.allPoints.length - 1].y;
                            this.trazadoUsuarioCoords.push({ "x": x, "y": y, "initial": false });
                            this.trazo.graphics.clear().setStrokeStyle(this.cfg.trace.thickness, "round", "round").beginStroke(this.cfg.trace.color);
                            this.trazo.graphics.moveTo(this.trazadoUsuarioCoords[0].x, this.trazadoUsuarioCoords[0].y);
                            for (var ip = 1; ip < this.trazadoUsuarioCoords.length; ip++) {
                                var p = this.trazadoUsuarioCoords[ip];
                                if (p.initial) {
                                    this.trazo.graphics.endStroke();
                                    this.trazo.graphics.setStrokeStyle(this.cfg.trace.thickness, "round", "round").beginStroke(this.cfg.trace.color);
                                }
                                this.trazo.graphics.lineTo(p.x, p.y);
                            }
                            //console.clear();
                            //for (var ip in this.trazadoUsuarioCoords) {
                            //    var pt = this.trazadoUsuarioCoords[ip];
                            //    console.log(pt.x+","+pt.y);
                            //}
                            // <=

                            this.doEnd();
                            return;
                        }
                        break;
                    }
                }
            }
        }

        if (cpValid) {

        } else {
            if (!this.trazoOk) {
                this.playAudio(this.cfg.audioKO, null, this);
                this.failTrace = true;
                this.resetDrawing(true);
            }
        }
    };

    p.asignActivesControlPoints = function (objectsUnderPoint, indexObj) {
        for (var ix = this.startCp.index + 1; ix < this.allPoints.length; ix++) {
            //this.controlPoints[ix].off("mousedown", this.dummyMouse);
            this.allPoints[ix].removeAllEventListeners();
            //if (!this.activeTrace.allPoints[ix].isControlPoint) this.activeTrace.allPoints[ix].alpha = 0.3;
        }
        if (objectsUnderPoint[indexObj].index - 1 > 0) {
            this.allPoints[objectsUnderPoint[indexObj].index - 1].on("mousedown", this.dummyMouse);
            //if (!this.allPoints[objectsUnderPoint[indexObj].index - 1].isControlPoint) this.allPoints[objectsUnderPoint[indexObj].index - 1].alpha = 0.5;
        }
        if (this.cpActiveIndex > 0) {
            this.allPoints[this.cpActiveIndex].on("mousedown", this.dummyMouse);
            //if (!this.allPoints[this.cpActiveIndex].isControlPoint) this.allPoints[this.cpActiveIndex].alpha = 0.5;
        }
        if (objectsUnderPoint[indexObj].index + 1 < this.allPoints.length) {
            this.allPoints[objectsUnderPoint[indexObj].index + 1].on("mousedown", this.dummyMouse);
            //if (!this.allPoints[objectsUnderPoint[indexObj].index + 1].isControlPoint) this.allPoints[objectsUnderPoint[indexObj].index + 1].alpha = 0.5;
        } else {
            this.cpActiveIndex = this.cpActiveIndex;
        }
    };

    p.isObjectControlPoint = function (obj) {
        var result = false;
        for (var icp = 0; icp < this.allPoints.length; icp++) {
            if (obj === this.allPoints[icp]) {
                result = true;
                break;
            }
        }
        return result;
    };

    p.hitCircleWithShape = function (xCenter, yCenter, radius, textopattern) {
        if (textopattern.hitTest(xCenter, yCenter)) return true;
        var result = false;
        for (var i = 0; i < 360; i += 4) {
            var x = ((radius) * Math.sin(degToRad * i)) + xCenter;
            var y = ((radius) * Math.cos(degToRad * i)) + yCenter;
            if (textopattern.hitTest(x, y)) {
                result = true;
                break;
            }
        }
        return result;
    };

    p.dummyMouse = function () {
    };

    p.disableObjects = function () {
        if (this.buttonEndActivity != undefined)
            this.buttonEndActivity.setEnabled(false);
        this.enabled = false;
    };

    p.enableObjects = function () {
        if (this.buttonEndActivity != undefined)
            this.buttonEndActivity.setEnabled(true);
        this.enabled = true;
    };

    p.notifyTotalSuccess = function () {
        this.enabled = false;
        this.disableObjects();

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
                if (this.educamosBarNav != null) {
                    var repeatButton = this.educamosBarNav.getButton("Repeat");
                    repeatButton.setEnabled(true);
                }
            }
        }
    };

    p.BaseEngine_onFinishAnimation = p.onFinishAnimation;
    p.onFinishAnimation = function () {
        if (this.infoVolverAJugar != null) this.infoVolverAJugar.visible = true;
    };

    p.BaseEngine_onRepeatActivity = p.onRepeatActivity;
    p.onRepeatActivity = function () {
        var engine = (this instanceof sm.GraphyEngine) ? this : this.parent;
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

    sm.GraphyEngine = graphyengine;
}(window));