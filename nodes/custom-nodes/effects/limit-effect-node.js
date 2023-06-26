import { GenericImageNode, StrengthController } from "../../image-node-object.js";
import { ImageInputNodeConnector, ImageOutputNodeConnector } from "../../image-node-connector.js"; 

export class LimitEffectNode extends GenericImageNode {
    constructor(parent, x, y) {
        super(parent, x, y);
        this.central_element.textContent = "GAMMA LIMIT";
        this.base_element.style.border = "1px solid lightseagreen";
        this.base_top.style.backgroundColor = "lightseagreen";
        this.spacer.style.color = "lightseagreen";

        this.str = new StrengthController(this);
        this.options.appendChild(this.str.getWrap());

        this.canvas = document.createElement("canvas");
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.options.appendChild(this.canvas);

        this.inputs.push(new ImageInputNodeConnector(this));
        this.outputs.push(new ImageOutputNodeConnector(this));

        this.inputvalue = undefined;
        this.inputtype = undefined;
    }
    process() {
        if (this.inputtype) {
            const ctx = this.canvas.getContext("2d");
            this.canvas.width = this.inputvalue.width;
            this.canvas.height = this.inputvalue.height;
            const r = (-1 / 5) * this.str.getValue() + 3;
            const ratio = 10 ** r;
            ctx.drawImage(GPULimitGamma(this.parent.gpu, this.inputvalue, ratio), 0, 0);
            //has input -> find connected inputs from output
            for (var i = 0; i < this.parent.connections.length; i++) {
                if (this.parent.connections[i].output == this.outputs[0]) {
                    this.parent.connections[i].input.parent.receiveInput(this.canvas, this.parent.connections[i].output, this.parent.connections[i].input);
                }
            }
        }
    }
    receiveInput(input, connector, connected) {
        this.inputtype = "image";
        this.inputvalue = input;
        this.process();
    }
    forgetInput() {
        this.inputvalue = undefined;
        this.inputtype = undefined;
        this.process();
    }
}

function GPULimitGamma(gpu, source, value) {
    const w = source.width;
    const h = source.height;

    const limit = gpu.createKernel(function(image, value) {
        const pixel = image[this.thread.y][this.thread.x];
        const red = Math.round(pixel[0] * value) / value;
        const green = Math.round(pixel[1] * value) / value;
        const blue = Math.round(pixel[2] * value) / value;
        this.color(red, green, blue, 1);
    }).setOutput([w, h]).setGraphical(true);

    limit(source, value);

    return limit.canvas;
}