import { GenericImageNode } from "../../image-node-object.js";
import { ColourInputNodeConnector, ValueOutputNodeConnector } from "../../image-node-connector.js"; 

export class DeconstColourNode extends GenericImageNode {
    constructor(parent, x, y) {
        super(parent, x, y);
        this.central_element.textContent = "DECONSTRUCT";
        this.base_element.style.border = "1px solid lightsalmon";
        this.base_top.style.backgroundColor = "lightsalmon";
        this.spacer.style.color = "lightsalmon";
        this.spacer.style.display = "none";

        this.canvas = document.createElement("canvas");
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.options.appendChild(this.canvas);

        this.inputs.push(new ColourInputNodeConnector(this));
        this.outputs.push(new ValueOutputNodeConnector(this));
        this.outputs.push(new ValueOutputNodeConnector(this));
        this.outputs.push(new ValueOutputNodeConnector(this));

        this.inputvalue = undefined;
        this.inputtype = undefined;
    }
    process() {
        if (this.inputtype) {
            //has input -> find connected inputs from output
            for (var i = 0; i < this.parent.connections.length; i++) {
                if (this.parent.connections[i].output == this.outputs[0]) {
                    this.parent.connections[i].input.parent.receiveInput(this.inputvalue.r, this.parent.connections[i].output, this.parent.connections[i].input);
                } else if (this.parent.connections[i].output == this.outputs[1]) {
                    this.parent.connections[i].input.parent.receiveInput(this.inputvalue.g, this.parent.connections[i].output, this.parent.connections[i].input);
                } else if (this.parent.connections[i].output == this.outputs[2]) {
                    this.parent.connections[i].input.parent.receiveInput(this.inputvalue.b, this.parent.connections[i].output, this.parent.connections[i].input);
                }
            }
        }
    }
    receiveInput(input, connector, connected) {
        this.inputtype = "colour";
        this.inputvalue = input;
        this.process();
    }
    forgetInput() {
        this.inputvalue = undefined;
        this.inputtype = undefined;
        this.process();
    }
}