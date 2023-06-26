/*
nodes supported values:
--- image - [W x H] array of pixels
--- number - any float value
--- colour - singular pixel, array of 4 values
--- mask - [W x H] array of black and white pixels
--- any

node states
- ready
- processing -> display animation when the node is processing the inputs
*/

import { getNodeContextMenu } from "./image-node-context-menu.js";
import { AnyOutputNodeConnector, ImageInputNodeConnector, ColourOutputNodeConnector, ImageOutputNodeConnector, MaskOutputNodeConnector, ValueOutputNodeConnector } from "./image-node-connector.js";

export class GenericImageNode {
    constructor(parent, x, y) {
        this.parent = parent;
        this.position = {x: x, y: y};
        this.dragpoint = {x: 0, y: 0};
        this.isProcessing = false;
        this.base_element = this.#createBaseNodeElement(x, y);
        this.parent.parent.appendChild(this.base_element);
        const base = this.base_element;
        this.base_element.oncontextmenu = function(e) {
            parent.removeContextMenu();
            parent.contextmenu.push(getNodeContextMenu(parent, e.clientX, e.clientY, function() {
                parent.removeAllConnectionsFromNode(current_node);
                base.remove();
            }));
            return false;
        }

        this.inputs = [];
        this.outputs = [];
        this.base_top = this.#createTopNodeElement();
        this.inputs_element = this.#createIONodeElement();
        this.outputs_element = this.#createIONodeElement();
        this.central_element = this.#createCentralNodeElement();
        this.base_top.appendChild(this.inputs_element);
        this.base_top.appendChild(this.central_element);
        this.base_top.appendChild(this.outputs_element);
        this.base_element.appendChild(this.base_top);

        this.options = this.#createOptionsNodeElement();
        this.spacer = this.#createSpacerNodeElement(this.options);
        this.base_element.appendChild(this.spacer);
        this.base_element.appendChild(this.options);

        const current_node = this;
        this.central_element.onmousedown = function(e) {
            e.preventDefault();
            current_node.dragpoint.x = e.clientX;
            current_node.dragpoint.y = e.clientY;
            document.onmouseup = function() {
                document.onmouseup = null;
                document.onmousemove = null;
            }
            document.onmousemove = function(e) {
                e.preventDefault();
                current_node.position.y = current_node.position.y - (current_node.dragpoint.y - e.clientY);
                current_node.position.x = current_node.position.x - (current_node.dragpoint.x - e.clientX);
                current_node.dragpoint.x = e.clientX;
                current_node.dragpoint.y = e.clientY;
                current_node.base_element.style.top = `${current_node.position.y}px`;
                current_node.base_element.style.left = `${current_node.position.x}px`;
                current_node.parent.redrawAllConnections();
            }
        }
    }
    #createBaseNodeElement(x, y) {
        const elem = document.createElement("div");
        elem.className = "image-node-base";
        elem.style.top = `${y}px`;
        elem.style.left = `${x}px`;
        return elem;
    }
    #createTopNodeElement() {
        const elem = document.createElement("div");
        elem.className = "image-node-base-top";
        return elem;
    }
    #createIONodeElement() {
        const elem = document.createElement("div");
        elem.className = "image-node-io";
        return elem;
    }
    #createCentralNodeElement() {
        const elem = document.createElement("div");
        elem.className = "image-node-central";
        elem.textContent = "generic_node";
        return elem;
    }
    #createSpacerNodeElement(options) {
        const elem = document.createElement("div");
        elem.className = "image-node-spacer";
        elem.textContent = "▼";
        const parent = this.parent;
        elem.onclick = function() {
            //switches option menu display
            if (options.style.display == "none") {
                options.style.display = "grid";
                elem.style.height = "10px";
                elem.textContent = "▲";
            } else {
                options.style.display = "none";
                elem.style.height = "5px";
                elem.textContent = "▼";
            }
            parent.redrawAllConnections();
        }
        return elem;
    }
    #createOptionsNodeElement() {
        const elem = document.createElement("div");
        elem.className = "image-node-options";
        elem.style.display = "none";
        return elem;
    }
    tryReconnectNodes(newNodeClass) {
        //for single outputs only
        //get connected input node
        const input = this.parent.getConnectedInputNode(this.outputs[0]);
        this.outputs[0].element.remove();
        this.parent.removeOutputConnectionsFromNode(this.outputs.pop());
        this.outputs.push(new newNodeClass(this));
        if (input && (this.outputs[0].valuetype == "any" || input.valuetype == "any" || input.valuetype == this.outputs[0].valuetype)) {
            //reserve connection
            AnyOutputNodeConnector.tryNodeConnection(input, this.outputs[0]);
        }
    }
    //two input with dynamic output operation only
    updateOutput() {
        //changes output type depending on inputs
        if (!this.inputtype1) {
            if (!this.inputtype2) {
                //no inputs
                this.spacer.style.display = "none";
                this.options.style.display = "none";
                if (!(this.outputs[0] instanceof AnyOutputNodeConnector)) {
                    //change output node based on input type
                    this.tryReconnectNodes(AnyOutputNodeConnector);
                }
            } else {
                //input 2 only
                this.setOutputOnOneInput(this.inputtype2);
            }
        } else {
            if (!this.inputtype2) {
                //input 1 only
                this.setOutputOnOneInput(this.inputtype1);
            } else {
                //two inputs
                if (this.inputtype1 == "image" || this.inputtype2 == "image") {
                    this.setOutputOnOneInput("image");
                } else if (this.inputtype1 == "mask" || this.inputtype2 == "mask") {
                    this.setOutputOnOneInput("mask");
                } else if (this.inputtype1 == "colour" || this.inputtype2 == "colour") {
                    this.setOutputOnOneInput("colour");
                } else {
                    this.setOutputOnOneInput("number");
                }
            }
        }
    }
    //two input with dynamic output operation only
    setOutputOnOneInput(inputtype) {
        switch(inputtype) {
            case "number":
                this.spacer.style.display = "none";
                this.options.style.display = "none";
                if (!(this.outputs[0] instanceof ValueOutputNodeConnector)) {
                    //change output node based on input type
                    this.tryReconnectNodes(ValueOutputNodeConnector);
                }
                break;
            case "image":
                this.spacer.style.display = "flex";
                if (!(this.outputs[0] instanceof ImageOutputNodeConnector)) {
                    //change output node based on input type
                    this.tryReconnectNodes(ImageOutputNodeConnector);
                }
                break;
            case "mask":
                this.spacer.style.display = "flex";
                if (!(this.outputs[0] instanceof MaskOutputNodeConnector)) {
                    //change output node based on input type
                    this.tryReconnectNodes(MaskOutputNodeConnector);
                }
                break;
            case "colour":
                this.spacer.style.display = "none";
                this.options.style.display = "none";
                if (!(this.outputs[0] instanceof ColourOutputNodeConnector)) {
                    //change output node based on input type
                    this.tryReconnectNodes(ColourOutputNodeConnector);
                }
                break;
            default:
                break;
        }
    }
    process() {
        //UPDATE LATER - run every time to process inputs and pass it to output
    }
    receiveInput() {
        //UPDATE LATER - run on new input
    }
    forgetInput() {
        //UPDATE LATER - run on input drop
    }
}

/*
output node
should be unique, first in the nodelist and linked to the output field
*/
export class OutputImageNode extends GenericImageNode {
    constructor(parent, x, y, output) {
        super(parent, x, y);
        this.central_element.textContent = "OUTPUT";

        this.base_element.oncontextmenu = function(e) {
            parent.removeContextMenu();
            return false;
        }

        this.spacer.remove();
        this.options.remove();

        this.inputs.push(new ImageInputNodeConnector(this));

        this.output = output;
        this.received = undefined;

        this.drawevent = new Event("draw");
    }
    process() {
        if (this.received) {
            //display received input on canvas;
            this.output.width = this.received.width;
            this.output.height = this.received.height;
            const ctx = this.output.getContext("2d");
            ctx.drawImage(this.received, 0, 0);
        } else {
            const ctx = this.output.getContext("2d");
            ctx.clearRect(0, 0, this.output.width, this.output.height);
            this.output.width = 0;
            this.output.height = 0;
        }
        this.output.dispatchEvent(this.drawevent);
    }
    receiveInput(image) {
        this.received = image;
        this.process();
    }
    forgetInput() {
        this.received = undefined;
        this.process();
    }
}

export class StrengthController {
    constructor(parent) {
        this.parent = parent;

        this.wrap = document.createElement("div");
        this.wrap.className = "strength-controller-wrap";
        this.desc = document.createElement("div");
        this.desc.textContent = "Str:";
        this.display = document.createElement("div");
        this.display.textContent = "0";

        this.slider = this.createSliderInput(0);

        this.wrap.appendChild(this.desc);
        this.wrap.appendChild(this.slider);
        this.wrap.appendChild(this.display);

        this.update();
    }
    getWrap() {
        return this.wrap;
    }
    getValue() {
        return Number(this.slider.value);
    }
    createSliderInput(val) {
        const slider = document.createElement("input");
        slider.className = "node-input-slider";
        slider.type = "range";
        slider.min = 0;
        slider.max = 20;
        slider.value = val;
        slider.step = 1;

        const node = this;
        slider.onchange = function() {
            node.update();
        }
        slider.oninput = function() {
            node.updateDisplay();
        }
        return slider;
    }
    updateDisplay() {
        this.display.textContent = `${Number(this.slider.value)}`;
    }
    update() {
        this.parent.process();
    }
}

export class DirectionController {
    constructor(parent) {
        this.parent = parent;

        this.wrap = document.createElement("div");
        this.wrap.className = "direction-controller-wrap";
        this.desc = document.createElement("div");
        this.desc.textContent = "Dir:";
        this.display = document.createElement("div");
        this.display.textContent = "";

        this.selected = "top";

        this.dirwrap = this.createDirectionInput();

        this.wrap.appendChild(this.desc);
        this.wrap.appendChild(this.dirwrap);
        this.wrap.appendChild(this.display);

        this.update();
    }
    getWrap() {
        return this.wrap;
    }
    getValue() {
        return this.selected;
    }
    createDirectionInput() {
        const directionwrap = document.createElement("div");
        directionwrap.className = "direction-input-wrap";

        const node = this;

        const top = document.createElement("div");
        top.className = "direction-input-top";
        top.onclick = function() {
            node.clearSelectionClass();
            top.classList.add("direction-input-selected");
            node.selected = "top";
            node.update();
        }
        top.classList.add("direction-input-selected");
        directionwrap.appendChild(top);

        const right = document.createElement("div");
        right.className = "direction-input-right";
        right.onclick = function() {
            node.clearSelectionClass();
            right.classList.add("direction-input-selected");
            node.selected = "right";
            node.update();
        }
        directionwrap.appendChild(right);

        const left = document.createElement("div");
        left.className = "direction-input-left";
        left.onclick = function() {
            node.clearSelectionClass();
            left.classList.add("direction-input-selected");
            node.selected = "left";
            node.update();
        }
        directionwrap.appendChild(left);

        const bottom = document.createElement("div");
        bottom.className = "direction-input-bottom";
        bottom.onclick = function() {
            node.clearSelectionClass();
            bottom.classList.add("direction-input-selected");
            node.selected = "bottom";
            node.update();
        }
        directionwrap.appendChild(bottom);

        return directionwrap;
    }
    clearSelectionClass() {
        const children = this.dirwrap.children;
        for (var i = 0; i < children.length; i++) {
            children[i].classList.remove("direction-input-selected");
        }
    }
    update() {
        this.parent.process();
    }
}