this.smInfantil = this.smInfantil || {};

// ---------------------------------------------------------------------------------------------------------
// smInfantil.Button -------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
(function () {
    var button = function (imageUpDef, imageOverDef, imageDisabledDef, callbackClick) {
        this.initialize(imageUpDef, imageOverDef, imageDisabledDef, callbackClick);
    };

    var p = button.prototype = new sm.ImageButton();

    p.ImageButton_initialize = p.initialize;
    p.initialize = function (imageUpDef, imageOverDef, imageDisabledDef, callbackClick) {
        if (imageUpDef) {
            var imageUp = document.createElement("img");
            imageUp.src = imageUpDef.src.replace(/_/g, "/");
            imageUp.width = imageUpDef.width;
            imageUp.height = imageUpDef.height;

            var imageOver = document.createElement("img");
            imageOver.src = imageOverDef.src.replace(/_/g, "/");
            imageOver.width = imageOverDef.width;
            imageOver.height = imageOverDef.height;

            var imageDisabled = document.createElement("img");
            imageDisabled.src = imageDisabledDef.src.replace(/_/g, "/");
            imageDisabled.width = imageDisabledDef.width;
            imageDisabled.height = imageDisabledDef.height;

            this.ImageButton_initialize(0, 0, imageUp, imageOver, imageDisabled, callbackClick);
            this.width = imageUp.width;
            this.height = imageUp.height;
        }
    };

    p.blink = function() {

    };

    smInfantil.Button = button;
}(window));

// ---------------------------------------------------------------------------------------------------------
// smInfantil.StartButton -------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
(function () {
    var startButton = function (callbackClick) {
        this.initialize(callbackClick);
    };

    var p = startButton.prototype = new smInfantil.Button();

    p.Button_initialize = p.initialize;
    p.initialize = function (callbackClick) {
        var imageUpDef = styles.icons.Entra;
        var imageOverDef = styles.icons.Entra_Rollover;
        var imageDisabledDef = styles.icons.Entra_Desactivado;
        this.Button_initialize(imageUpDef, imageOverDef, imageDisabledDef, callbackClick);
    };

    smInfantil.StartButton = startButton;
}(window));

// ---------------------------------------------------------------------------------------------------------
// smInfantil.StartAudio -------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
(function () {
    var audioButton = function (callbackClick) {
        this.initialize(callbackClick);
    };

    var p = audioButton.prototype = new smInfantil.Button();

    p.Button_initialize = p.initialize;
    p.initialize = function (callbackClick) {
        var imageUpDef = styles.icons.Audio;
        var imageOverDef = styles.icons.Audio_Rollover;
        var imageDisabledDef = styles.icons.Audio_Desactivado;
        this.Button_initialize(imageUpDef, imageOverDef, imageDisabledDef, callbackClick);
    };

    smInfantil.AudioButton = audioButton;
}(window));

// ---------------------------------------------------------------------------------------------------------
// smInfantil.HomeButton -------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
(function () {
    var homeButton = function (callbackClick) {
        this.initialize(callbackClick);
    };

    var p = homeButton.prototype = new smInfantil.Button();

    p.Button_initialize = p.initialize;
    p.initialize = function (callbackClick) {
        var imageUpDef = styles.icons.Inicio;
        var imageOverDef = styles.icons.Inicio_Rollover;
        var imageDisabledDef = styles.icons.Inicio_Desactivado;
        this.Button_initialize(imageUpDef, imageOverDef, imageDisabledDef, callbackClick);
    };

    smInfantil.HomeButton = homeButton;
}(window));

// ---------------------------------------------------------------------------------------------------------
// smInfantil.Back -------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
(function () {
    var backButton = function (callbackClick) {
        this.initialize(callbackClick);
    };

    var p = backButton.prototype = new smInfantil.Button();

    p.Button_initialize = p.initialize;
    p.initialize = function (callbackClick) {
        var imageUpDef = styles.icons.Atras;
        var imageOverDef = styles.icons.Atras_Rollover;
        var imageDisabledDef = styles.icons.Atras_Desactivado;
        this.Button_initialize(imageUpDef, imageOverDef, imageDisabledDef, callbackClick);
    };

    smInfantil.BackButton = backButton;
}(window));

// ---------------------------------------------------------------------------------------------------------
// smInfantil.Next -------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
(function () {
    var nextButton = function (callbackClick) {
        this.initialize(callbackClick);
    };

    var p = nextButton.prototype = new smInfantil.Button();

    p.Button_initialize = p.initialize;
    p.initialize = function (callbackClick) {
        var imageUpDef = styles.icons.Adelante;
        var imageOverDef = styles.icons.Adelante_Rollover;
        var imageDisabledDef = styles.icons.Adelante_Desactivado;
        this.Button_initialize(imageUpDef, imageOverDef, imageDisabledDef, callbackClick);
    };

    smInfantil.NextButton = nextButton;
}(window));

// ---------------------------------------------------------------------------------------------------------
// smInfantil.Mostrar -------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
(function () {
    var mostrarButton = function (callbackClick) {
        this.initialize(callbackClick);
    };

    var p = mostrarButton.prototype = new smInfantil.Button();

    p.Button_initialize = p.initialize;
    p.initialize = function (callbackClick) {
        var imageUpDef = styles.icons.Mostrar;
        var imageOverDef = styles.icons.Mostrar_Rollover;
        var imageDisabledDef = styles.icons.Mostrar_Desactivado;
        this.Button_initialize(imageUpDef, imageOverDef, imageDisabledDef, callbackClick);
    };

    smInfantil.MostrarButton = mostrarButton;
}(window));

// ---------------------------------------------------------------------------------------------------------
// smInfantil.Ocultar -------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
(function () {
    var ocultarButton = function (callbackClick) {
        this.initialize(callbackClick);
    };

    var p = ocultarButton.prototype = new smInfantil.Button();

    p.Button_initialize = p.initialize;
    p.initialize = function (callbackClick) {
        var imageUpDef = styles.icons.Ocultar;
        var imageOverDef = styles.icons.Ocultar_Rollover;
        var imageDisabledDef = styles.icons.Ocultar_Desactivado;
        this.Button_initialize(imageUpDef, imageOverDef, imageDisabledDef, callbackClick);
    };

    smInfantil.OcultarButton = ocultarButton;
}(window));

// ---------------------------------------------------------------------------------------------------------
// smInfantil.NavigationBar -------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
(function () {
    var navigationBar = function (x, y, numSteps, callbackBtnClick) {
        this.initialize(x, y, numSteps, callbackBtnClick);
    };

    var p = navigationBar.prototype = new sm.BarraNavegacion();

    p.BarraNavegacion_initialize = p.initialize;
    p.initialize = function (x, y, numSteps, callbackBtnClick) {
        this.BarraNavegacion_initialize(x, y, numSteps, callbackBtnClick);
        this.removeAllChildren();
        this.numSteps = numSteps;
        this.progressBar = new sm.ProgressImageBar(this.numSteps, 2, styles.icons.Steps, styles.icons.StepsActive);
        this.progressBar.x = 5;
        this.progressBar.y = 0;
        this.addChild(this.progressBar);

        this.btnPrev = new smInfantil.BackButton(this.navOnPrev);
        this.btnPrev._barraNavegacion = this;
        this.btnPrev.x = totalWidth / 2 - (this.btnPrev.width * 1.5);
        this.btnPrev.y = 0;
        this.addChild(this.btnPrev);

        this.btnNext = new smInfantil.NextButton(this.navOnNext);
        this.btnNext._barraNavegacion = this;
        this.btnNext.x = totalWidth / 2 + (this.btnPrev.width * 0.5);
        this.btnNext.y = 0;
        this.addChild(this.btnNext);
    };

    p.BarraNavegacion_navOnNext = p.navOnNext;
    p.navOnNext = function () {
        createjs.proxy(this._barraNavegacion.BarraNavegacion_navOnNext, this)();
        this._barraNavegacion.progressBar.setProgress(this._barraNavegacion.stepActual);
    };

    p.BarraNavegacion_navOnPrev = p.navOnPrev;
    p.navOnPrev = function () {
        createjs.proxy(this._barraNavegacion.BarraNavegacion_navOnPrev, this)();
        this._barraNavegacion.progressBar.setProgress(this._barraNavegacion.stepActual);
    };

    p.BarraNavegacion_reset = p.reset;
    p.reset = function () {
        this.stepActual = 1;
        this.progressBar.setProgress(this.stepActual);
    };

    smInfantil.NavigationBar = navigationBar;
}(window));
