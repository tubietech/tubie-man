////////////////////////////////////////////////////
// In-Game Menu
let inGameMenuBtnX, inGameMenuBtnY;

const inGameMenuBtnDimensions = {
    width: tileSize * 6,
    height: tileSize * 3
}

const setInGameMenuBtnPosition = () => {
    inGameMenuBtnX = getIsWidescreen() ? (mapCols - 3) * tileSize - inGameMenuBtnDimensions.width / 2 : mapWidth / 2 - inGameMenuBtnDimensions.width / 2;
    inGameMenuBtnY = getIsWidescreen() ? (tileSize * 0.25) : mapHeight;
}

const getInGameMenuBtn = (handler) => {
    const btn = new Button(inGameMenuBtnX, inGameMenuBtnY, inGameMenuBtnDimensions.width, inGameMenuBtnDimensions.height, handler);
    btn.setText("MENU");
    btn.setFont(tileSize + "px 'Press Start 2P'","#FFF");
    
    return btn;
}

const buildInGameMenu = function() {
    let menu;
    const showMainMenu = () => menu.enable();
    const hideMainMenu = () => menu.disable();

    // confirms a menu action
    var confirmMenu = new Menu("QUESTION?",2*tileSize,5*tileSize,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px 'Press Start 2P'", "#EEE");
    confirmMenu.addTextButton("YES", function() {
        confirmMenu.disable();
        confirmMenu.onConfirm();
    });
    confirmMenu.addTextButton("NO", function() {
        confirmMenu.disable();
        showMainMenu(menu);
    });
    confirmMenu.addTextButton("CANCEL", function() {
        confirmMenu.disable();
        showMainMenu(menu);
    });
    confirmMenu.backButton = confirmMenu.buttons[confirmMenu.buttonCount-1];

    var showConfirm = function(title,onConfirm) {
        hideMainMenu();
        confirmMenu.title = title;
        confirmMenu.onConfirm = onConfirm;
        confirmMenu.enable();
    };

    // regular menu
    menu = new Menu("PAUSED", 2 * tileSize, 5 * tileSize, mapWidth - 4 * tileSize, 3 * tileSize, tileSize, tileSize + "px 'Press Start 2P'", "#EEE");
    menu.addTextButton("RESUME", function() {
        menu.disable();
    });
    menu.addTextButton("QUIT", function() {
        showConfirm("QUIT GAME?", function() {
            switchState(preNewGameState, 60);
        });
    });
    menu.backButton = menu.buttons[0];

    setInGameMenuBtnPosition();
    const btn = getInGameMenuBtn(showMainMenu);

    var menus = [menu, confirmMenu];
    var getVisibleMenu = function() {
        var len = menus.length;
        var i;
        var m;
        for (i=0; i<len; i++) {
            m = menus[i];
            if (m.isEnabled()) {
                return m;
            }
        }
    };

    return {
        onHudEnable: function() {
            btn.enable();
        },
        onHudDisable: function() {
            btn.disable();
        },
        update: function() {
            if (btn.isEnabled) {
                btn.update();
            }
        },
        draw: (ctx) => {
            var m = getVisibleMenu();
            if (m) {
                ctx.fillStyle = "rgba(0,0,0,0.8)";
                ctx.fillRect(-mapPadX - 5, -mapPadY - 5, mapWidth + 5 ,mapHeight + 5);
                m.setSize(2 * tileSize, 5 * tileSize, mapWidth - 4 * tileSize, 3 * tileSize);
                m.draw(ctx);
            }
            else {
                setInGameMenuBtnPosition();
                btn.setPosition(inGameMenuBtnX, inGameMenuBtnY); 
                btn.draw(ctx);
            }
        },
        isOpen: () => getVisibleMenu() != undefined,
        getMenu: () => getVisibleMenu(),
        getMenuButton: () => btn
    };
}

const inGameMenu = buildInGameMenu();