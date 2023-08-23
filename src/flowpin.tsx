import { FlowNode } from './flownode';

export type FlowInputPin = { 
    varname: string;
    source: {fnode: FlowNode, outpinidx: number} | null;
}


export type FlowOutputPin = { 
    destinations: [{fnode: FlowNode, inpinvarname: string}];
}