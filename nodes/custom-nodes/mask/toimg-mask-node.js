import { GenericImageNode } from "../../image-node-object.js";
import { MaskInputNodeConnector, ImageOutputNodeConnector } from "../../image-node-connector.js"; 

export class ToImgMaskNode extends GenericImageNode {
    constructor(parent, x, y) {
        super(parent, x, y);
        this.central_element.textContent = "TO IMAGE";
        this.base_element.style.border = "1px solid plum";
        this.base_top.style.backgroundColor = "plum";
        this.spacer.style.color = "plum";
        this.spacer.style.display = "none";

        this.inputs.push(new MaskInputNodeConnector(this));
        this.outputs.push(new ImageOutputNodeConnector(this));

        this.inputvalue = undefined;
        this.inputtype = undefined;
    }
    process() {
        if (this.inputtype) {
            var out = this.inputvalue;
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