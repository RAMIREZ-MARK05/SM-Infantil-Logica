$(document).ready(function () {
    var cfg = {
        sizeMode: 1,
        audios: [],
        autoEvaluate: true,
        platform: "Infantil",
        canReset: false,
        randomScenes: false,
        disableFade: false,
        imageSectionKey: "global",
        avatars: {
            imageSectionKey: "global",
            avatarsId: ["avatar1", "avatar2", "avatar3", "avatar4", "avatar5", "avatar6"]
        },
        menuNumPlayers: {
            messageText: cadenas.seleccionJugadores,
            audioText: audios.seleccionJugadores,
            imageSectionKey: "global",
            selectorsNumPlayer: [
                { numPlayers: 1, playActivities: 15, button: { x: 0, y: 150, imageId: "btn1PlayerUp", imageRollId: "btn1PlayerRoll" } },
                { numPlayers: 2, playActivities: 10, button: { x: 322, y: 150, imageId: "btn2PlayerUp", imageRollId: "btn2PlayerRoll" } },
                { numPlayers: 3, playActivities: 8, button: { x: 641, y: 150, imageId: "btn3PlayerUp", imageRollId: "btn3PlayerRoll" } }
            ]
        },
        menuSelIconPlayer: {
            messageTextOnlyOnePlayer: cadenas.unicoJugadorImagen,
            audioTextOnlyOnePlayer: audios.seleccionUnicoJugador,
            messagesText: [cadenas.jugador1Imagen, cadenas.jugador2Imagen, cadenas.jugador3Imagen],
            audiosText: [audios.jugador1Imagen, audios.jugador2Imagen, audios.jugador3Imagen],
            imageSectionKey: "global",
            selectorsIconPlayer: [
                { avatarIndex: 0, button: { x: 7, y: 80, imageId: "btnAvatar1up", imageRollId: "btnAvatar1roll", imageDisabledId: "btnAvatar1disabled" } },
                { avatarIndex: 1, button: { x: 322, y: 80, imageId: "btnAvatar2up", imageRollId: "btnAvatar2roll", imageDisabledId: "btnAvatar2disabled" } },
                { avatarIndex: 2, button: { x: 637, y: 80, imageId: "btnAvatar3up", imageRollId: "btnAvatar3roll", imageDisabledId: "btnAvatar3disabled" } },
                { avatarIndex: 3, button: { x: 7, y: 310, imageId: "btnAvatar4up", imageRollId: "btnAvatar4roll", imageDisabledId: "btnAvatar4disabled" } },
                { avatarIndex: 4, button: { x: 322, y: 310, imageId: "btnAvatar5up", imageRollId: "btnAvatar5roll", imageDisabledId: "btnAvatar5disabled" } },
                { avatarIndex: 5, button: { x: 637, y: 310, imageId: "btnAvatar6up", imageRollId: "btnAvatar6roll", imageDisabledId: "btnAvatar6disabled" } }
            ]
        },
        menuTurnPlayers: {
            messagesText: [cadenas.turnoJugador1, cadenas.turnoJugador2, cadenas.turnoJugador3],
            audiosText: [audios.turnoJugador1, audios.turnoJugador2, audios.turnoJugador3],
            styles: [
                { font: "normal 55px Arial", foreColor: "#000000", backgroundColor: "#A4F17A" },
                { font: "normal 55px Arial", foreColor: "#000000", backgroundColor: "#7DF1FF" },
                { font: "normal 55px Arial", foreColor: "#000000", backgroundColor: "#FFC48B" }
            ]
        },
        items:
		[
            // Scene 1
		    { 
		        engine: "sm.SelectEngine",
		        imageSectionKey: "scene1",
		        cfg:
				{
				    backgroundImage: { id: "", x: 23, y: 52 },
				    buttonRepeat: { x: 28, y: 429, width: 100, textId: cadenas.empty },
				    enunciado: cadenas.enunciado1,
				    audioEnunciado: audios.enunciado1,
				    audioOK: audios.fxok,
				    audioKO: audios.fxko,
				    audioClic: audios.sinAudio,
				    audioFinal: audios.fxtada,
				    successes: 5,
				    groups: [
				    ],
				    imageObjects: [
                        { id: "niniio_9", x: 8, y: 77, imageId: "niniio_9", valid: true, imagen_dragdrop: "nino9Ok", imagen_dragdropX: 5, imagen_dragdropY: 74, },
                        { id: "niniio_8", x: 629, y: 69, imageId: "niniio_8", valid: true, imagen_dragdrop: "nino8Ok", imagen_dragdropX: 626, imagen_dragdropY: 66, },
                        { id: "niniio_7", x: 206, y: 69, imageId: "niniio_7", valid: false, },
                        { id: "niniio_6", x: 225, y: 279, imageId: "niniio_6", valid: true, imagen_dragdrop: "nino6Ok", imagen_dragdropX: 222, imagen_dragdropY: 276, },
                        { id: "niniio_5", x: 432, y: 72, imageId: "niniio_5", valid: false, },
                        { id: "niniio_4", x: 620, y: 293, imageId: "niniio_4", valid: false, },
                        { id: "niniio_3", x: 763, y: 210, imageId: "niniio_3", valid: true, imagen_dragdrop: "nino3Ok", imagen_dragdropX: 760, imagen_dragdropY: 207, },
                        { id: "nino_2", x: 31, y: 294, imageId: "nino_2", valid: false, },
                        { id: "niniio_1", x: 428, y: 279, imageId: "niniio_1", valid: true, imagen_dragdrop: "nino1OK", imagen_dragdropX: 425, imagen_dragdropY: 276, },
				    ],
				}
		    },

            // Scene 2
			{
			    engine: "sm.MemoryEngine",
			    imageSectionKey: "scene2",
			    cfg:
		        {
		            backgroundImage: { id: "", x: 0, y: 81 },
		            buttonRepeat: { x: 28, y: 429, width: 100, textId: cadenas.empty },
		            enunciado: cadenas.enunciado2,
		            audioEnunciado: audios.enunciado2,
		            audioOK: audios.fxok,
		            audioKO: audios.fxko,
		            audioClic: audios.sinAudio,
		            audioFinal: audios.fxtada,
		            desk: {
		                x: 147,
		                y: 80,
		                cards: {
		                    numCardsX: 4,
		                    numCardsY: 2,
		                    width: 152,
		                    height: 205,
		                    sepX: 20,
		                    sepY: 20,
		                    borderColor: "#999999",
		                    backgroundColor: "#FFFFFF",
		                    borderSize: 2,
		                    roundSize: 10,
		                    cardImg: { id: "front", x: 0, y: 0, width: 152, height: 205 },
		                    cardBackImg: { id: "reverso", x: 0, y: 0, width: 152, height: 205 },
		                },
		            },
		            pairObjects: [
                        [
                            { image: { id: "india_espaldas" } },
                            { image: { id: "india_frente" } },
                        ],
                        [
                            { image: { id: "indio_espaldas" } },
                            { image: { id: "indio_frente" } },
                        ],
                        [
                            { image: { id: "marinera_espaldas" } },
                            { image: { id: "marinera_frente" } },
                        ],
                        [
                            { image: { id: "marinero_espaldas" } },
                            { image: { id: "marinero_frente" } },
                        ],
		            ],
		        }
			},

            // Scene 3
			{
			    engine: "sm.SelectEngine",
			    imageSectionKey: "scene3",
			    cfg:
			    {
			        backgroundImage: { id: "", x: -2, y: 54 },
			        buttonRepeat: { x: 28, y: 429, width: 100, textId: cadenas.empty },
			        enunciado: cadenas.enunciado3,
			        audioEnunciado: audios.enunciado3,
			        audioOK: audios.fxok,
			        audioKO: audios.fxko,
			        audioClic: audios.sinAudio,
			        audioFinal: audios.fxtada,
			        successes: 4,
			        groups: [
			            { id: "senal", successes: 1, },
			            { id: "pizza", successes: 1, },
			            { id: "montana", successes: 1, },
			            { id: "servilleta", successes: 1, },
			        ],
			        imageObjects: [
			            { id: "servilleta", x: 481, y: 369, imageId: "servilleta", valid: true, groupId: "servilleta", imagen_dragdrop: "servilletaOk", imagen_dragdropX: 478, imagen_dragdropY: 368, },
			            { id: "senal", x: 60, y: 342, imageId: "senal", valid: true, groupId: "senal", imagen_dragdrop: "senalOk", imagen_dragdropX: 57, imagen_dragdropY: 339, },
			            { id: "reloj", x: 753, y: 347, imageId: "reloj", valid: false, },
			            { id: "pizza", x: 479, y: 117, imageId: "pizza", valid: true, groupId: "pizza", imagen_dragdrop: "pizzaOk", imagen_dragdropX: 476, imagen_dragdropY: 114, },
			            { id: "pelota", x: 287, y: 224, imageId: "pelota", valid: false, },
			            { id: "montana", x: 687, y: 80, imageId: "montana", valid: true, groupId: "montana", imagen_dragdrop: "montanaOk", imagen_dragdropX: 684, imagen_dragdropY: 77, },
			            { id: "cuadro", x: 36, y: 103, imageId: "cuadro", valid: false, },
			        ],
			    }
			}, 

            //Scene 4
			{
			    engine: "sm.DragEngine",
			    imageSectionKey: "scene4",
			    cfg:
			    {
			        backgroundImage: { id: "fondo", x: -6, y: 66 },
			        buttonRepeat: { x: 28, y: 320, width: 100, textId: cadenas.empty },
			        enunciado: cadenas.enunciado4,
			        audioEnunciado: audios.enunciado4,
			        audioOK: audios.fxok,
			        audioKO: audios.fxko,
			        audioClic: audios.sinAudio,
			        audioFinal: audios.fxtada,
			        hotAreas: [
			            {
			                name: "hotArea0",
			                points: [{ x: 270, y: 476 }, { x: 356, y: 459 }, { x: 420, y: 389 }, { x: 448, y: 314 }, { x: 432, y: 227 }, { x: 360, y: 142 }, { x: 270, y: 124 }, { x: 191, y: 140 }, { x: 125, y: 190 }, { x: 90, y: 290 }, { x: 115, y: 393 }, { x: 179, y: 453 },],
			                hotAreaVisible: false,
			            },
			        ],
			        dragObjects: [
			            { x: 812, y: 410, id: "trianguloRojo", clonable: false, hotAreas: [{ hotArea: "hotArea0", esAreaValida: true, dropZones: [{ x: 294, y: 258 }] },], dropImage: [{ id: "trianguloRojo", x: 294, y: 258 },] },
			            { x: 658, y: 278, id: "trianguloAzul", clonable: false, hotAreas: [{ hotArea: "hotArea0", esAreaValida: true, dropZones: [{ x: 150, y: 258 }] },], dropImage: [{ id: "trianguloAzul", x: 150, y: 258 },] },
			            { x: 706, y: 168, id: "cuadradoRojo", clonable: false, hotAreas: [], dropImage: [] },
			            { x: 694, y: 399, id: "cuadradoAzul", clonable: false, hotAreas: [], dropImage: [] },
			            { x: 772, y: 302, id: "circuloRojo", clonable: false, hotAreas: [], dropImage: [] },
			            { x: 842, y: 202, id: "circuloAzul", clonable: false, hotAreas: [], dropImage: [] },
			        ],
			        successes: 2,
			    }
			},

            // Scene 5
			{
			    engine: "sm.SelectEngine",
			    imageSectionKey: "scene5",
			    cfg:
			    {
			        backgroundImage: { id: "", x: -2, y: 54 },
			        buttonRepeat: { x: 28, y: 429, width: 100, textId: cadenas.empty },
			        enunciado: cadenas.enunciado5,
			        audioEnunciado: audios.enunciado5,
			        audioOK: audios.fxok,
			        audioKO: audios.fxko,
			        audioClic: audios.sinAudio,
			        audioFinal: audios.fxtada,
			        successes: 3,
			        groups: [
			        ],
			        imageObjects: [
                        { id: "reloj", x: 31, y: 96, imageId: "reloj", valid: false, },
                        { id: "regla", x: 777, y: 94, imageId: "regla", valid: true, imagen_dragdrop: "reglaOk", imagen_dragdropX: 775, imagen_dragdropY: 91, },
                        { id: "pizza", x: 214, y: 112, imageId: "pizza", valid: true, imagen_dragdrop: "pizzaOK", imagen_dragdropX: 211, imagen_dragdropY: 109, },
                        { id: "marco", x: 323, y: 277, imageId: "marco", valid: false, },
                        { id: "dorito", x: 606, y: 412, imageId: "dorito", valid: true, imagen_dragdrop: "doritoOk", imagen_dragdropX: 603, imagen_dragdropY: 409, },
                        { id: "diana", x: 745, y: 259, imageId: "diana", valid: false, },
                        { id: "cojin", x: 48, y: 319, imageId: "cojin", valid: false, },
                        { id: "azulejo", x: 478, y: 110, imageId: "azulejo", valid: false, },
			        ],
			    }
			},

            // Scene 6
		    {
		        engine: "sm.DragEngine",
		        imageSectionKey: "scene6",
		        cfg:
		        {
		            backgroundImage: { id: "fondo", x: -5, y: 72 },
		            buttonRepeat: { x: 28, y: 320, width: 100, textId: cadenas.empty },
		            enunciado: cadenas.enunciado6,
		            audioEnunciado: audios.enunciado6,
		            audioOK: audios.fxok,
		            audioKO: audios.fxko,
		            audioClic: audios.sinAudio,
		            audioFinal: audios.fxtada,
		            hotAreas: [
		                {
		                    name: "hotArea3",
		                    points: [{ x: 690, y: 93 }, { x: 940, y: 94 }, { x: 936, y: 350 }, { x: 689, y: 349 },],
		                    hotAreaVisible: false,
		                },
		                {
		                    name: "hotArea2",
		                    points: [{ x: 381, y: 98 }, { x: 631, y: 99 }, { x: 627, y: 355 }, { x: 380, y: 354 },],
		                    hotAreaVisible: false,
		                },
		                {
		                    name: "hotArea1",
		                    points: [{ x: 58, y: 96 }, { x: 308, y: 97 }, { x: 304, y: 353 }, { x: 57, y: 352 },],
		                    hotAreaVisible: false,
		                },
		            ],
		            dragObjects: [
		                { x: 259, y: 454, id: "sandia", clonable: false, hotAreas: [{ hotArea: "hotArea1", esAreaValida: true, dropZones: [{ x: 113, y: 176 }] },], dropImage: [{ id: "sandia", x: 113, y: 176 },] },
		                { x: 557, y: 452, id: "piza", clonable: false, hotAreas: [{ hotArea: "hotArea1", esAreaValida: true, dropZones: [{ x: 175, y: 164 }] },], dropImage: [{ id: "piza", x: 175, y: 164 },] },
		                { x: 468, y: 455, id: "moneda", clonable: false, hotAreas: [{ hotArea: "hotArea2", esAreaValida: true, dropZones: [{ x: 472, y: 153 }] },], dropImage: [{ id: "moneda", x: 472, y: 153 },] },
		                { x: 736, y: 454, id: "galletaR", clonable: false, hotAreas: [{ hotArea: "hotArea2", esAreaValida: true, dropZones: [{ x: 441, y: 219 }] },], dropImage: [{ id: "galletaR", x: 441, y: 219 },] },
		                { x: 369, y: 452, id: "galletaC", clonable: false, hotAreas: [{ hotArea: "hotArea3", esAreaValida: true, dropZones: [{ x: 781, y: 155 }] },], dropImage: [{ id: "galletaC", x: 781, y: 155 },] },
		                { x: 642, y: 456, id: "choco", clonable: false, hotAreas: [{ hotArea: "hotArea3", esAreaValida: true, dropZones: [{ x: 768, y: 225 }] },], dropImage: [{ id: "choco", x: 768, y: 225 },] },
		            ],
		            successes: 6,
		        }
		    },

            // Scene 7
		    {
		        engine: "sm.DragEngine",
		        imageSectionKey: "scene7",
		        cfg:
		        {
		            backgroundImage: { id: "fondo", x: -2, y: 71 },
		            buttonRepeat: { x: 28, y: 320, width: 100, textId: cadenas.empty },
		            enunciado: cadenas.enunciado7,
		            audioEnunciado: audios.enunciado7,
		            audioOK: audios.fxok,
		            audioKO: audios.fxko,
		            audioClic: audios.sinAudio,
		            audioFinal: audios.fxtada,
		            hotAreas: [
		                {
		                    name: "hotArea3",
		                    points: [{ x: 657, y: 348 }, { x: 793, y: 358 }, { x: 919, y: 346 }, { x: 915, y: 153 }, { x: 791, y: 137 }, { x: 648, y: 162 },],
		                    hotAreaVisible: false,
		                    successes: 3,
		                },
		                {
		                    name: "hotArea2",
		                    points: [{ x: 346, y: 349 }, { x: 455, y: 363 }, { x: 600, y: 357 }, { x: 608, y: 160 }, { x: 468, y: 132 }, { x: 321, y: 157 },],
		                    hotAreaVisible: false,
		                    successes: 1,
		                },
		                {
		                    name: "hotArea1",
		                    points: [{ x: 32, y: 348 }, { x: 179, y: 361 }, { x: 292, y: 348 }, { x: 298, y: 143 }, { x: 167, y: 133 }, { x: 19, y: 155 },],
		                    hotAreaVisible: false,
		                    successes: 2,
		                },
		            ],
		            dragObjects: [
		                { x: 731, y: 454, id: "tomate", clonable: false, hotAreas: [{ hotArea: "hotArea1", esAreaValida: true, dropZones: [{ x: 225, y: 263 }] }, { hotArea: "hotArea2", esAreaValida: true, dropZones: [{ x: 491, y: 266 }] }, { hotArea: "hotArea3", esAreaValida: true, dropZones: [{ x: 853, y: 263 }] },], dropImage: [{ id: "tomate6", x: 225, y: 263 }, { id: "tomate6", x: 491, y: 266 }, { id: "tomate6", x: 853, y: 263 },] },
		                { x: 446, y: 454, id: "tomate", clonable: false, hotAreas: [{ hotArea: "hotArea1", esAreaValida: true, dropZones: [{ x: 186, y: 268 }] }, { hotArea: "hotArea2", esAreaValida: true, dropZones: [{ x: 521, y: 267 }] }, { hotArea: "hotArea3", esAreaValida: true, dropZones: [{ x: 816, y: 267 }] },], dropImage: [{ id: "tomate5Ok", x: 186, y: 268 }, { id: "tomate5Ok", x: 521, y: 267 }, { id: "tomate5Ok", x: 816, y: 267 },] },
		                { x: 636, y: 454, id: "tomate", clonable: false, hotAreas: [{ hotArea: "hotArea1", esAreaValida: true, dropZones: [{ x: 162, y: 259 }] }, { hotArea: "hotArea2", esAreaValida: true, dropZones: [{ x: 475, y: 259 }] }, { hotArea: "hotArea3", esAreaValida: true, dropZones: [{ x: 787, y: 259 }] },], dropImage: [{ id: "tomate4Ok", x: 162, y: 259 }, { id: "tomate4Ok", x: 475, y: 259 }, { id: "tomate4Ok", x: 787, y: 259 },] },
		                { x: 541, y: 453, id: "tomate", clonable: false, hotAreas: [{ hotArea: "hotArea1", esAreaValida: true, dropZones: [{ x: 134, y: 266 }] }, { hotArea: "hotArea2", esAreaValida: true, dropZones: [{ x: 390, y: 263 }] }, { hotArea: "hotArea3", esAreaValida: true, dropZones: [{ x: 751, y: 266 }] },], dropImage: [{ id: "tomate3Ok", x: 134, y: 266 }, { id: "tomate3Ok", x: 390, y: 263 }, { id: "tomate3Ok", x: 751, y: 266 },] },
		                { x: 352, y: 454, id: "tomate", clonable: false, hotAreas: [{ hotArea: "hotArea1", esAreaValida: true, dropZones: [{ x: 79, y: 260 }] }, { hotArea: "hotArea2", esAreaValida: true, dropZones: [{ x: 418, y: 261 }] }, { hotArea: "hotArea3", esAreaValida: true, dropZones: [{ x: 715, y: 262 }] },], dropImage: [{ id: "tomate2OK", x: 79, y: 260 }, { id: "tomate2OK", x: 418, y: 261 }, { id: "tomate2OK", x: 715, y: 262 },] },
		                { x: 259, y: 454, id: "tomate", clonable: false, hotAreas: [{ hotArea: "hotArea1", esAreaValida: true, dropZones: [{ x: 106, y: 267 }] }, { hotArea: "hotArea2", esAreaValida: true, dropZones: [{ x: 362, y: 263 }] }, { hotArea: "hotArea3", esAreaValida: true, dropZones: [{ x: 681, y: 263 }] },], dropImage: [{ id: "tomate1OK", x: 106, y: 267 }, { id: "tomate1OK", x: 362, y: 263 }, { id: "tomate1OK", x: 681, y: 263 },] },
		            ],
		            successes: 6,
		        }
		    },

            // Scene 8
			{
			    engine: "sm.SelectEngine",
			    imageSectionKey: "scene8",
			    cfg:
			    {
			        backgroundImage: { id: "fondo", x: -2, y: 54 },
			        buttonRepeat: { x: 28, y: 429, width: 100, textId: cadenas.empty },
			        enunciado: cadenas.enunciado8,
			        audioEnunciado: audios.enunciado8,
			        audioOK: audios.fxok,
			        audioKO: audios.fxko,
			        audioClic: audios.sinAudio,
			        audioFinal: audios.fxtada,
			        successes: 2,
			        groups: [
			        ],
			        imageObjects: [
			            { id: "pimiento4", x: 582, y: 330, imageId: "pimiento4", valid: true, imagen_dragdrop: "pimiento4ok", imagen_dragdropX: 579, imagen_dragdropY: 327, },
			            { id: "pimiento3", x: 557, y: 120, imageId: "pimiento3", valid: false, },
			            { id: "pimiento2", x: 89, y: 335, imageId: "pimiento2", valid: true, imagen_dragdrop: "pimiento2Ok", imagen_dragdropX: 86, imagen_dragdropY: 332, },
			            { id: "pimiento1", x: 63, y: 136, imageId: "pimiento1", valid: false, },
			        ],
			    }
			},

            // Scene 9
			{
			    engine: "sm.SelectEngine",
			    imageSectionKey: "scene9",
			    cfg:
			    {
			        backgroundImage: { id: "fondo", x: -2, y: 54 },
			        buttonRepeat: { x: 28, y: 429, width: 100, textId: cadenas.empty },
			        enunciado: cadenas.enunciado9,
			        audioEnunciado: audios.enunciado9,
			        audioOK: audios.fxok,
			        audioKO: audios.fxko,
			        audioClic: audios.sinAudio,
			        audioFinal: audios.fxtada,
			        successes: 2,
			        groups: [
			        ],
			        imageObjects: [
			            { id: "zanahoria4", x: 543, y: 352, imageId: "zanahoria4", valid: true, imagen_dragdrop: "zanahoria4Ok", imagen_dragdropX: 539, imagen_dragdropY: 350, },
			            { id: "zanahoria3", x: 577, y: 162, imageId: "zanahoria3", valid: false, },
			            { id: "zanahoria2", x: 88, y: 354, imageId: "zanahoria2", valid: false, },
			            { id: "zanahoria1", x: 51, y: 139, imageId: "zanahoria1", valid: true, imagen_dragdrop: "zanahoria1Ok", imagen_dragdropX: 48, imagen_dragdropY: 137, },
			        ],
			    }
			},

            //Scene 10
            {
                engine: "sm.DrawingEngine",
                imageSectionKey: "scene10",
                cfg:
				{
				    drawingEngine: { gameType: "fillImageType" },
				    evalFeedback: true,
				    backgroundImage: { id: "", x: -5, y: 65 },
				    paletteCfg: { imageIdPalette: "paleta", drawPaletteShape: false, backgroundColor: "#D7D7D7", backgroundTransparency: 1.0, contourColor: "#999999", contourSelectedColor: "#000000", paletteX: 711, paletteY: 106, paletteColumns: 1, colorElementSize: 48, colorSpace: 7, colors: [{ rgb: "#FF0000", imageId: "rojo", posX: 25, posY: 235, round: 8 }, { rgb: "#007EFF", imageId: "azul", posX: 91, posY: 131, round: 8 }, { rgb: "#FFEA00", imageId: "amarillo", posX: 19, posY: 17, round: 8 }] },
				    enunciado: cadenas.enunciado10,
				    audioEnunciado: audios.enunciado10,
				    audioOK: audios.fxok,
				    audioKO: audios.fxko,
				    audioClic: audios.fxclic,
				    audioFinal: audios.fxtada,
				    imageObjects: [{ x: 26, y: 242, imageId: "gusano", allowedColors: null, hitable: true }, { x: 525, y: 321, imageId: "gusanoCabeza", allowedColors: null, hitable: false }, { x: 58, y: 389, imageId: "gusano", allowedColors: null, hitable: false }, { x: 218, y: 398, imageId: "gusano", allowedColors: null, hitable: false }, { x: 138, y: 392, imageId: "gusano", allowedColors: null, hitable: false }, { x: 298, y: 399, imageId: "gusano", allowedColors: null, hitable: false }, { x: 378, y: 399, imageId: "gusano", allowedColors: null, hitable: false }, { x: 457, y: 393, imageId: "gusano", allowedColors: null, hitable: false }, { x: 559, y: 105, imageId: "gusanoCabeza", allowedColors: null, hitable: true }, { x: 94, y: 200, imageId: "gusano", allowedColors: null, hitable: true }, { x: 158, y: 152, imageId: "gusano", allowedColors: null, hitable: true }, { x: 223, y: 105, imageId: "gusano", allowedColors: null, hitable: true }, { x: 300, y: 128, imageId: "gusano", allowedColors: null, hitable: true }, { x: 364, y: 177, imageId: "gusano", allowedColors: null, hitable: true }, { x: 433, y: 218, imageId: "gusano", allowedColors: null, hitable: true }, { x: 510, y: 198, imageId: "gusano", allowedColors: null, hitable: true }, ],
				    buttonEnd: { x: 400, y: 400, width: 100, textId: cadenas.empty },
				    buttonRepeat: { x: 510, y: 400, width: 100, textId: cadenas.empty },
				}
            },

            // Scene 11
            {
                engine: "sm.SelectEngine",
                imageSectionKey: "scene11",
                cfg:
                {
                    backgroundImage: { id: "", x: -2, y: 54 },
                    buttonRepeat: { x: 28, y: 429, width: 100, textId: cadenas.empty },
                    enunciado: cadenas.enunciado11,
                    audioEnunciado: audios.enunciado11,
                    audioOK: audios.fxok,
                    audioKO: audios.fxko,
                    audioClic: audios.sinAudio,
                    audioFinal: audios.fxtada,
                    successes: 3,
                    groups: [
                    ],
                    imageObjects: [
                        { id: "tomatera3", x: 693, y: 197, imageId: "tomatera3", valid: true, imagen_dragdrop: "tomatera3Ok", imagen_dragdropX: 690, imagen_dragdropY: 194, },
                        { id: "tomatera3", x: 394, y: 71, imageId: "tomatera3", valid: true, imagen_dragdrop: "tomatera3Ok", imagen_dragdropX: 391, imagen_dragdropY: 68, },
                        { id: "tomatera4", x: 24, y: 245, imageId: "tomatera4", valid: false, },
                        { id: "tomatera3", x: 155, y: 71, imageId: "tomatera3", valid: true, imagen_dragdrop: "tomatera3Ok", imagen_dragdropX: 152, imagen_dragdropY: 68, },
                        { id: "tomatera2", x: 530, y: 239, imageId: "tomatera2", valid: false, },
                        { id: "tomatera1", x: 816, y: 73, imageId: "tomatera1", valid: false, },
                        { id: "tomatera0", x: 280, y: 202, imageId: "tomatera0", valid: false, },
                    ],
                }
            },

            // Scene 12
            {
                engine: "sm.DrawingEngine",
                imageSectionKey: "scene12",
                cfg:
				{
				    drawingEngine: { gameType: "fillImageType" },
				    evalFeedback: true,
				    backgroundImage: { id: "", x: -5, y: 65 },
				    paletteCfg: { imageIdPalette: "paleta", drawPaletteShape: false, backgroundColor: "#D7D7D7", backgroundTransparency: 1.0, contourColor: "#999999", contourSelectedColor: "#000000", paletteX: 803, paletteY: 86, paletteColumns: 1, colorElementSize: 48, colorSpace: 7, colors: [{ rgb: "#FFF000", imageId: "amarillo", posX: 34, posY: 295, round: 8 }, { rgb: "#FF0012", imageId: "rojo", posX: 39, posY: 168, round: 8 }, { rgb: "#0054FF", imageId: "azul", posX: 42, posY: 41, round: 8 }] },
				    enunciado: cadenas.enunciado12,
				    audioEnunciado: audios.enunciado12,
				    audioOK: audios.fxok,
				    audioKO: audios.fxko,
				    audioClic: audios.fxclic,
				    audioFinal: audios.fxtada,
				    imageObjects: [{ x: 56, y: 246, imageId: "humo", allowedColors: null, hitable: false }, { x: 466, y: 375, imageId: "circulo", allowedColors: ["#0054FF"], hitable: true }, { x: 619, y: 375, imageId: "circulo", allowedColors: ["#0054FF"], hitable: true }, { x: 248, y: 284, imageId: "triangulo", allowedColors: ["#FFF000"], hitable: true }, { x: 531, y: 217, imageId: "cuadrado2", allowedColors: ["#FF0012"], hitable: true }, { x: 305, y: 149, imageId: "cuadrado1", allowedColors: ["#FF0012"], hitable: true }, { x: 327, y: 375, imageId: "circulo", allowedColors: ["#0054FF"], hitable: true }, ],
				    buttonEnd: { x: 400, y: 400, width: 100, textId: cadenas.empty },
				    buttonRepeat: { x: 510, y: 400, width: 100, textId: cadenas.empty },
				}
            },

            // Scene 13
            {
                engine: "sm.DragEngine",
                imageSectionKey: "scene13",
                cfg:
                {
                    backgroundImage: { id: "fondo", x: 1, y: 64 },
                    buttonRepeat: { x: 28, y: 320, width: 100, textId: cadenas.empty },
                    enunciado: cadenas.enunciado13,
                    audioEnunciado: audios.enunciado13,
                    audioOK: audios.fxok,
                    audioKO: audios.fxko,
                    audioClic: audios.sinAudio,
                    audioFinal: audios.fxtada,
                    hotAreas: [
                        {
                            name: "hotArea0",
                            points: [{ x: 786, y: 117 }, { x: 943, y: 117 }, { x: 946, y: 246 }, { x: 788, y: 249 },],
                            hotAreaVisible: false,
                        },
                    ],
                    dragObjects: [
                        { x: 507, y: 404, id: "azul", clonable: false, hotAreas: [{ hotArea: "hotArea0", esAreaValida: true, dropZones: [{ x: 815, y: 123 }] },], dropImage: [{ id: "azul", x: 815, y: 123 },] },
                        { x: 668, y: 406, id: "rojo", clonable: false, hotAreas: [], dropImage: [] },
                        { x: 340, y: 401, id: "amarillo", clonable: false, hotAreas: [], dropImage: [] },
                    ],
                    successes: 1,
                }
            },

            // Scene 14
            {
                engine: "sm.SelectEngine",
                imageSectionKey: "scene14",
                cfg:
		        {
		            backgroundImage: { id: "fondo", x: 0, y: 65 },
		            buttonRepeat: { x: 28, y: 429, width: 100, textId: cadenas.empty },
		            enunciado: cadenas.enunciado14,
		            audioEnunciado: audios.enunciado14,
		            audioOK: audios.fxok,
		            audioKO: audios.fxko,
		            audioClic: audios.sinAudio,
		            audioFinal: audios.fxtada,
		            successes: 1,
		            groups: [
		            ],
		            imageObjects: [
                        { id: "medio", x: 15, y: 267, imageId: "medio", valid: false, },
                        { id: "medio", x: 739, y: 267, imageId: "medio", valid: false, },
                        { id: "medio", x: 180, y: 75, imageId: "medio", valid: false, },
                        { id: "vacio", x: 364, y: 268, imageId: "vacio", valid: false, },
                        { id: "lleno", x: 545, y: 78, imageId: "lleno", valid: true, imagen_dragdrop: "llenoOk", imagen_dragdropX: 542, imagen_dragdropY: 75, },
		            ],
		        }
            },

            // Scene 15
            {
                engine: "sm.SelectEngine",
                imageSectionKey: "scene15",
                cfg:
		        {
		            backgroundImage: { id: "fondo", x: 0, y: 65 },
		            buttonRepeat: { x: 28, y: 429, width: 100, textId: cadenas.empty },
		            enunciado: cadenas.enunciado15,
		            audioEnunciado: audios.enunciado15,
		            audioOK: audios.fxok,
		            audioKO: audios.fxko,
		            audioClic: audios.sinAudio,
		            audioFinal: audios.fxtada,
		            successes: 1,
		            groups: [
		            ],
		            imageObjects: [
                        { id: "medio", x: 20, y: 277, imageId: "medio", valid: false, },
                        { id: "medio", x: 738, y: 278, imageId: "medio", valid: false, },
                        { id: "medio", x: 180, y: 75, imageId: "medio", valid: false, },
                        { id: "vacio", x: 364, y: 268, imageId: "vacio", valid: true, imagen_dragdrop: "vacioOK", imagen_dragdropX: 361, imagen_dragdropY: 265, },
                        { id: "lleno", x: 545, y: 78, imageId: "lleno", valid: false, },
		            ],
		        }
            }
		],
        animation: { confettiColors: [["#FF0054", "#E500FF"], ["#00FF00", "#0000FF"], ["#00FFFF", "#FF0000"], ["#FFFF00", "#B06C00"]], backgroundColor: "Black", backgroundOpacity: 0.1, confettiRibbonCount: 7, confettiPaperCount: 100, pauseToEnd: 1500, soundId: audios.fxaplausos }
    };
    var animation = new sm.ConfettiAnimation(cfg);
    var multiPlayerEngine = new sm.MultiPlayerEngine("html5Canvas", cfg, animation);
	multiPlayerEngine.run();
});
