// Accept input from Keyboard, Touch and Game Controller and combine into a unified list of inputs

// The input handling seems over-complicated (and probably is a bit), but the goal of this implementation
// was to de-couple the way that an 'Action' is generated from the underlying representation of the
// Action and it's execution.

// Each entry in the map 'Actions' represents a single 'Action' that can be taken. Actions are
// usually context specific (e.g. the UP action is used for player movement, whereas the MENU_UP action
// is used for menu navigation)
// An action should be named based on what happens, not what the input method was.

// Values in InputSources describe/are linked to the physical method that was used to generate the input.
// The same Action may be tied to different 'Input Sources', and may be handled the same or different.

// An Input is the combination of an 'Action', InputSource and other attributes that provide context
// To the input. (See the class for an in-depth description of each attribute).

// The InputQueue class should have 1 global instance typically. This class serves 2 purposes.
// 1. To 'queue' up non-instantaneous inputs. This is usefull as it allows for multiple
// Inputs occur at the same time, and then when one falls off the other takes the formers place
// as the active inpupt. This queue was implemented because of an issue using 8-way controllers
// with just the 'keydown' action.

// An 8-way joystick allows for 2 directions to be active by the same time (e.g. if you picture the 
// joystick as a compass with UP being North and LEFT being West, the direction NW is a combination of
// bot the UP and LEFT keys/inputs being triggered at the same time)

// The issues was when moving the joystick from the N to NW directions, the 'UP' action would be lost
// when the 'LEFT' action was issued. If the player then moved the stick from NW to N without re-centering,
// no additonal keydown event would be triggered as N/UP was down the entire time. This would cause the
// Player sprite to continue to move to the LEFT/W until the joystick was re-centered.
// 
// Another benefit of the input-queue system is that it allows for 'sticky' inputs, which is an input
// that occurs 1 time and stops, but the action associated with the input continues to occurr until a
// clear command is issued, or another input is created.

const InputSources = Object.freeze({
    _typeName: "InputSources", // Used to identify the object 'type' at runtime. Used for typechecking params
    KEYBOARD: "keyboard",
    SWIPE: "swipe",
    GAMEPAD: "controller"
});

const Actions = Object.freeze({
    _typeName: "Actions", // Used to identify the object 'type' at runtime. Used for typechecking params
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right",
    ENTER : "enter",
    EXIT: "exit",
    MENU_UP: "menuUp",
    MENU_DOWN: "menuDown",
    MENU_LEFT: "menuLeft",
    MENU_RIGHT: "menuRight",
    MENU_OPEN: "menuOpen",
    PAUSE: "pause",
    CHEAT: "cheat",
    UNUSED: "unused",
    TOGGLE_MUTE: "toggleMute",
    VOLUME_UP: "volumeUp",
    VOLUME_DOWN: "volumeDown"
});

const Keys = Object.freeze({
    _typeName: "Keys", // Used to identify the object 'type' at runtime. Used for typechecking params
    ENTER: "Enter",
    ESC: "Escape",
    END: "End",

    LEFT: "ArrowLeft",
    RIGHT: "ArrowRight",
    UP: "ArrowUp",
    DOWN: "ArrowDown",

    SHIFT: "ShiftLeft",
    CTRL: "ControlLeft",
    ALT: "AltLeft",
    SPACE: "Space",

    W:  "KeyW",
    A:  "KeyA",
    S:  "KeyS",
    D:  "KeyD",

    // A: "KeyA",
    B: "KeyB",
    C: "KeyC",
    // D: "KeyD",
    E: "KeyE",
    F: "KeyF",
    G: "KeyG",
    H: "KeyH",
    I: "KeyI",
    J: "KeyJ",
    K: "KeyK",
    L: "KeyL",
    M: "KeyM",
    N: "KeyN",
    O: "KeyO",
    P: "KeyP",
    Q: "KeyQ",
    R: "KeyR",
    //S: "KeyS",
    T: "KeyT",
    U: "KeyU",
    V: "KeyV",
    //W: "KeyW",
    X: "KeyX",
    Y: "KeyY",
    Z: "KeyZ",

    0: "Digit0",
    1: "Digit1",
    2: "Digit2",
    3: "Digit3",
    4: "Digit4",
    5: "Digit5",
    6: "Digit6",
    7: "Digit7",
    8: "Digit8",
    9: "Digit9",

    NUM_0: "Numpad0",
    NUM_1: "Numpad1",
    NUM_2: "Numpad2",
    NUM_3: "Numpad3", 
    NUM_4: "Numpad4",
    NUM_5: "Numpad5",
    NUM_6: "Numpad6",
    NUM_7: "Numpad7",
    NUM_8: "Numpad8",
    NUM_9: "Numpad9",
    NUM_ENTER: "NumpadEnter",
    NUM_ADD: "NumpadAdd",
    NUM_SUBTRACT: "NumpadSubtract",

    //Gamepad 'Left' Joystick
    JOYSTICK_RIGHT: "JoystickRight",
    JOYSTICK_LEFT: "JoystickLeft",
    JOYSTICK_UP: "JoystickUp",
    JOYSTICK_DOWN: "JoystickDown",

    // Gamepad Buttons
    GAMEPAD_0: "GamepadButton0",
    GAMEPAD_1: "GamepadButton1",
    GAMEPAD_2: "GamepadButton2",
    GAMEPAD_3: "GamepadButton3",
    GAMEPAD_4: "GamepadButton4",
    GAMEPAD_5: "GamepadButton5",
    GAMEPAD_6: "GamepadButton6",
    GAMEPAD_7: "GamepadButton7",
    GAMEPAD_8: "GamepadButton8",
    GAMEPAD_9: "GamepadButton9",
    GAMEPAD_10: "GamepadButton10",
    GAMEPAD_11: "GamepadButton11",
    GAMEPAD_12: "GamepadButton12",
});

// Maps Keys to Input Types
const KeyInputMap = {};

// Map of Active Gamepads. Maps their ID to the GamePad object
const gamepads = {};

// Immutable representation of an input
class Input {
    #source;  // Source of the input. Must be one of InputSources
    #action; // Action to be taken
    #isVolatile; // Volatility means that an Input will be removed from the queue whenever a new Input is added. The input will continue to move up the queue if previous inputs are dequeued. Volatility can be used to handle InputSources that do not have an exit or cancel event (like swipes, as opposed to 'keyreleased' or 'buttonUp' events for keyboards and controllers respectivley)
    #isInstantaneous; // If an Input is instantaneous, then it will not be added to the input queue, and only used to process the instant it occurrs. Instantaneous events will still be saved to the recent history of the queue.
    #conditionFunc; // This is a function that when called evaluates to a boolean, which determines if the input handler should be run.

    constructor(action, source, isVolatile, isInstantaneous, conditionFunc) {
        // validate params
        !Input.#isValidInstanceOfType(Actions, action)
        !Input.#isValidInstanceOfType(InputSources, source)
        if(typeof isVolatile !== "boolean")
            throw new Error(`Value ${isVolatile} of parameter 'isVolatile must be a boolean`);
        if(typeof isInstantaneous !== "boolean")
            throw new Error(`Value ${isInstantaneous} of parameter 'isInstantaneous must be a boolean`);
        if(!(conditionFunc === null || conditionFunc === undefined) && typeof conditionFunc !== "function")
            throw new Error("If a value is provided for conditionFunc, it myst be of type 'function'");

        this.#action = action;
        this.#source = source;
        this.#isVolatile = isVolatile;
        this.#isInstantaneous = isInstantaneous;
        this.#conditionFunc = conditionFunc;
    }

    static #isValidInstanceOfType (type, instance) {
        if (!Object.values(type).includes(instance))
            throw new Error(`Value ${instance} does not exist in type ${type._typeName}`);
    }

    getSoruce() {
        return this.#source;
    }

    getAction() {
        return this.#action;
    }

    evaluateCondition() {
        // Always execute if no condition was provied
        return typeof this.#conditionFunc === "function" ? this.#conditionFunc() : true;
    }

    isVolatile() {
        return this.#isVolatile;
    }

    isInstantaneous() {
        return this.#isInstantaneous;
    }

    getHash() {
        const input = `${this.#source}|${this.#isVolatile}|${this.#action}|${this.#isInstantaneous}`;

        // Simple, non-cryptographic
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
          hash = (hash << 5) - hash + input.charCodeAt(i);
          hash |= 0; // Convert to 32bit integer
        }

        return hash;
    }

    isEqual(input) {
        return this.getHash() === input.getHash();
    }

    serialize(toString) {
        if(!(toString === null || toString === undefined) && typeof toString !== "boolean")
            throw new Error("toString must be a boolean when provided to the method Input.serialize");

        const json = {
            "hash": this.getHash(),
            "action": this.#action,
            "source": this.#source,
            "isVolatile": this.#isVolatile,
            "isInstantaneous": this.#isInstantaneous,
            "hasConditionFunc": typeof this.#conditionFunc === "function",
        };

        return toString ? JSON.stringify(json, null, 2) : json;
    }
}

class InputQueue {
    #queue = [];
    #recentHistory = [];
    #instantaneousInputHandlers = {};

    historyRetentionSize = 10;

    constructor(){}

    set historyRetentionSize(size) {
        if(typeof size != "number" || size < 0)
            throw new Error("A number must be used when setting the historyRetentionSize of an InputQueue");

        this.historyRetentionSize = size;

        if(this.#recentHistory.length > this.historyRetentionSize)
            this.#trimHistory();
    }

    #trimHistory() {
        this.#recentHistory = this.#recentHistory.slice(this.#recentHistory.length - this.historyRetentionSize)
    }

    #updateHistory(input) {
        this.#recentHistory.push(input);
        this.#trimHistory();
    }

    #removeExistingInputInstances(input) {
        this.#queue = this.#queue.filter((element) => !input.isEqual(element))
    }

    #removeVolatileInputs() {
        this.#queue = this.#queue.filter((input) => !input.isVolatile());
    }

    #checkParamIsInput(name, param) {
        if(! (param instanceof Input))
            throw new Error(`Parameter ${name} is not an instance the class Input`);
    }

    addInstantaneousInputHandler(input, handler) {
        this.#checkParamIsInput("input", input);

        if(typeof handler !== "function")
            throw new Error("handler must be a function");

        this.#instantaneousInputHandlers[input.getHash()] = handler;
    }

    handleInstaneousInput(input, handlerParams) {
        this.#checkParamIsInput("input", input);

        if(input.isInstantaneous() === false)
            throw new Error("Only instaneous inputs may be passed to this function");

        const res = input.evaluateCondition();
        if(res) {
            const inputHash = input.getHash();
        
            if(this.#instantaneousInputHandlers.hasOwnProperty(inputHash))
                this.#instantaneousInputHandlers[inputHash](handlerParams);
            else
                console.log(`A handler does not exist for the input ${input.getValue()} with hash ${inputHash}`);            
        }
        return res !== undefined && res !== false && res !== null;
    }

    removeInstantaneousInputHandler(input) {
        this.#checkParamIsInput("input", input);

        delete this.#instantaneousInputHandlers[input.getHash()];
    }

    enqueue(input) {
        this.#checkParamIsInput("input", input);
    
        // TODO: Test functionality of removing volatile inputs when enquing instantaneous ones. We may want to only remove volatile for non-instantaneous inptus
        this.#removeVolatileInputs();
        this.#removeExistingInputInstances(input);

        let wasHandled = false;
        if(input.isInstantaneous())
            wasHandled = this.handleInstaneousInput(input);
        else
            this.#queue.push(input);

        this.#updateHistory(input);   
        return wasHandled;     
    }

    dequeue(input) {
        this.#removeExistingInputInstances(input);
    }

    size() {
        return this.#queue.length
    }

    empty() {
        this.#queue.length = 0;
    }

    getQueueLength() {
        return this.#queue.length;
    }

    isEmpty() {
        return this.getQueueLength() <= 0;
    }

    getActiveInput() {
        return this.isEmpty() ? null : this.#queue[this.size() - 1];
    }

    // Returns a string representation of Inputs in the queue
    viewInputQueue(miniversion) {
        if(!(miniversion === null || miniversion === undefined) && typeof miniversion !== "boolean")
            throw new Error("When providing the miniversion param to InputQueue.viewInputQueue, it must be a boolean");

        if(typeof miniversion === "boolean" && miniversion) {
            return this.#queue.map((input) => {
                const inputJson = input.serialize();
                return `${inputJson.hash},${inputJson.action},${inputJson.source}`
        }).reduce((prev, current) => (prev === "" ? "" : "|") + current, "");
        } else {
            const result = this.#queue.map((input) => input.serialize()).reduce((acc, current) => {
                acc.push(current);
                return acc;
            }, []);
            return result;
        }
    }
}

// Queue of inputs. All entries must be an instance of the Input class
const inputQueue = new InputQueue();

// Follows the structure 
// {
// "KEY": [INPUT1, INPUT2 ]
// }
const keyInputMap = {};

const addKeyInputMapentry = (key, input) => {
    if(!keyInputMap.hasOwnProperty(key))
        keyInputMap[key] = [];
    keyInputMap[key].push(input);
}

(function(){
    var addKeyDownHandler = (key, inputType, isGamepadInput, isInstantaneous, handler, conditionFunc) => {
        if(!Object.values(Keys).includes(key))
            throw new Error(`Unable to add Keyhandler for the Key ${key}, as it does not exist in the Keys type`);
        if(!Object.values(Actions).includes(inputType))
            throw new Error(`Unable to add Keyhandler for the Key ${key}, as the inputType ${inputType} it does not exist in the Inputs type`);
        if(!(conditionFunc === null || conditionFunc === undefined) && !(typeof conditionFunc === "function"))
            throw new Error("If a condidionFunc is provided, it must be of type 'function'");

        const input = new Input(inputType, isGamepadInput ? InputSources.GAMEPAD : InputSources.KEYBOARD, false, isInstantaneous, conditionFunc);

        if(isInstantaneous && typeof handler === "function")
            inputQueue.addInstantaneousInputHandler(input, handler);

        addKeyInputMapentry(key, input);
    }

    // Add keypress listeners and connect to the inputQueue
    window.addEventListener("keydown", function(e) {        
        const keyCode = e.code;
        
        if(keyInputMap.hasOwnProperty(keyCode)) {
            const inputs = keyInputMap[keyCode];
            for(let inpt of inputs) {
                const res = inputQueue.enqueue(inpt);
                if(res === true)
                    break;
            };
        } else {
            console.log(`No input is mapped to the key ${keyCode}`);
        }
    });

    window.addEventListener("keyup",function(e) {
        var keyCode = e.code;
        if(keyInputMap.hasOwnProperty(keyCode)) {
            const inputs = keyInputMap[keyCode];
            inputs.forEach((input) => inputQueue.dequeue(input));
        }
    });

    // Menu Navigation Keys
    var _INPUT_menu;
    var _INPUT_state;
    
    var isInMenu = function() {
        _INPUT_menu = (state.getMenu && state.getMenu());
        if (!_INPUT_menu && inGameMenu.isOpen()) {
            _INPUT_menu = inGameMenu.getMenu();
        }
        
        return _INPUT_menu;
    };

    var isMenuKeysAllowed = function() {
        var menu = isInMenu();
        return menu && !menu.noArrowKeys;
    };

    var isInGameMenuButtonClickable = function() {
        return hud.isValidState() && !inGameMenu.isOpen();
    };

    //addKeyDownHandler(KEY, INPUT_TYPE, IS_INSTANTANEOUS, HANDLER, ?CONDITION_FUNC);

    // Global Keys
    addKeyDownHandler(Keys.M, Actions.TOGGLE_MUTE, false, true, function(){if(audio.isPlaying()) audio.toggleMute()}, () => true);
    addKeyDownHandler(Keys.NUM_ADD, Actions.VOLUME_UP, false, true, function(){if(audio.isPlaying()) audio.volumeUp()}, () => true);
    addKeyDownHandler(Keys.NUM_SUBTRACT, Actions.VOLUME_DOWN, false, true, function(){if(audio.isPlaying()) audio.volumeDown()}, () => true);
    
    addKeyDownHandler(Keys.GAMEPAD_3, Actions.TOGGLE_MUTE, true, true, function(){if(audio.isPlaying()) audio.toggleMute()}, () => true);
    addKeyDownHandler(Keys.GAMEPAD_7, Actions.VOLUME_UP, true, true, function(){if(audio.isPlaying()) audio.volumeUp()}, () => true);
    addKeyDownHandler(Keys.GAMEPAD_6, Actions.VOLUME_DOWN, true, true, function(){if(audio.isPlaying()) audio.volumeDown()}, () => true);

    // Menu Navigation & Interaction Keys
    addKeyDownHandler(Keys.ESC, Actions.EXIT, false, true, function(){_INPUT_menu.backButton ? _INPUT_menu.backButton.onclick():0; return true}, isInMenu);
    addKeyDownHandler(Keys.GAMEPAD_2, Actions.EXIT, true, true, function(){_INPUT_menu.backButton ? _INPUT_menu.backButton.onclick():0; return true}, isInMenu);
    
    addKeyDownHandler(Keys.ENTER, Actions.ENTER, false, true, function(){_INPUT_menu.clickCurrentOption()}, isInMenu);
    addKeyDownHandler(Keys.NUM_ENTER, Actions.ENTER, false, true, function(){_INPUT_menu.clickCurrentOption()}, isInMenu);
    addKeyDownHandler(Keys.GAMEPAD_5, Actions.ENTER, true, true, function(){_INPUT_menu.clickCurrentOption()}, isInMenu);
   
    addKeyDownHandler(Keys.UP, Actions.MENU_UP, false, true, function(){_INPUT_menu.selectPrevOption()}, isMenuKeysAllowed);
    addKeyDownHandler(Keys.DOWN, Actions.MENU_DOWN, false, true, function(){_INPUT_menu.selectNextOption()}, isMenuKeysAllowed);
    addKeyDownHandler(Keys.RIGHT, Actions.MENU_RIGHT, false, true, function(){_INPUT_menu.selectNextTitleOption()}, isMenuKeysAllowed);
    addKeyDownHandler(Keys.LEFT, Actions.MENU_LEFT, false, true, function(){_INPUT_menu.selectPrevTitleOption()}, isMenuKeysAllowed);
   
    addKeyDownHandler(Keys.W, Actions.MENU_UP, false, true, function(){_INPUT_menu.selectPrevOption()}, isMenuKeysAllowed);
    addKeyDownHandler(Keys.A, Actions.MENU_LEFT, false, true, function(){_INPUT_menu.selectPrevTitleOption()}, isMenuKeysAllowed);
    addKeyDownHandler(Keys.S, Actions.MENU_DOWN, false, true, function(){_INPUT_menu.selectNextOption()}, isMenuKeysAllowed);
    addKeyDownHandler(Keys.D, Actions.MENU_RIGHT, false, true, function(){_INPUT_menu.selectNextTitleOption()}, isMenuKeysAllowed);

    addKeyDownHandler(Keys.JOYSTICK_UP, Actions.MENU_UP, true, true, function(){_INPUT_menu.selectPrevOption()}, isMenuKeysAllowed);
    addKeyDownHandler(Keys.JOYSTICK_LEFT, Actions.MENU_LEFT, true, true, function(){_INPUT_menu.selectPrevTitleOption()}, isMenuKeysAllowed);
    addKeyDownHandler(Keys.JOYSTICK_DOWN, Actions.MENU_DOWN, true, true, function(){_INPUT_menu.selectNextOption()}, isMenuKeysAllowed);
    addKeyDownHandler(Keys.JOYSTICK_RIGHT, Actions.MENU_RIGHT, true, true, function(){_INPUT_menu.selectNextTitleOption()}, isMenuKeysAllowed);

    // Open In-Game Menu
    addKeyDownHandler(Keys.ESC, Actions.MENU_OPEN, false, true, function(){inGameMenu.getMenuButton().onclick(); return true}, isInGameMenuButtonClickable);
    addKeyDownHandler(Keys.SPACE, Actions.MENU_OPEN, false, true, function(){inGameMenu.getMenuButton().onclick(); return true}, isInGameMenuButtonClickable);
    addKeyDownHandler(Keys.GAMEPAD_2, Actions.MENU_OPEN, true, true, function(){inGameMenu.getMenuButton().onclick(); return true}, isInGameMenuButtonClickable);

    // Move Player
    var isPlayState = function() { return state == learnState || state == newGameState || state == playState || state == readyNewState || state == readyRestartState; };
   
    // Arrow Key Movement
    addKeyDownHandler(Keys.LEFT, Actions.LEFT,false, false, function(){player.setInputDir(DIR_LEFT)}, isPlayState);
    addKeyDownHandler(Keys.RIGHT, Actions.RIGHT, false, false, function(){player.setInputDir(DIR_RIGHT)}, isPlayState);
    addKeyDownHandler(Keys.UP, Actions.UP, false, false, function(){player.setInputDir(DIR_UP)}, isPlayState);
    addKeyDownHandler(Keys.DOWN, Actions.DOWN, false, false, function(){player.setInputDir(DIR_DOWN)}, isPlayState);

    // WASD Movement
    addKeyDownHandler(Keys.W, Actions.UP, false, false, function(){player.setInputDir(DIR_UP)}, isPlayState);
    addKeyDownHandler(Keys.A, Actions.LEFT, false, false, function(){player.setInputDir(DIR_LEFT)}, isPlayState);
    addKeyDownHandler(Keys.S, Actions.DOWN, false, false, function(){player.setInputDir(DIR_DOWN)}, isPlayState);
    addKeyDownHandler(Keys.D, Actions.RIGHT, false, false, function(){player.setInputDir(DIR_RIGHT)}, isPlayState);

    // Joystick Player Movement
    addKeyDownHandler(Keys.JOYSTICK_UP, Actions.UP, true, false, function(){player.setInputDir(DIR_UP)}, isPlayState);
    addKeyDownHandler(Keys.JOYSTICK_LEFT, Actions.LEFT, true, false, function(){player.setInputDir(DIR_LEFT)}, isPlayState);
    addKeyDownHandler(Keys.JOYSTICK_DOWN, Actions.DOWN, true, false, function(){player.setInputDir(DIR_DOWN)}, isPlayState);
    addKeyDownHandler(Keys.JOYSTICK_RIGHT, Actions.RIGHT, true, false, function(){player.setInputDir(DIR_RIGHT)}, isPlayState);
})();

var initSwipe = function() {

    // position of anchor
    var x = 0;
    var y = 0;

    // current distance from anchor
    var dx = 0;
    var dy = 0;

    // minimum distance from anchor before direction is registered
    var r = 4;
    
    var touchStart = function(event) {
        event.preventDefault();
        var fingerCount = event.touches.length;
        if (fingerCount == 1) {

            // commit new anchor
            x = event.touches[0].pageX;
            y = event.touches[0].pageY;

        }
        else {
            touchCancel(event);
        }
    };

    var touchMove = function(event) {
        event.preventDefault();
        var fingerCount = event.touches.length;
        if (fingerCount == 1) {

            // get current distance from anchor
            dx = event.touches[0].pageX - x;
            dy = event.touches[0].pageY - y;

            // if minimum move distance is reached
            if (dx*dx+dy*dy >= r*r) {

                // commit new anchor
                x += dx;
                y += dy;

                // register direction
                if (Math.abs(dx) >= Math.abs(dy)) {
                    const rightInput = new Input(Actions.RIGHT, InputSources.SWIPE, true, false);
                    const leftInput = new Input(Actions.LEFT, InputSources.SWIPE, true, false);

                    inputQueue.enqueue(dx > 0 ? rightInput : leftInput);
                }
                else {
                    const upInput = new Input(Actions.UP, InputSources.SWIPE, true, false);
                    const downInput = new Input(Actions.DOWN, InputSources.SWIPE, true, false);

                    inputQueue.enqueue(dy > 0 ? downInput : upInput);
                }
            }
        }
        else {
            touchCancel(event);
        }
    };

    var touchEnd = function(event) {
        event.preventDefault();
    };

    var touchCancel = function(event) {
        event.preventDefault();
        x=y=dx=dy=0;
    };

    var touchTap = function(event) {
        // tap to clear input directions
        player.clearInputDir(undefined);
    };
    
    // register touch events
    document.onclick = touchTap;
    document.ontouchstart = touchStart;
    document.ontouchend = touchEnd;
    document.ontouchmove = touchMove;
    document.ontouchcancel = touchCancel;
};

const gamepadConnectionHandler = (event, connected) => {
    // Code from MDN: https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
    const gamepad = event.gamepad;

    if (connected) {
        gamepads[gamepad.index] = gamepad;
        console.log("Gamepad connected from index %d: %s", gamepad.index, gamepad.id);
    } else {
      delete gamepads[gamepad.index];
        console.log("Gamepad disconnnected from index %d: %s", gamepad.index, gamepad.id);
    }
}

const initGamepad = () => {
    window.addEventListener("gamepadconnected", (e) => gamepadConnectionHandler(e, true), false);
    window.addEventListener("gamepaddisconnected", (e) => gamepadConnectionHandler(e, false), false); 
}

// Defines the 'size' of a deadzone for analog axis. If the absolute value of the axis
// is less than the deadzone, the input is ignored
const AXIS_DEADZONE = 0.75;

// If an axis is above this, it will be ignored.
const AXIS_MAX = 1;


// Buttons
/// (top console)
/// 0, 1, 2
/// 3, 4, 5
/// (front panel)
/// 6, 7, 8, 9 (inside case)

// Axis
// Up : axes[1] = -1
// Down: axes[1] = 1
// Left: axes[0] = -1
// Right: axes[0] = 1

// Tracks previous state of controller axis and buttons, allowing for 'keyup' and 'keydown' like functionality 
const currentGamepadInputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false
}

const debounceControllerInput = (key, input) => {
    if(currentGamepadInputState[key] !== input) {
        currentGamepadInputState[key] = input;
        return true;
    }
    return false;
}

const checkGamepad = (gamepad) => {
    if(typeof gamepad === "object" && Array.isArray(gamepad.buttons)) {
        gamepad.buttons.forEach((button, index) => { 
            if(debounceControllerInput(index, button.pressed)) {
                window.dispatchEvent(new KeyboardEvent(button.pressed ?  "keydown" : "keyup", {
                        key: `gamepad_${index}`,
                        code: `GamepadButton${index}`,
                        keyCode: `gamepad_${index}`
                    }
                ));
            }
        });
        
        gamepad.axes.forEach((axis, index) => {
        let up,down,left,right;
            if(index === 0) {
                // X
                if(axis >= AXIS_DEADZONE && axis <= AXIS_MAX) {
                    right = true;
                    left = false;
                } else if(axis <= -AXIS_DEADZONE && axis >= -AXIS_MAX) {
                    left = true;
                    right = false;
                } else {
                    left = false;
                    right = false;
                }

                if(debounceControllerInput("right", right))
                    window.dispatchEvent(new KeyboardEvent(right ?  "keydown" : "keyup", {
                        key: "right",
                        code: Keys.JOYSTICK_RIGHT,
                        keyCode: "right"
                    }
                ));

                if(debounceControllerInput("left", left))
                    window.dispatchEvent(new KeyboardEvent(left ?  "keydown" : "keyup", {
                    key: "left",
                    code: Keys.JOYSTICK_LEFT,
                    keyCode: "left"
                    }
                ));
            } 
            else if(index === 1) {
                // Y
                if(axis >= AXIS_DEADZONE && axis <= AXIS_MAX) {
                    down = true;
                    up = false;
                } else if(axis <= -AXIS_DEADZONE && axis >= -AXIS_MAX) {
                    up = true;
                    down = false;
                } else {
                    up = false;
                    down = false;
                }

                if(debounceControllerInput("down", down))
                    window.dispatchEvent(new KeyboardEvent(down ?  "keydown" : "keyup", {
                    key: "down",
                    code: Keys.JOYSTICK_DOWN,
                    keyCode: "down"
                    }
                ));

                if(debounceControllerInput("up", up))
                    window.dispatchEvent(new KeyboardEvent(up ?  "keydown" : "keyup", {
                    key: "up",
                    code: Keys.JOYSTICK_UP,
                    keyCode: "up"
                    }
                ));
            }
        })
    }
}

const checkGamepads = () => {
    if(gamepads && Object.keys(gamepads).length > 0) {
        Object.values(gamepads).forEach((gamepad) => checkGamepad(gamepad));
    }
}
