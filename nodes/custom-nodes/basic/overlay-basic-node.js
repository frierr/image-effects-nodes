import { GenericImageNode } from "../../image-node-object.js";
import { ImageInputNodeConnector, ColourOutputNodeConnector, ImageOutputNodeConnector, MaskOutputNodeConnector, ValueOutputNodeConnector } from "../../image-node-connector.js"; 

export class OverlayBasicNode extends GenericImageNode {
    constructor(parent, x, y) {
        super(parent, x, y);
        this.central_element.textContent = "OVERLAY";
        this.base_element.style.border = "1px solid royalblue";
        this.base_top.style.backgroundColor = "royalblue";
        this.spacer.style.color = "royalblue";
        this.spacer.style.display = "none";

        this.canvas = document.createElement("canvas");
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.options.appendChild(this.canvas);

        this.inputs.push(new ImageInputNodeConnector(this));
        this.inputs.push(new ImageInputNodeConnector(this));
        this.outputs.push(new ImageOutputNodeConnector(this));

        this.inputvalue1 = undefined;
        this.inputtype1 = undefined;
        this.inputvalue2 = undefined;
        this.inputtype2 = undefined;
    }
    process() {
        if (this.inputtype1 && this.inputtype2) {
            this.spacer.style.display = "flex";
            //both inputs connected -> do operation
            this.canvas.width = this.inputvalue1.width;
            this.canvas.height = this.inputvalue1.height;
            const ctx = this.canvas.getContext("2d");
            ctx.drawImage(GPUImageOverlay(this.parent.gpu, this.inputvalue1, this.inputvalue2), 0, 0);
            //has input -> find connected inputs from output
            for (var i = 0; i < this.parent.connections.length; i++) {
                if (this.parent.connections[i].output == this.outputs[0]) {
                    this.parent.connections[i].input.parent.receiveInput(this.canvas, this.parent.connections[i].output, this.parent.connections[i].input);
                }
            }
        }
    }
    receiveInput(input, connector, connected) {
        //determine which input not received the input value
        if (connected == this.inputs[0]) {
            //input is an image
            this.inputtype1 = "image";
            this.inputvalue1 = input;
        } else {
            //input is an image
            this.inputtype2 = "image";
            this.inputvalue2 = input;
        }
        this.process();
    }
    forgetInput() {
        if (!this.parent.getConnectedOutputNode(this.inputs[0])) {
            this.inputvalue1 = undefined;
            this.inputtype1 = undefined;
            this.spacer.style.display = "none";
            this.options.style.display = "none";
        }
        if (!this.parent.getConnectedOutputNode(this.inputs[1])) {
            this.inputvalue2 = undefined;
            this.inputtype2 = undefined;
            this.spacer.style.display = "none";
            this.options.style.display = "none";
        }
        this.process();
    }
}

function GPUImageOverlay(gpu, source1, source2) {
    const w = source1.width;
    const h = source1.height;

    const over = gpu.createKernel(function(image1, image2) {
        const pixel1 = image1[this.thread.y][this.thread.x];
        const pixel2 = image2[this.thread.y][this.thread.x];
        if (pixel1[0] == 0 && pixel1[1] == 0 && pixel1[2] == 0 || pixel1[3] == 0) {
            this.color(pixel2[0], pixel2[1], pixel2[2], 1);
        } else {
            this.color(pixel1[0], pixel1[1], pixel1[2], 1);
        }
    }).setOutput([w, h]).setGraphical(true);

    over(source1, source2);

    return over.canvas;
}