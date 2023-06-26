import { GenericImageNode, StrengthController } from "../../image-node-object.js";
import { MaskInputNodeConnector, MaskOutputNodeConnector } from "../../image-node-connector.js"; 

export class ErodeMaskNode extends GenericImageNode {
    constructor(parent, x, y) {
        super(parent, x, y);
        this.central_element.textContent = "ERODE";
        this.base_element.style.border = "1px solid plum";
        this.base_top.style.backgroundColor = "plum";
        this.spacer.style.color = "plum";

        this.str = new StrengthController(this);
        this.options.appendChild(this.str.getWrap());

        this.canvas = document.createElement("canvas");
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.options.appendChild(this.canvas);

        this.inputs.push(new MaskInputNodeConnector(this));
        this.outputs.push(new MaskOutputNodeConnector(this));

        this.inputvalue = undefined;
        this.inputtype = undefined;
    }
    process() {
        if (this.inputtype) {
            const ctx = this.canvas.getContext("2d");
            this.canvas.width = this.inputvalue.width;
            this.canvas.height = this.inputvalue.height;
            ctx.filter = `blur(${this.str.getValue()}px)`;
            ctx.drawImage(this.inputvalue, 0, 0);
            ctx.filter = "none";
            ctx.drawImage(GPUPixelFloor(this.parent.gpu, this.canvas), 0, 0);
            var out = this.canvas;
            //has input -> find connected inputs from output
            for (var i = 0; i < this.parent.connections.length; i++) {
                if (this.parent.connections[i].output == this.outputs[0]) {
                    this.parent.connections[i].input.parent.receiveInput(out, this.parent.connections[i].output, this.parent.connections[i].input);
                }
            }
        }
    }
    receiveInput(input, connector, connected) {
        this.inputtype = "mask";
        this.inputvalue = input;
        this.process();
    }
    forgetInput() {
        this.inputvalue = undefined;
        this.inputtype = undefined;
        this.process();
    }
}

function GPUPixelFloor(gpu, source) {
    const w = source.width;
    const h = source.height;

    const floor = gpu.createKernel(function(image) {
        const pixel = image[this.thread.y][this.thread.x];
        if (pixel[0] < 1) {
            this.color(0, 0, 0, 1);
        } else {
            this.color(1, 1, 1, 1);
        }
    }).setOutput([w, h]).setGraphical(true);

    floor(source);

    return floor.canvas;
}