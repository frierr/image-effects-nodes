import { GenericImageNode } from "../../image-node-object.js";
import { ValueInputNodeConnector, ColourOutputNodeConnector } from "../../image-node-connector.js"; 

export class ConstColourNode extends GenericImageNode {
    constructor(parent, x, y) {
        super(parent, x, y);
        this.central_element.textContent = "CONSTRUCT";
        this.base_element.style.border = "1px solid lightsalmon";
        this.base_top.style.backgroundColor = "lightsalmon";
        this.spacer.style.color = "lightsalmon";
        this.spacer.style.display = "none";

        this.canvas = document.createElement("canvas");
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.options.appendChild(this.canvas);

        this.inputs.push(new ValueInputNodeConnector(this));
        this.inputs.push(new ValueInputNodeConnector(this));
        this.inputs.push(new ValueInputNodeConnector(this));
        this.outputs.push(new ColourOutputNodeConnector(this));

        this.inputvalue1 = undefined;
        this.inputtype1 = undefined;
        this.inputvalue2 = undefined;
        this.inputtype2 = undefined;
        this.inputvalue3 = undefined;
        this.inputtype3 = undefined;
    }
    process() {
        if (this.inputtype1 && this.inputtype2 && this.inputtype3) {
            const result = {
                r: Math.max(0, Math.min(255, this.inputvalue1)),
                g: Math.max(0, Math.min(255, this.inputvalue2)),
                b: Math.max(0, Math.min(255, this.inputvalue3))
            }
            //has input -> find connected inputs from output
            for (var i = 0; i < this.parent.connections.length; i++) {
                if (this.parent.connections[i].output == this.outputs[0]) {
                    this.parent.connections[i].input.parent.receiveInput(result, this.parent.connections[i].output, this.parent.connections[i].input);
                }
            }
        }
    }
    receiveInput(input, connector, connected) {
        if (connected == this.inputs[0]) {
            this.inputvalue1 = input;
            this.inputtype1 = "number";
        }
        if (connected == this.inputs[1]) {
            this.inputvalue2 = input;
            this.inputtype2 = "number";
        }
        if (connected == this.inputs[2]) {
            this.inputvalue3 = input;
            this.inputtype3 = "number";
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
        if (!this.parent.getConnectedOutputNode(this.inputs[2])) {
            this.inputvalue2 = undefined;
            this.inputtype2 = undefined;
        }
        this.process();
    }
}