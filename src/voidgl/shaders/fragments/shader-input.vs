// When instancing is enabled, it causes a major list of uniforms to be generated
// it also generates a massive search tree to retrieve the correct unforms in question.
${instanceUniformDeclarations}

// This is the uniforms provided by the system along with the uniforms created by the layer
${layerUniforms}

// This is the attributes generated for vertex attributes
${vertexAttributes}

// This is the methods and set up needed to retrieve a block of data for an instance
${instanceDataRetrieval}
