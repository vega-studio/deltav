/**
 * The purpose of this file and processes is to take a layers attributes and
 * instance attributes and optimally pack them into blocks. As it should be
 * known an attribute and a uniform is limited by the hardware in 'blocks'. Each
 * block for webgl 1.0 is 4 floats. If you use a single float and not the rest,
 * you have used an entire block.
 *
 * Thus, we pack down the attributes into appropriate block indices and slots.
 */

import { Instance } from "../../instance-provider/instance.js";
import {
  IInstanceAttribute,
  InstanceAttributeSize,
  InstanceBlockIndex,
} from "../../types.js";

/**
 * A quick representation of an available block with a convenience method to
 * easily apply metrics to an attribute if it fits.
 */
class Block<T extends Instance> {
  index = 0;
  available = 4;

  constructor(blockIndex: number) {
    this.index = blockIndex;
  }

  setAttribute(attr: IInstanceAttribute<T>) {
    if ((attr.size || 0) <= this.available) {
      attr.block = this.index;
      attr.blockIndex = 4 - this.available;
      this.available -= attr.size || 0;

      return true;
    }

    return false;
  }
}

/**
 * This loops through all attributes and ensures each attribute is applied
 */
function ensureSizes<T extends Instance>(attributes: IInstanceAttribute<T>[]) {
  attributes.forEach((attr) => {
    if (attr.resource && attr.size === undefined) {
      attr.size = InstanceAttributeSize.FOUR;
    }

    // If the size of the attribute is not determiend at this point, we do our
    // best to find it by whatever means possible
    if (!attr.size) {
      try {
        // We inject a very phoney instance, we don't need accurate data, we
        // will be happy if we get an array of undefineds which should be in
        // line with the size of the attribute.
        const check = attr.update(new Instance({}) as T);

        // We see if the output is sane
        if (check.length > 0 && check.length <= InstanceAttributeSize.FOUR) {
          attr.size = check.length;
        }
      } catch (_err) {
        console.warn(
          "The system could not determine the size of the provided attribute. Please provide the size of the attribute:",
          attr
        );
      }
    }
  });
}

/**
 * This is the packing method that calculates the block and block index best
 * suited for an attribute so a layer developer does not have to worry about it.
 */
export function packAttributes<T extends Instance>(
  attributes: IInstanceAttribute<T>[]
) {
  // First make sure each attribute has a size
  ensureSizes(attributes);
  // Keep a list of the blocks we have decided needs to be in use
  const blocks: Block<T>[] = [];

  // Loop through all attributes and pack em' in
  attributes.forEach((attr) => {
    // A matrix 4x4 is a special case where it requires 4 consecutive blocks to
    // work correctly
    if (attr.size && attr.size === InstanceAttributeSize.MAT4X4) {
      attr.block = blocks.length;
      attr.blockIndex = InstanceBlockIndex.INVALID;

      // We know any block that gets created instantly receives some content.
      // Thus we know to fit the matrix we need to simply immediately create 4
      // blocks.
      for (let i = 0; i < 4; ++i) {
        const newBlock = new Block(blocks.length);
        newBlock.available = 0;
        newBlock.index = 0;
        blocks.push(newBlock);
      }

      return;
    }

    // Look for a block that can fit our attribute
    const block = blocks.find((block) => {
      if (block.setAttribute(attr)) {
        return Boolean(block);
      }

      return false;
    });

    // If our attribute did not fit into any of the existing blocks, then we
    // must create a new block to stuff our attribute into.
    if (!block) {
      const newBlock = new Block(blocks.length);
      blocks.push(newBlock);

      if (!newBlock.setAttribute(attr)) {
        console.warn(
          "There was a problem packing an attribute into a block. No block would accommodate it:",
          attr
        );
      }
    }
  });
}
