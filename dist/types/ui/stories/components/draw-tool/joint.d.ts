import type { EdgeInstance } from "../../../src";
export declare enum JointConnection {
    START = 1,
    END = 2
}
/**
 * A joint represents where several lines join together.
 */
export declare class Joint {
    /** All lines that connect to this joint with their start */
    startEdges: Set<EdgeInstance>;
    /** All lines that connect to this joint with their end */
    endEdges: Set<EdgeInstance>;
    /**
     * Get a list of all lines that connect to this joint with their start
     */
    start(): EdgeInstance[];
    /**
     * Get a list of all lines that connect to this joint with their end
     */
    end(): EdgeInstance[];
    /**
     * Get a complete list of all edges associated with this joint.
     */
    all(): EdgeInstance[];
    /**
     * Add an edge based on the connection made.
     */
    addEdge(edge: EdgeInstance, connection: JointConnection): void;
    /**
     * Remove an edge from this joint
     */
    removeEdge(edge: EdgeInstance): void;
}
