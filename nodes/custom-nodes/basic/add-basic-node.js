import { GenericImageNode } from "../../image-node-object.js";
import { AnyInputNodeConnector, AnyOutputNodeConnector, ColourOutputNodeConnector, ImageOutputNodeConnector, MaskOutputNodeConnector, ValueOutputNodeConnector } from "../../image-node-connector.js"; 

export class AddBasicNode extends GenericImageNode {
    constructor(parent, x, y) {
        super(parent, x, y);
        this.central_element.textContent = "ADD";
        this.base_element.style.border = "1px solid royalblue";
        this.base_top.style.backgroundColor = "royalblue";
        this.spacer.style.color = "royalblue";
        this.spacer.style.display = "none";

        this.canvas = document.createElement("canvas");
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.options.appendChild(this.canvas);

        this.inputs.push(new AnyInputNodeConnector(this));
        this.inputs.push(new AnyInputNodeConnector(this));
        this.outputs.push(new AnyOutputNodeConnector(this));

        this.inputvalue1 = undefined;
        this.inputtype1 = undefined;
        this.inputvalue2 = undefined;
        this.inputtype2 = undefined;
    }
    process() {
        if (this.inputtype1 || this.inputtype2) {
            //at least one input exists
            var out = undefined;
            if (this.inputtype1 && !this.inputtype2) {
                //input 1 pass through
                out = this.inputvalue1;
            } else if (!this.inputtype1 && this.inputtype2) {
                //input 2 pass through
                out = this.inputvalue2;
            } else {
                //both inputs connected -> do operation
                switch (this.inputtype1) {
                    case "image":
                        switch (this.inputtype2) {
                            case "image":
                                //image to image addition - result is an image
                                this.canvas.width = this.inputvalue1.width;
                                this.canvas.height = this.inputvalue1.height;
                                const ctxii = this.canvas.getContext("2d");
                                ctxii.drawImage(GPUImageImageSum(this.parent.gpu, this.inputvalue1, this.inputvalue2), 0, 0);
                                out = this.canvas;
                                break;
                            case "mask":
                                //image to mask addition - result is an image
                                this.canvas.width = this.inputvalue1.width;
                                this.canvas.height = this.inputvalue1.height;
                                const ctxim = this.canvas.getContext("2d");
                                ctxim.drawImage(GPUImageImageSum(this.parent.gpu, this.inputvalue1, this.inputvalue2), 0, 0);
                                out = this.canvas;
                                break;
                            case "colour":
                                //image to colour addition - result is an image
                                this.canvas.width = this.inputvalue1.width;
                                this.canvas.height = this.inputvalue1.height;
                                const ctxic = this.canvas.getContext("2d");
                                ctxic.drawImage(GPUImageColourSum(this.parent.gpu, this.inputvalue1, this.inputvalue2), 0, 0);
                                out = this.canvas;
                                break;
                            case "number":
                                //image to number addition - result is an image
                                this.canvas.width = this.inputvalue1.width;
                                this.canvas.height = this.inputvalue1.height;
                                const ctxin = this.canvas.getContext("2d");
                                ctxin.drawImage(GPUImageNumberSum(this.parent.gpu, this.inputvalue1, this.inputvalue2), 0, 0);
                                out = this.canvas;
                                break;
                            default:
                                break;
                        }
                        break;
                    case "mask":
                        switch (this.inputtype2) {
                            case "image":
                                //image to mask addition - result is an image
                                this.canvas.width = this.inputvalue1.width;
                                this.canvas.height = this.inputvalue1.height;
                                const ctxmi = this.canvas.getContext("2d");
                                ctxmi.drawImage(GPUImageImageSum(this.parent.gpu, this.inputvalue1, this.inputvalue2), 0, 0);
                                out = this.canvas;
                                break;
                            case "mask":
                                //mask to mask addition - result is a mask
                                this.canvas.width = this.inputvalue1.width;
                                this.canvas.height = this.inputvalue1.height;
                                const ctxmm = this.canvas.getContext("2d");
                                ctxmm.drawImage(GPUImageImageSum(this.parent.gpu, this.inputvalue1, this.inputvalue2), 0, 0);
                                out = this.canvas;
                                break;
                            case "colour":
                                //mask to colour addition - result is a mask
                                this.canvas.width = this.inputvalue1.width;
                                this.canvas.height = this.inputvalue1.height;
                                const ctxmc = this.canvas.getContext("2d");
                                ctxmc.drawImage(GPUImageColourSum(this.parent.gpu, this.inputvalue1, this.inputvalue2), 0, 0);
                                out = this.canvas;
                                break;
                            case "number":
                                //mask to number addition - result is a mask
                                this.canvas.width = this.inputvalue1.width;
                                this.canvas.height = this.inputvalue1.height;
                                const ctxmn = this.canvas.getContext("2d");
                                ctxmn.drawImage(GPUImageNumberSum(this.parent.gpu, this.inputvalue1, this.inputvalue2), 0, 0);
                                out = this.canvas;
                                break;
                            default:
                                break;
                        }
                        break;
                    case "colour":
                        switch (this.inputtype2) {
                            case "image":
                                //image to colour addition - result is an image
                                this.canvas.width = this.inputvalue1.width;
                                this.canvas.height = this.inputvalue1.height;
                                const ctxci = this.canvas.getContext("2d");
                                ctxci.drawImage(GPUImageColourSum(this.parent.gpu, this.inputvalue2, this.inputvalue1), 0, 0);
                                out = this.canvas;
                                break;
                            case "mask":
                                //mask to colour addition - result is a mask
                                this.canvas.width = this.inputvalue1.width;
                                this.canvas.height = this.inputvalue1.height;
                                const ctxcm = this.canvas.getContext("2d");
                                ctxcm.drawImage(GPUImageColourSum(this.parent.gpu, this.inputvalue2, this.inputvalue1), 0, 0);
                                out = this.canvas;
                                break;
                            case "colour":
                                //colour to colour addition - result is a colour
                                out = {
                                    r: Math.max(0, Math.min(255, this.inputvalue1.r + this.inputvalue2.r)),
                                    g: Math.max(0, Math.min(255, this.inputvalue1.g + this.inputvalue2.g)),
                                    b: Math.max(0, Math.min(255, this.inputvalue1.b + this.inputvalue2.b))
                                };
                                break;
                            case "number":
                                //colour to number addition - result is a colour
                                out = {
                                    r: Math.max(0, Math.min(255, this.inputvalue1.r + this.inputvalue2)),
                                    g: Math.max(0, Math.min(255, this.inputvalue1.g + this.inputvalue2)),
                                    b: Math.max(0, Math.min(255, this.inputvalue1.b + this.inputvalue2))
                                };
                                break;
                            default:
                                break;
                        }
                        break;
                    case "number":
                        switch (this.inputtype2) {
                            case "image":
                                //image to number addition - result is an image
                                this.canvas.width = this.inputvalue1.width;
                                this.canvas.height = this.inputvalue1.height;
                                const ctxni = this.canvas.getContext("2d");
                                ctxni.drawImage(GPUImageNumberSum(this.parent.gpu, this.inputvalue2, this.inputvalue1), 0, 0);
                                out = this.canvas;
                                break;
                            case "mask":
                                //mask to number addition - result is a mask
                                this.canvas.width = this.inputvalue1.width;
                                this.canvas.height = this.inputvalue1.height;
                                const ctxnm = this.canvas.getContext("2d");
                                ctxnm.drawImage(GPUImageNumberSum(this.parent.gpu, this.inputvalue2, this.inputvalue1), 0, 0);
                                out = this.canvas;
                                break;
                            case "colour":
                                //colour to number addition - result is a colour
                                out = {
                                    r: Math.max(0, Math.min(255, this.inputvalue2.r + this.inputvalue1)),
                                    g: Math.max(0, Math.min(255, this.inputvalue2.g + this.inputvalue1)),
                                    b: Math.max(0, Math.min(255, this.inputvalue2.b + this.inputvalue1))
                                };
                                break;
                            case "number":
                                //number addition - result is a number
                                out = this.inputvalue1 + this.inputvalue2;
                                break;
                            default:
                                break;
                        }
                        break;
                    default:
                        break;
                }
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
        //determine which input not received the input value
        if (connected == this.inputs[0]) {
            if (connector instanceof ValueOutputNodeConnector) {
                //input is a number
                this.inputtype1 = "number";
            } else if (connector instanceof ImageOutputNodeConnector) {
                //input is an image
                this.inputtype1 = "image";
            } else if (connector instanceof MaskOutputNodeConnector) {
                //input is a mask
                this.inputtype1 = "mask";
            } else if (connector instanceof ColourOutputNodeConnector) {
                //input is a colour
                this.inputtype1 = "colour";
            }
            this.inputvalue1 = input;
        } else {
            if (connector instanceof ValueOutputNodeConnector) {
                //input is a number
                this.inputtype2 = "number";
            } else if (connector instanceof ImageOutputNodeConnector) {
                //input is an image
                this.inputtype2 = "image";
            } else if (connector instanceof MaskOutputNodeConnector) {
                //input is a mask
                this.inputtype2 = "mask";
            } else if (connector instanceof ColourOutputNodeConnector) {
                //input is a colour
                this.inputtype2 = "colour";
            }
            this.inputvalue2 = input;
        }
        this.updateOutput();
        this.process();
    }
    forgetInput() {
        if (!this.parent.getConnectedOutputNode(this.inputs[0])) {
            this.inputvalue1 = undefined;
            this.inputtype1 = undefined;
        }
        if (!this.parent.getConnectedOutputNode(this.inputs[1])) {
            this.inputvalue2 = undefined;
            this.inputtype2 = undefined;
        }
        this.updateOutput();
        this.process();
    }
}

function GPUImageImageSum(gpu, source1, source2) {
    const w = source1.width;
    const h = source1.height;

    const sum = gpu.createKernel(function(image1, image2) {
        const pixel1 = image1[this.thread.y][this.thread.x];
        const pixel2 = image2[this.thread.y][this.thread.x];
        this.color(Math.max(0, Math.min(255, pixel1[0] + pixel2[0])), Math.max(0, Math.min(255, pixel1[1] + pixel2[1])), Math.max(0, Math.min(255, pixel1[2] + pixel2[2])), 1);
    }).setOutput([w, h]).setGraphical(true);

    sum(source1, source2);

    return sum.canvas;
}

function GPUImageColourSum(gpu, source, colour) {
    const w = source.width;
    const h = source.height;

    const sum = gpu.createKernel(function(image, colour) {
        const pixel = image[this.thread.y][this.thread.x];
        this.color(Math.max(0, Math.min(255, pixel[0] + colour[0])), Math.max(0, Math.min(255, pixel[1] + colour[1])), Math.max(0, Math.min(255, pixel[2] + colour[2])), 1);
    }).setOutput([w, h]).setGraphical(true);

    sum(source, [colour.r / 255, colour.g / 255, colour.b / 255]);

    return sum.canvas;
}

function GPUImageNumberSum(gpu, source, number) {
    const w = source.width;
    const h = source.height;

    const sum = gpu.createKernel(function(image, num) {
        const pixel = image[this.thread.y][this.thread.x];
        this.color(Math.max(0, Math.min(255, pixel[0] + num)), Math.max(0, Math.min(255, pixel[1] + num)), Math.max(0, Math.min(255, pixel[2] + num)), 1);
    }).setOutput([w, h]).setGraphical(true);

    sum(source, number);

    return sum.canvas;
}