import { type UniformBufferSize, UniformSize } from "../types.js";
import type { GLProxy } from "./gl-proxy.js";

export class UniformBuffer {
  /**
   * Defines the padding structure of the uniform buffer. This defines the
   * alignment of the buffer. We currently ONLY support std140.
   */
  paddingStructure = "std140" as const;

  /**
   * The name of the uniform buffer block. This should be the name of block as
   * defined in the shader.
   */
  name: string;

  /**
   * Defines the block structure of the uniform buffer. This defines the names
   * and sizes of the block members. The order is REQUIRED to be in smallest
   * size to largest size. We do this to optimize buffer packing strategy.
   *
   * order:
   * - float
   * - vec2
   * - vec3
   * - vec4
   * - mat2
   * - mat3
   * - mat4
   * - any array type (order does not matter for array types as they all have
   *   the same padding requirements no matter the element size)
   *
   * NOTE: Forced ordering is NOT a typical gl layer abstraction and we allow it
   * this time because the deltav system will be the one writing our uniform
   * structure to the shader. There are advantages to this approach so we will
   * enforce it here so we can ensure it is done correctly as well as utilize
   * the assumption to optimize the buffer packing strategy.
   *
   * NOTE2: Once the block structure is set, it can not be changed. Simply
   * destroy this object and build anew.
   */
  private blockStructure: {
    /** Name of the block member as it appears in the shader */
    name: string;
    /**
     * Size of the block member. Determines the proper alignment for packing in
     * the buffer
     */
    size: UniformBufferSize;
    /**
     * If the block member is an array, this is the size of the array.
     * Defaults to 1.
     */
    arraySize?: number;
    /**
     * Data to be used for the block member. This is a flat array of floats.
     * This data should be tightly packed based on the size of the block member
     * and the array size if it is an array.
     *
     * ie:
     * - size is Vec2 [1, 1]
     * - size is Vec2 and array of 4 [1, 1, 2, 2, 3, 3, 4, 4]
     * - size is float [1]
     * - size is float and array of 4 [1, 2, 3, 4]
     */
    data: number[];
    /** Is true when the data needs to be updated. */
    update?: boolean;

    buffer?: {
      /** Index in the buffer this member starts */
      start: number;
      /** Padding present for each element (triggers skips in the buffer) */
      pad: number;
    };
  }[];

  /**
   * Optimization flag indicating when the data is dynamic (frequently updated)
   */
  get isDynamic() {
    return this._isDynamic;
  }
  private _isDynamic?: boolean;

  /**
   * Anything specific to gl state is stored here for this object.
   * Modifying anything in here outside of the framework probably will
   * break everything.
   */
  gl?: {
    /** Stores the buffer id for the attribute */
    bufferId: WebGLBuffer;
    /** Proxy communication with the GL context */
    proxy: GLProxy;

    /**
     * GL state information associated with uniform buffer and the specified
     * program. Each program has indices associated with uniform buffer names
     * and the binding points bound to them.
     */
    forProgram: Map<
      WebGLProgram,
      {
        programIndex: number;
        bindingIndex: number;
      }
    >;
  };

  /**
   * This is the packed buffer data for the uniform buffer.
   */
  data: Float32Array = new Float32Array(1);

  constructor(
    name: string,
    blockStructure: UniformBuffer["blockStructure"],
    dynamic?: boolean
  ) {
    this.name = name;
    this.blockStructure = blockStructure;
    this._isDynamic = dynamic;

    this.validateBlockStructureOrder(blockStructure);
  }

  /**
   * Ensures the input block structure is in ascending order of size. This also
   * computes the buffer information of each block member.
   */
  private validateBlockStructureOrder(
    blockStructure: UniformBuffer["blockStructure"]
  ) {
    // Validate the block structure
    const allSizes = [
      UniformSize.ONE,
      UniformSize.TWO,
      UniformSize.THREE,
      UniformSize.FOUR,
      UniformSize.MATRIX3,
      UniformSize.MATRIX4,
      UniformSize.VEC4_ARRAY,
    ];
    const allowedNextSize = new Set(allSizes);
    let bufferIndex = 0;
    let currentBlockIndex = 0;
    let previousBlock: UniformBuffer["blockStructure"][number] | null = null;

    for (let i = 0, iMax = blockStructure.length; i < iMax; i++) {
      const blockMember = blockStructure[i];
      // Any array type is Vec4 padding strategy
      const size = this.getBlockMemberSize(blockMember);

      if (!allowedNextSize.has(size)) {
        throw new Error(
          `Invalid block size: ${size} or block structure is not sorted least to greatest. Provided order: ${blockStructure
            .map((b) => `${b.name}: ${this.getBlockMemberSize(b)}`)
            .join(", ")}`
        );
      }

      // Remove all size types below the size that was just validated
      allSizes.slice(0, allSizes.indexOf(size));
      allSizes.forEach((size) => allowedNextSize.delete(size));

      const bufferInfo = {
        start: bufferIndex,
        pad: 0,
      };

      blockStructure[i].buffer = bufferInfo;

      switch (size) {
        case UniformSize.ONE:
          bufferIndex += 1;
          currentBlockIndex += 1;
          break;

        case UniformSize.TWO:
          if (
            (currentBlockIndex === 1 || currentBlockIndex === 3) &&
            previousBlock?.buffer
          ) {
            bufferIndex += 1;
            previousBlock.buffer.pad = 1;
            currentBlockIndex += 1;
          }
          if (currentBlockIndex === 0 || currentBlockIndex === 2) {
            bufferInfo.start = bufferIndex;
          } else {
            throw new Error(
              "Could not determine buffer info for block member due to invalid current block fill position"
            );
          }
          currentBlockIndex += 2;
          bufferIndex += 2;
          break;

        case UniformSize.THREE:
          if (currentBlockIndex !== 0 && previousBlock?.buffer) {
            const pad = 4 - currentBlockIndex;
            previousBlock.buffer.pad = pad;
            bufferIndex += pad;
            currentBlockIndex = 0;
          }

          bufferInfo.start = bufferIndex;
          bufferInfo.pad = 1;
          bufferIndex += 4;
          break;

        case UniformSize.FOUR:
          if (currentBlockIndex !== 0 && previousBlock?.buffer) {
            const pad = 4 - currentBlockIndex;
            previousBlock.buffer.pad = pad;
            bufferIndex += pad;
            currentBlockIndex = 0;
          }

          bufferInfo.start = bufferIndex;
          bufferIndex += 4;
          break;

        case UniformSize.MATRIX3:
          if (currentBlockIndex !== 0 && previousBlock?.buffer) {
            const pad = 4 - currentBlockIndex;
            previousBlock.buffer.pad = pad;
            bufferIndex += pad;
            currentBlockIndex = 0;
          }

          bufferInfo.start = bufferIndex;
          // Columns padded to 16 bytes
          // [1, 2, 3, 0]
          // [4, 5, 6, 0]
          // [7, 8, 9, 0]
          bufferIndex += 12;
          break;

        case UniformSize.MATRIX4:
          if (currentBlockIndex !== 0 && previousBlock?.buffer) {
            const pad = 4 - currentBlockIndex;
            previousBlock.buffer.pad = pad;
            bufferIndex += pad;
            currentBlockIndex = 0;
          }

          bufferInfo.start = bufferIndex;
          bufferIndex += 16;
          break;

        case UniformSize.VEC4_ARRAY:
          if (currentBlockIndex !== 0 && previousBlock?.buffer) {
            const pad = 4 - currentBlockIndex;
            previousBlock.buffer.pad = pad;
            bufferIndex += pad;
            currentBlockIndex = 0;
          }

          // This is an error that should never happen as the size can only ever
          // be an array when the arraySize is defined.
          if (!blockMember.arraySize) {
            throw new Error(
              `Block Structure must have an array size when using as an array: ${blockMember.name}`
            );
          }

          bufferInfo.start = bufferIndex;
          bufferIndex += 4 * blockMember.arraySize;
          break;
      }

      currentBlockIndex = currentBlockIndex % 4;
      previousBlock = blockMember;
    }

    // Initialize the data buffer that our block structure will be packed into.
    this.data = new Float32Array(bufferIndex);
    // Copy over the block structure to prevent mutation.
    this.blockStructure = blockStructure.map((block) => ({ ...block }));
  }

  /**
   * Computes the size of the provided block member.
   */
  private getBlockMemberSize(block: UniformBuffer["blockStructure"][number]) {
    return block.arraySize === void 0 ? block.size : UniformSize.VEC4_ARRAY;
  }

  /**
   * Destroys this resource and frees resources it consumes on the GPU.
   */
  destroy() {
    this.blockStructure = [];

    if (this.gl) {
      this.gl.proxy.disposeUniformBuffer(this);
    }
  }

  /**
   * Triggers a rebuild of the gl context for this attribute without destroying
   * any of the buffer data.
   */
  rebuild() {
    if (this.gl) {
      this.gl.proxy.disposeUniformBuffer(this);
    }
  }

  /**
   * Updates the data buffer with each block member that has an update flag set.
   */
  update() {
    this.blockStructure.forEach((blockMember) => {
      if (blockMember.update) {
        this.updateBlockMember(blockMember);
      }
    });
  }

  /**
   * This applies the data for the block member to the data buffer.
   */
  private updateBlockMember(
    blockMember: UniformBuffer["blockStructure"][number]
  ) {
    const { start } = blockMember.buffer ?? { start: 0, pad: 0 };
    const data = blockMember.data;
    let bufferIndex = start;
    const size = this.getBlockMemberSize(blockMember);

    switch (size) {
      case UniformSize.ONE:
        this.data[bufferIndex] = data[0];
        break;

      case UniformSize.TWO:
        this.data[bufferIndex] = data[0];
        this.data[bufferIndex + 1] = data[1];
        break;

      case UniformSize.THREE:
        this.data[bufferIndex] = data[0];
        this.data[bufferIndex + 1] = data[1];
        this.data[bufferIndex + 2] = data[2];
        break;

      case UniformSize.FOUR:
        this.data[bufferIndex] = data[0];
        this.data[bufferIndex + 1] = data[1];
        this.data[bufferIndex + 2] = data[2];
        this.data[bufferIndex + 3] = data[3];
        break;

      case UniformSize.MATRIX3:
        this.data[bufferIndex] = data[0];
        this.data[bufferIndex + 1] = data[1];
        this.data[bufferIndex + 2] = data[2];
        // this.data[bufferIndex + 3] = 0;
        this.data[bufferIndex + 4] = data[3];
        this.data[bufferIndex + 5] = data[4];
        this.data[bufferIndex + 6] = data[5];
        // this.data[bufferIndex + 7] = 0;
        this.data[bufferIndex + 8] = data[6];
        this.data[bufferIndex + 9] = data[7];
        this.data[bufferIndex + 10] = data[8];
        // this.data[bufferIndex + 11] = 0;
        break;

      case UniformSize.MATRIX4:
        this.data[bufferIndex] = data[0];
        this.data[bufferIndex + 1] = data[1];
        this.data[bufferIndex + 2] = data[2];
        this.data[bufferIndex + 3] = data[3];
        this.data[bufferIndex + 4] = data[4];
        this.data[bufferIndex + 5] = data[5];
        this.data[bufferIndex + 6] = data[6];
        this.data[bufferIndex + 7] = data[7];
        this.data[bufferIndex + 8] = data[8];
        this.data[bufferIndex + 9] = data[9];
        this.data[bufferIndex + 10] = data[10];
        this.data[bufferIndex + 11] = data[11];
        this.data[bufferIndex + 12] = data[12];
        this.data[bufferIndex + 13] = data[13];
        this.data[bufferIndex + 14] = data[14];
        this.data[bufferIndex + 15] = data[15];
        break;

      case UniformSize.VEC4_ARRAY: {
        const arraySize = blockMember.arraySize ?? 0;

        switch (blockMember.size) {
          case UniformSize.ONE:
            for (let i = 0, iMax = arraySize; i < iMax; i++, bufferIndex += 4) {
              this.data[bufferIndex] = data[i];
            }
            break;

          case UniformSize.TWO:
            for (
              let i = 0, iMax = arraySize;
              i < iMax;
              i += 2, bufferIndex += 4
            ) {
              this.data[bufferIndex] = data[i];
              this.data[bufferIndex + 1] = data[i + 1];
            }
            break;

          case UniformSize.THREE:
            for (
              let i = 0, iMax = arraySize;
              i < iMax;
              i += 3, bufferIndex += 4
            ) {
              this.data[bufferIndex] = data[i];
              this.data[bufferIndex + 1] = data[i + 1];
              this.data[bufferIndex + 2] = data[i + 2];
            }
            break;

          case UniformSize.FOUR:
            for (
              let i = 0, iMax = arraySize;
              i < iMax;
              i += 4, bufferIndex += 4
            ) {
              this.data[bufferIndex] = data[i];
              this.data[bufferIndex + 1] = data[i + 1];
              this.data[bufferIndex + 2] = data[i + 2];
              this.data[bufferIndex + 3] = data[i + 3];
            }
            break;

          case UniformSize.MATRIX3:
            for (
              let i = 0, iMax = arraySize;
              i < iMax;
              i += 9, bufferIndex += 12
            ) {
              this.data[bufferIndex] = data[i];
              this.data[bufferIndex + 1] = data[i + 1];
              this.data[bufferIndex + 2] = data[i + 2];
              // this.data[bufferIndex + 3] = 0;
              this.data[bufferIndex + 4] = data[i + 3];
              this.data[bufferIndex + 5] = data[i + 4];
              this.data[bufferIndex + 6] = data[i + 5];
              // this.data[bufferIndex + 7] = 0;
              this.data[bufferIndex + 8] = data[i + 6];
              this.data[bufferIndex + 9] = data[i + 7];
              this.data[bufferIndex + 10] = data[i + 8];
              // this.data[bufferIndex + 11] = 0;
            }
            break;

          case UniformSize.MATRIX4:
            for (
              let i = 0, iMax = arraySize;
              i < iMax;
              i += 16, bufferIndex += 16
            ) {
              this.data[bufferIndex] = data[i];
              this.data[bufferIndex + 1] = data[i + 1];
              this.data[bufferIndex + 2] = data[i + 2];
              this.data[bufferIndex + 3] = data[i + 3];
              this.data[bufferIndex + 4] = data[i + 4];
              this.data[bufferIndex + 5] = data[i + 5];
              this.data[bufferIndex + 6] = data[i + 6];
              this.data[bufferIndex + 7] = data[i + 7];
              this.data[bufferIndex + 8] = data[i + 8];
              this.data[bufferIndex + 9] = data[i + 9];
              this.data[bufferIndex + 10] = data[i + 10];
              this.data[bufferIndex + 11] = data[i + 11];
              this.data[bufferIndex + 12] = data[i + 12];
              this.data[bufferIndex + 13] = data[i + 13];
              this.data[bufferIndex + 14] = data[i + 14];
              this.data[bufferIndex + 15] = data[i + 15];
            }
            break;
        }
      }
    }
  }
}
