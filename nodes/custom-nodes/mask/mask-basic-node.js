import { GenericImageNode } from "../../image-node-object.js";
import { ImageInputNodeConnector, MaskOutputNodeConnector } from "../../image-node-connector.js"; 

export class MaskBasicNode extends GenericImageNode {
    constructor(parent, x, y) {
        super(parent, x, y);
        this.central_element.textContent = "MASK";
        this.base_element.style.border = "1px solid plum";
        this.base_top.style.backgroundColor = "plum";
        this.spacer.style.color = "plum";

        this.red = new ColourController("red", this);
        this.options.appendChild(this.red.getWrap());

        this.green = new ColourController("green", this);
        this.options.appendChild(this.green.getWrap());

        this.blue = new ColourController("blue", this);
        this.options.appendChild(this.blue.getWrap());

        this.canvas = document.createElement("canvas");
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.options.appendChild(this.canvas);

        this.inputs.push(new ImageInputNodeConnector(this));
        this.outputs.push(new MaskOutputNodeConnector(this));

        this.inputvalue = undefined;
    }
    process() {
        if (this.inputvalue) {
            this.canvas.width = this.inputvalue.width;
            this.canvas.height = this.inputvalue.height;
            const ctx = this.canvas.getContext("2d");
            ctx.drawImage(GPUImageMask(this.parent.gpu, this.inputvalue, this.red.getRange(), this.green.getRange(), this.blue.getRange()), 0, 0);
            //has input -> find connected inputs from output
            for (var i = 0; i < this.parent.connections.length; i++) {
                if (this.parent.connections[i].output == this.outputs[0]) {
                    this.parent.connections[i].input.parent.receiveInput(this.canvas, this.parent.connections[i].output, this.parent.connections[i].input);
                }
            }
        }
    }
    receiveInput(input) {
        this.inputvalue = input;
        this.process();
    }
    forgetInput() {
        this.inputvalue = undefined;
        this.canvas.width = 0;
        this.process();
    }
}

class ColourController {
    constructor(colour, parent) {
        this.colour = colour;
        this.parent = parent;

        this.wrap = document.createElement("div");
        this.wrap.className = "colour-controller-wrap";
        this.desc = document.createElement("div");
        this.desc.textContent = this.colour;

        this.left = this.createNewNumberInput(0.2);
        this.right = this.createNewNumberInput(0.8);

        this.wrap.appendChild(this.left);
        this.wrap.appendChild(this.desc);
        this.wrap.appendChild(this.right);

        this.update();
    }
    getWrap() {
        return this.wrap;
    }
    getRange() {
        return [Number(this.left.value), Number(this.right.number)];
    }
    update() {
        var left = Math.min(1, Math.max(0, Number(this.left.value)));
        var right = Math.min(1, Math.max(0, Number(this.right.value)));
        if (left > right) {
            const temp = left;
            left = right;
            this.left.value = right;
            right = temp;
            this.right.value = temp;
        }
        left *= 100;
        right *= 100;
        this.wrap.style.background = `linear-gradient(90deg, whitesmoke -2%, whitesmoke ${left - 1}%, ${this.colour} ${left}%, ${this.colour} ${right}%, whitesmoke ${right + 1}%, whitesmoke 102%)`;
        this.parent.process();
    }
    createNewNumberInput(val) {
        const res = document.createElement("input");
        res.type = "number";
        res.min = 0;
        res.value = val;
        res.max = 1;
        res.step = 0.05;

        const node = this;
        res.onchange = function() {
            node.update();
        }
        return res;
    }
}

/*
Image Mask
*/
export function GPUImageMask(gpu, source, r, g, b) {
    const w = source.width;
    const h = source.height;

    const mask = gpu.createKernel(function(image, r, g, b) {
        const pixel = image[this.thread.y][this.thread.x];
        if (pixel[0] > r[0] && pixel[0] < r[1] &&
            pixel[1] > g[0] && pixel[1] < g[1] &&
            pixel[2] > b[0] && pixel[2] < b[1]) {
            this.color(1, 1, 1, 1);
        } else {
            this.color(0, 0, 0, 1);
        }
    }).setOutput([w, h]).setGraphical(true);

    mask(source, r, g, b);

    return mask.canvas;
}