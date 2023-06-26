import { GenericImageNode, DirectionController } from "../../image-node-object.js";
import { ImageInputNodeConnector, ImageOutputNodeConnector, MaskInputNodeConnector } from "../../image-node-connector.js"; 

export class SortEffectNode extends GenericImageNode {
    constructor(parent, x, y) {
        super(parent, x, y);
        this.central_element.textContent = "PIXEL SORT";
        this.base_element.style.border = "1px solid lightseagreen";
        this.base_top.style.backgroundColor = "lightseagreen";
        this.spacer.style.color = "lightseagreen";

        this.str = new DirectionController(this);
        this.options.appendChild(this.str.getWrap());

        this.canvas = document.createElement("canvas");
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.options.appendChild(this.canvas);

        this.inputs.push(new ImageInputNodeConnector(this));
        this.inputs.push(new MaskInputNodeConnector(this));
        this.outputs.push(new ImageOutputNodeConnector(this));

        this.inputvalue1 = undefined;
        this.inputtype1 = undefined;
        this.inputvalue2 = undefined;
        this.inputtype2 = undefined;

        this.worker = new Worker("./nodes/custom-nodes/effects/sort-worker.js");
        const node = this;
        this.worker.onmessage = function(e) {
            const indexes = e.data[0];
            const ctx = node.canvas.getContext("2d");
            ctx.drawImage(GPUApplyIndexPixels(node.parent.gpu, node.inputvalue1, indexes), 0, 0);
            //has input -> find connected inputs from output
            for (var i = 0; i < node.parent.connections.length; i++) {
                if (node.parent.connections[i].output == node.outputs[0]) {
                    node.parent.connections[i].input.parent.receiveInput(node.canvas, node.parent.connections[i].output, node.parent.connections[i].input);
                }
            }
        };
    }
    getCompareFunction() {
        const val = this.str.getValue();
        if(val == "top" || val == "right") {
            return function(val1, val2) {
                return val1 > val2;
            };
        } else {
            return function(val1, val2) {
                return val1 < val2;
            };
        }
    }
    getDefaultIndexArray(base) {
        const result = [];
        for (var i = 0; i < base.length; i++) {
            result[i] = [];
            for (var j = 0; j < base[i].length; j++) {
                result[i][j] = [i, j];
            }
        }
        return result;
    }
    getIndexArray(pixelsum) {
        //get comparison function
        const compare = this.getCompareFunction();
        //create default index array
        const result = this.getDefaultIndexArray(pixelsum);
        //sort
        const val = this.str.getValue();
        if(val == "top" || val == "bottom") {
            //vertical
            for (var j = 0; j < pixelsum[0].length; j++) {
                for (var i = 0; i < pixelsum.length; i++) {
                    //"remember" current element and compare with next
                    for (var k = i; k < pixelsum.length; k++) {
                        if (compare(pixelsum[i][j], pixelsum[k][j])) {
                            //swap elements
                            const temp = pixelsum[i][j];
                            pixelsum[i][j] = pixelsum[k][j];
                            pixelsum[k][j] = temp;
                            //swap indexes
                            const temp2 = result[i][j];
                            result[i][j] = result[k][j];
                            result[k][j] = temp2;
                        }
                    }
                }
            }
        } else {
            //horizontal
            for (var i = 0; i < pixelsum.length; i++) {
                for (var j = 0; j < pixelsum[i].length; j++) {
                    //"remember" current element and compare with next
                    for (var k = j; k < pixelsum[i].length; k++) {
                        if (compare(pixelsum[i][j], pixelsum[i][k])) {
                            //swap elements
                            const temp = pixelsum[i][j];
                            pixelsum[i][j] = pixelsum[i][k];
                            pixelsum[i][k] = temp;
                            //swap indexes
                            const temp2 = result[i][j];
                            result[i][j] = result[i][k];
                            result[i][k] = temp2;
                        }
                    }
                }
            }
        }
        return result;
    }
    getIndexArrayMasked(pixelsum) {
        //get comparison function
        const compare = this.getCompareFunction();
        //create default index array
        const result = this.getDefaultIndexArray(pixelsum);
        //sort
        const val = this.str.getValue();
        if(val == "top" || val == "bottom") {
            //vertical
            for (var j = 0; j < pixelsum[0].length; j++) {
                for (var i = 0; i < pixelsum.length; i++) {
                    //"remember" current element and compare with next
                    for (var k = i; k < pixelsum.length && pixelsum[k][j] != 0; k++) {
                        if (compare(pixelsum[i][j], pixelsum[k][j])) {
                            //swap elements
                            const temp = pixelsum[i][j];
                            pixelsum[i][j] = pixelsum[k][j];
                            pixelsum[k][j] = temp;
                            //swap indexes
                            const temp2 = result[i][j];
                            result[i][j] = result[k][j];
                            result[k][j] = temp2;
                        }
                    }
                }
            }
        } else {
            //horizontal
            for (var i = 0; i < pixelsum.length; i++) {
                for (var j = 0; j < pixelsum[i].length; j++) {
                    //"remember" current element and compare with next
                    for (var k = j; k < pixelsum[i].length && pixelsum[i][k] != 0; k++) {
                        if (compare(pixelsum[i][j], pixelsum[i][k])) {
                            //swap elements
                            const temp = pixelsum[i][j];
                            pixelsum[i][j] = pixelsum[i][k];
                            pixelsum[i][k] = temp;
                            //swap indexes
                            const temp2 = result[i][j];
                            result[i][j] = result[i][k];
                            result[i][k] = temp2;
                        }
                    }
                }
            }
        }
        return result;
    }
    process() {
        if (this.inputtype1) {
            const ctx = this.canvas.getContext("2d");
            this.canvas.width = this.inputvalue1.width;
            this.canvas.height = this.inputvalue1.height;
            if (this.inputtype2) {
                /*Sort with a mask*/
                const pixelsum = GPUGetPixelSumArrayMasked(this.parent.gpu, this.inputvalue1, this.inputvalue2);
                this.worker.postMessage([true, pixelsum, ...this.getCheck()]);
            } else {
                /*Sort without a mask*/
                const pixelsum = GPUGetPixelSumArray(this.parent.gpu, this.inputvalue1);
                this.worker.postMessage([false, pixelsum, ...this.getCheck()]);
            }
        }
    }
    getCheck() {
        const val = this.str.getValue();
        return [val == "top" || val == "right", val == "top" || val == "bottom"];
    }
    receiveInput(input, connector, connected) {
        //determine which input not received the input value
        if (connected == this.inputs[0]) {
            this.inputtype1 = "image";
            this.inputvalue1 = input;
        } else {
            this.inputtype2 = "mask";
            this.inputvalue2 = input;
        }
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
        this.process();
    }
}

/*
additional function - get image pixel sum array
*/
export function GPUGetPixelSumArray(gpu, source) {
    const w = source.width;
    const h = source.height;

    const pixelsum = gpu.createKernel(function(image) {
        const pixel = image[this.thread.y][this.thread.x];
        return pixel[0] + pixel[1] + pixel[2];
    }).setOutput([w, h]);

    return pixelsum(source);
}

/*
additional function - get image pixel sum array - masked
*/
export function GPUGetPixelSumArrayMasked(gpu, source, mask) {
    const w = source.width;
    const h = source.height;

    const pixelsum = gpu.createKernel(function(image, mask) {
        const pixel = image[this.thread.y][this.thread.x];
        const maskpixel = mask[this.thread.y][this.thread.x];
        return (pixel[0] + pixel[1] + pixel[2]) * maskpixel[0];
    }).setOutput([w, h]);

    return pixelsum(source, mask);
}

/*
applies pixel values from index
*/
export function GPUApplyIndexPixels(gpu, source, indexes) {
    const w = source.width;
    const h = source.height;

    const sort = gpu.createKernel(function(image, index) {
        const pixel = image[index[this.thread.y][this.thread.x][0]][index[this.thread.y][this.thread.x][1]];
        this.color(pixel[0], pixel[1], pixel[2], 1);
    }).setOutput([w, h]).setGraphical(true);

    sort(source, indexes);

    return sort.canvas;
}