import type { EdgeInstance } from "../../../src";

export enum JointConnection {
  START = 1,
  END = 2,
}

/**
 * A joint represents where several lines join together.
 */
export class Joint {
  /** All lines that connect to this joint with their start */
  startEdges = new Set<EdgeInstance>();
  /** All lines that connect to this joint with their end */
  endEdges = new Set<EdgeInstance>();

  /**
   * Add an edge based on the connection made.
   */
  addEdge(edge: EdgeInstance, connection: JointConnection) {
    if (connection === JointConnection.START) {
      this.startEdges.add(edge);
    } else if (connection === JointConnection.END) {
      this.endEdges.add(edge);
    }
  }

  /**
   * Remove an edge from this joint
   */
  removeEdge(edge: EdgeInstance) {
    this.startEdges.delete(edge);
    this.endEdges.delete(edge);
  }
}
