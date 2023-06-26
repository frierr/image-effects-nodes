import { AddBasicNode } from "./custom-nodes/basic/add-basic-node.js";
import { ColourInputNode } from "./custom-nodes/inputs/colour-input-node.js";
import { ImageInputNode } from "./custom-nodes/inputs/image-input-node.js";
import { InvertBasicNode } from "./custom-nodes/basic/invert-basic-node.js";
import { MaskBasicNode } from "./custom-nodes/mask/mask-basic-node.js";
import { MultiplyBasicNode } from "./custom-nodes/basic/multiply-basic-node.js";
import { OverlayBasicNode } from "./custom-nodes/basic/overlay-basic-node.js";
import { ValueInputNode } from "./custom-nodes/inputs/value-input-node.js";
import { getCanvasRightClickMenu } from "./image-node-context-menu.js";
import { GenericImageNode, OutputImageNode } from "./image-node-object.js";
import { DiffuseMaskNode } from "./custom-nodes/mask/diffuse-mask-node.js";
import { ErodeMaskNode } from "./custom-nodes/mask/erode-mask-node.js";
import { ToImgMaskNode } from "./custom-nodes/mask/toimg-mask-node.js";
import { DeconstColourNode } from "./custom-nodes/colour/deconst-colour-node.js";
import { ConstColourNode } from "./custom-nodes/colour/const-colour-node.js";
import { PixelEffectNode } from "./custom-nodes/effects/pixel-effect-node.js";
import { LimitEffectNode } from "./custom-nodes/effects/limit-effect-node.js";
import { BlurEffectNode } from "./custom-nodes/effects/blur-effect-node.js";
import { SortEffectNode } from "./custom-nodes/effects/sort-effect-node.js";

export class NodeHandler {
    constructor(parent, output, gpu) {
        this.parent = parent;
        this.background = this.#createBackgoundCanvas();
        this.bgContext = this.background.getContext("2d");
        const handler = this;
        this.parentObserver = new ResizeObserver(function() {
            handler.parentResized(handler);
        }).observe(this.parent);
        this.contextmenu = [];
        this.nodelist = [];
        this.nodelist.push(new OutputImageNode(this, this.parent.offsetWidth - 200, this.parent.offsetHeight / 2, output));
        this.connections = [];
        this.gpu = gpu;
    }
    removeContextMenu() {
        for (var i = 0; i < this.contextmenu.length; i++) {
            this.contextmenu[i].remove();
        }
        this.contextmenu = [];
    }
    #createBackgoundCanvas() {
        const canvas = document.createElement("canvas");
        this.parent.appendChild(canvas);
        const nh = this;
        canvas.onclick = function(e) {
            nh.removeContextMenu();
        }
        canvas.oncontextmenu = function(e) {
            nh.removeContextMenu();
            nh.contextmenu.push(getCanvasRightClickMenu(nh, e.clientX, e.clientY));
            return false;
        }
        return canvas;
    }
    parentResized(handler) {
        if (handler.parent) {
            const canvas = handler.parent.children[0];
            if(canvas) {
                canvas.width = handler.parent.offsetWidth;
                canvas.height = handler.parent.offsetHeight - 4;
            }
            handler.redrawAllConnections();
        }
    }
    removeAllConnectionsFromNode(node) {
        //find node connections
        for (var i = 0; i < node.inputs.length; i++) {
            for(var j = 0; j < this.connections.length; j++) {
                if (this.connections[j].input == node.inputs[i]) {
                    //remove connection
                    this.connections[j].input.connectionscount--;
                    this.connections[j].output.connectionscount--;
                    if (this.connections[j].output.connectionscount < 1) {
                        this.connections[j].output.element.classList.remove(`image-node-connector-${this.connections[j].output.valuetype}-selected`);
                    }
                    this.connections.splice(j, 1);
                    break;
                }
            }
        }
        for (var i = 0; i < node.outputs.length; i++) {
            for(var j = 0; j < this.connections.length; j++) {
                if (this.connections[j].output == node.outputs[i]) {
                    //remove connection
                    this.connections[j].input.connectionscount--;
                    this.connections[j].output.connectionscount--;
                    this.connections[j].input.element.classList.remove(`image-node-connector-${this.connections[j].input.valuetype}-selected`);
                    this.connections[j].input.parent.forgetInput();
                    this.connections.splice(j, 1);
                    break;
                }
            }
        }
        this.redrawAllConnections();
    }
    removeInputConnectionsFromNode(input) {
        for (var i = 0; i < this.connections.length; i++) {
            if (this.connections[i].input == input) {
                //remove connection
                this.connections[i].input.connectionscount--;
                this.connections[i].output.connectionscount--;
                if (this.connections[i].output.connectionscount < 1) {
                    this.connections[i].output.element.classList.remove(`image-node-connector-${this.connections[i].output.valuetype}-selected`);
                }
                this.connections.splice(i, 1);
                break;
            }
        }
    }
    removeOutputConnectionsFromNode(output) {
        for (var i = 0; i < this.connections.length; i++) {
            if (this.connections[i].output == output) {
                //remove connection
                this.connections[i].input.connectionscount--;
                this.connections[i].output.connectionscount--;
                if (this.connections[i].input.connectionscount < 1) {
                    this.connections[i].input.element.classList.remove(`image-node-connector-${this.connections[i].input.valuetype}-selected`);
                }
                this.connections.splice(i, 1);
                break;
            }
        }
    }
    getConnectedInputNode(output) {
        for (var i = 0; i < this.connections.length; i++) {
            if (this.connections[i].output == output) {
                return this.connections[i].input;
            }
        }
        return false;
    }
    getConnectedOutputNode(input) {
        for (var i = 0; i < this.connections.length; i++) {
            if (this.connections[i].input == input) {
                return this.connections[i].output;
            }
        }
        return false;
    }
    redrawAllConnections() {
        this.bgContext.clearRect(0, 0, this.background.width, this.background.height);
        const bg_pos = this.background.getBoundingClientRect();
        for (var i = 0; i < this.connections.length; i++) {
            //draw a connection line
            const input_pos = this.getNodeConnectorPos(this.connections[i].input, bg_pos);
            const output_pos = this.getNodeConnectorPos(this.connections[i].output, bg_pos);
            this.bgContext.beginPath();
            //get colour
            if (this.connections[i].input.valuetype == "any") {
                if (this.connections[i].output.valuetype == "any") {
                    this.setConnectionLineColour("any");
                } else {
                    this.setConnectionLineColour(this.connections[i].output.valuetype);
                }
            } else {
                this.setConnectionLineColour(this.connections[i].input.valuetype);
            }
            this.bgContext.lineWidth = 5;
            this.bgContext.moveTo(input_pos[0], input_pos[1]);
            this.bgContext.lineTo(output_pos[0], output_pos[1]);
            this.bgContext.closePath();
            this.bgContext.stroke();
        }
    }
    getNodeConnectorPos(connector, bg_pos) {
        const rect = connector.element.getBoundingClientRect();
        return [rect.left + (rect.right - rect.left) / 2 - bg_pos.left, rect.top + (rect.bottom - rect.top) / 2 - bg_pos.top];
    }
    setConnectionLineColour(valuetype) {
        switch (valuetype) {
            case "image":
                this.bgContext.strokeStyle = "darkolivegreen";
                break;
            case "number":
                this.bgContext.strokeStyle = "orange";
                break;
            case "colour":
                this.bgContext.strokeStyle = "palevioletred";
                break;
            case "mask":
                this.bgContext.strokeStyle = "lightseagreen";
                break;
            default:
                this.bgContext.strokeStyle = "grey";
                break;
        }
    }
    drawTemporaryLine(connector, x, y) {
        this.redrawAllConnections();
        //draws temporary line from connector to mouse point
        const bg_pos = this.background.getBoundingClientRect();
        const node_pos = this.getNodeConnectorPos(connector, bg_pos);
        this.bgContext.beginPath();
        this.setConnectionLineColour(connector.valuetype);
        this.bgContext.lineWidth = 5;
        this.bgContext.moveTo(node_pos[0], node_pos[1]);
        this.bgContext.lineTo(x - bg_pos.left, y - bg_pos.top);
        this.bgContext.closePath();
        this.bgContext.stroke();
    }
    createNodeAt(x, y, type) {
        switch (type) {
            case "im-node-img":
                this.nodelist.push(new ImageInputNode(this, x, y));
                break;
            case "im-node-val":
                this.nodelist.push(new ValueInputNode(this, x, y));
                break;
            case "im-node-colour":
                this.nodelist.push(new ColourInputNode(this, x, y));
                break;
            case "im-node-invert":
                this.nodelist.push(new InvertBasicNode(this, x, y));
                break;
            case "im-node-mask":
                this.nodelist.push(new MaskBasicNode(this, x, y));
                break;
            case "im-node-add":
                this.nodelist.push(new AddBasicNode(this, x, y));
                break;
            case "im-node-multiply":
                this.nodelist.push(new MultiplyBasicNode(this, x, y));
                break;
            case "im-node-overlay":
                this.nodelist.push(new OverlayBasicNode(this, x, y));
                break;
            case "im-node-diffuse":
                this.nodelist.push(new DiffuseMaskNode(this, x, y));
                break;
            case "im-node-erosion":
                this.nodelist.push(new ErodeMaskNode(this, x, y));
                break;
            case "im-node-toimg":
                this.nodelist.push(new ToImgMaskNode(this, x, y));
                break;
            case "im-node-deconst":
                this.nodelist.push(new DeconstColourNode(this, x, y));
                break;
            case "im-node-const":
                this.nodelist.push(new ConstColourNode(this, x, y));
                break;
            case "im-node-pixel":
                this.nodelist.push(new PixelEffectNode(this, x, y));
                break;
            case "im-node-limit":
                this.nodelist.push(new LimitEffectNode(this, x, y));
                break;
            case "im-node-blur":
                this.nodelist.push(new BlurEffectNode(this, x, y));
                break;
            case "im-node-sort":
                this.nodelist.push(new SortEffectNode(this, x, y));
                break;
            default:
                this.nodelist.push(new GenericImageNode(this, x, y));
                break;
        }
    }
}