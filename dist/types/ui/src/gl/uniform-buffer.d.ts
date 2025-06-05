import type { GLProxy } from "./gl-proxy.js";
export declare class UniformBuffer {
    /**
     * Defines the padding structure of the uniform buffer. This defines the
     * alignment of the buffer. We currently ONLY support std140.
     */
    paddingStructure: "std140";
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
    private blockStructure;
    /**
     * Optimization flag indicating when the data is dynamic (frequently updated)
     */
    get isDynamic(): boolean | undefined;
    private _isDynamic?;
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
        forProgram: Map<WebGLProgram, {
            programIndex: number;
            bindingIndex: number;
        }>;
    };
    /**
     * This is the packed buffer data for the uniform buffer.
     */
    data: Float32Array;
    constructor(name: string, blockStructure: UniformBuffer["blockStructure"], dynamic?: boolean);
    /**
     * Ensures the input block structure is in ascending order of size. This also
     * computes the buffer information of each block member.
     */
    private validateBlockStructureOrder;
    /**
     * Computes the size of the provided block member.
     */
    private getBlockMemberSize;
    /**
     * Destroys this resource and frees resources it consumes on the GPU.
     */
    destroy(): void;
    /**
     * Triggers a rebuild of the gl context for this attribute without destroying
     * any of the buffer data.
     */
    rebuild(): void;
    /**
     * Updates the data buffer with each block member that has an update flag set.
     */
    update(): void;
    /**
     * This applies the data for the block member to the data buffer.
     */
    private updateBlockMember;
}
