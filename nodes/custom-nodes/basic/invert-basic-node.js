import { GenericImageNode } from "../../image-node-object.js";
import { AnyInputNodeConnector, AnyOutputNodeConnector, ColourOutputNodeConnector, ImageOutputNodeConnector, MaskOutputNodeConnector, ValueOutputNodeConnector } from "../../image-node-connector.js"; 

export class InvertBasicNode extends GenericImageNode {
    constructor(parent, x, y) {
        super(parent, x, y);
        this.central_element.textContent = "INVERT";
        this.base_element.style.border = "1px solid royalblue";
        this.base_top.style.backgroundColor = "royalblue";
        this.spacer.style.color = "royalblue";
        this.spacer.style.display = "none";

        this.canvas = document.createElement("canvas");
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.options.appendChild(this.canvas);

        this.inputs.push(new AnyInputNodeConnector(this));
        this.outputs.push(new AnyOutputNodeConnector(this));

        this.inputvalue = undefined;
        this.inputtype = undefined;
    }
    process() {
        if (this.inputtype) {
            var out = undefined;
            switch (this.inputtype) {
                case "number":
                    out = this.inputvalue * -1;
                    break;
                case "image":
                    this.canvas.width = this.inputvalue.width;
                    this.canvas.height = this.inputvalue.height;
                    const ctx = this.canvas.getContext("2d");
                    ctx.drawImage(GPUInvertImage(this.parent.gpu, this.inputvalue), 0, 0);
                    out = this.canvas;
                    break;
                case "mask":
                    this.canvas.width = this.inputvalue.width;
                    this.canvas.height = this.inputvalue.height;
                    const ctx1 = this.canvas.getContext("2d");
                    ctx1.drawImage(GPUInvertImage(this.parent.gpu, this.inputvalue), 0, 0);
                    out = this.canvas;
                    break;
                case "colour":
                    out = {
                        r: 255 - this.inputvalue.r,
                        g: 255 - this.inputvalue.g,
                        b: 255 - this.inputvalue.b
                    };
                    break;
                default:
                    break;
            }
            //has input -> find connected inputs from output
            for (var i = 0; i < this.parent.connections.length; i++) {
                if (this.parent.connections[i].output == this.outputs[0]) {
                    this.parent.connections[i].input.parent.receiveInput(out, this.parent.connections[i].output, this.parent.connections[i].input);
                }
            }
        }
    }
    receiveInput(input, connector, connected) {
        //determine input type
        if (typeof input == "number") {
            //input is a number
            this.inputtype = "number";
            this.spacer.style.display = "none";
            this.options.style.display = "none";
            if (!(this.outputs[0] instanceof ValueOutputNodeConnector)) {
                //change output node based on input type
                this.tryReconnectNodes(ValueOutputNodeConnector);
            }
        } else {
            //input is an object
            if (input.nodeName && input.nodeName.toLowerCase() == "canvas") {
                //input is an image/canvas or mask
                this.spacer.style.display = "flex";
                if (connector instanceof ImageOutputNodeConnector) {
                    //input is an image
                    this.inputtype = "image";
                    if (!(this.outputs[0] instanceof ImageOutputNodeConnector)) {
                        //change output node based on input type
                        this.tryReconnectNodes(ImageOutputNodeConnector);
                    }
                } else {
                    //input is a mask
                    this.inputtype = "mask";
                    if (!(this.outputs[0] instanceof MaskOutputNodeConnector)) {
                        //change output node based on input type
                        this.tryReconnectNodes(MaskOutputNodeConnector);
                    }
                }
            } else {
                //input is a colour
                this.inputtype = "colour";
                this.spacer.style.display = "none";
                this.options.style.display = "none";
                if (!(this.outputs[0] instanceof ColourOutputNodeConnector)) {
                    //change output node based on input type
                    this.tryReconnectNodes(ColourOutputNodeConnector);
                }
            }
        }
        this.inputvalue = input;
        this.process();
    }
    forgetInput() {
        this.inputvalue = undefined;
        this.inputtype = undefined;
        this.spacer.style.display = "none";
        this.options.style.display = "none";
        if (!(this.outputs[0] instanceof AnyOutputNodeConnector)) {
            //change output node based on input type
            this.tryReconnectNodes(AnyOutputNodeConnector);
        }
        this.process();
    }
}

/*
inverts image
*/
function GPUInvertImage(gpu, source) {
    const w = source.width;
    const h = source.height;

    const invert = gpu.createKernel(function(image) {
        const pixel = image[this.thread.y][this.thread.x];
        this.color(1 - pixel[0], 1 - pixel[1], 1 - pixel[2], 1);
    }).setOutput([w, h]).setGraphical(true);

    invert(source);

    return invert.canvas;
}