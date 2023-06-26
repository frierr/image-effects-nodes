class GenericImageNodeConnector {
    constructor(parent, type, valuetype) {
        this.parent = parent;
        this.type = type == "input";
        this.valuetype = valuetype;
        this.element = this.#createNodeConnectorElem();
        if (this.type) {
            this.parent.inputs_element.appendChild(this.element);
        } else {
            this.parent.outputs_element.appendChild(this.element);
        }
        this.connectionscount = 0;

        const node = this;
        this.element.onmousedown = function(e) {
            if (node.type) {
                parent.parent.removeInputConnectionsFromNode(node);
            }
            e.preventDefault();
            node.element.classList.add(`image-node-connector-${node.valuetype}-selected`);
            parent.parent.drawTemporaryLine(node, e.clientX, e.clientY);
            document.onmouseup = function(e) {
                if (!(!node.type && node.connectionscount > 0)) {
                    node.element.classList.remove(`image-node-connector-${node.valuetype}-selected`);
                    if (node.type) {
                        node.parent.forgetInput();
                    }
                }
                
                const target = document.elementFromPoint(e.clientX, e.clientY);
                if (target.classList[0] == "image-node-connector-base") {
                    var is_found = false;
                    //find the target element
                    for (var i = 0; i < parent.parent.nodelist.length && !is_found; i++) {
                        if (node.type) {
                            //node type is input -> check outputs
                            for (var j = 0; j < parent.parent.nodelist[i].outputs.length && !is_found; j++) {
                                if (parent.parent.nodelist[i].outputs[j].element == target) {
                                    //element found
                                    is_found = true;
                                    const found = parent.parent.nodelist[i].outputs[j];
                                    GenericImageNodeConnector.tryNodeConnection(node, found);
                                }
                            }
                        } else {
                            //node type is output -> check inputs
                            for (var j = 0; j < parent.parent.nodelist[i].inputs.length && !is_found; j++) {
                                if (parent.parent.nodelist[i].inputs[j].element == target) {
                                    //element found
                                    is_found = true;
                                    const found = parent.parent.nodelist[i].inputs[j];
                                    GenericImageNodeConnector.tryNodeConnection(node, found);
                                }
                            }
                        }
                    }
                }
                parent.parent.redrawAllConnections();

                document.onmouseup = null;
                document.onmousemove = null;
            }
            document.onmousemove = function(e) {
                e.preventDefault();
                parent.parent.drawTemporaryLine(node, e.clientX, e.clientY);
            }
        }
    }
    #createNodeConnectorElem() {
        const elem = document.createElement("div");
        elem.className = `image-node-connector-base image-node-connector-${this.valuetype}`;
        return elem;
    }
    static tryNodeConnection(node1, node2) {
        if (node1 != node2 && (node1.valuetype == "any" || node2.valuetype == "any" || node1.valuetype == node2.valuetype)) {
            //create node connection
            const handler = node1.parent.parent;
            handler.connections.push(new NodeConnection(node1, node2, handler));
            node1.element.classList.add(`image-node-connector-${node1.valuetype}-selected`);
            node2.element.classList.add(`image-node-connector-${node2.valuetype}-selected`);
            node1.connectionscount++;
            node2.connectionscount++;
            handler.redrawAllConnections();
            handler.connections[handler.connections.length - 1].output.parent.process();
        }
    }
}

class NodeConnection {
    constructor(node1, node2, handler) {
        if (node1.type) {
            //node1 is an input
            this.input = node1;
            this.output = node2;
        } else {
            //node2 is an input
            this.input = node2;
            this.output = node1;
        }
        //drop previous input connection
        handler.removeInputConnectionsFromNode(this.input);
    }
}

export class ImageInputNodeConnector extends GenericImageNodeConnector {
    constructor(parent) {
        super(parent, "input", "image");
    }
}

export class ValueInputNodeConnector extends GenericImageNodeConnector {
    constructor(parent) {
        super(parent, "input", "number");
    }
}

export class ColourInputNodeConnector extends GenericImageNodeConnector {
    constructor(parent) {
        super(parent, "input", "colour");
    }
}

export class MaskInputNodeConnector extends GenericImageNodeConnector {
    constructor(parent) {
        super(parent, "input", "mask");
    }
}

export class AnyInputNodeConnector extends GenericImageNodeConnector {
    constructor(parent) {
        super(parent, "input", "any");
    }
}

export class ImageOutputNodeConnector extends GenericImageNodeConnector {
    constructor(parent) {
        super(parent, "output", "image");
    }
}

export class ValueOutputNodeConnector extends GenericImageNodeConnector {
    constructor(parent) {
        super(parent, "output", "number");
    }
}

export class ColourOutputNodeConnector extends GenericImageNodeConnector {
    constructor(parent) {
        super(parent, "output", "colour");
    }
}

export class MaskOutputNodeConnector extends GenericImageNodeConnector {
    constructor(parent) {
        super(parent, "output", "mask");
    }
}

export class AnyOutputNodeConnector extends GenericImageNodeConnector {
    constructor(parent) {
        super(parent, "output", "any");
    }
}