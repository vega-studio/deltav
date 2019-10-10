import { activeAttributeName } from '../../../constants';
import { Instance } from '../../../instance-provider/instance';
import { ShaderDeclarationStatements } from '../../../shaders/processing/base-shader-io-injection';
import { MetricsProcessing } from '../../../shaders/processing/metrics-processing';
import { ILayerProps, Layer } from '../../../surface/layer';
import { BaseIOExpansion } from '../../../surface/layer-processing/base-io-expansion';
import { IInstanceAttribute, IUniform, IVertexAttribute } from '../../../types';

const debugCtx = 'ActiveIOExpansion';

/**
 * This is a special case io expander that handles detecting the _active attribute
 * and properly injecting the _active handler in the destructuring phase.
 *
 * Any IO expansion that writes destructuring logic will have it's destructuring logic
 */
export class ActiveIOExpansion extends BaseIOExpansion {
  processAttributeDestructuring(
    _layer: Layer<Instance, ILayerProps<Instance>>,
    declarations: ShaderDeclarationStatements,
    _metrics: MetricsProcessing,
    _vertexAttributes: IVertexAttribute[],
    instanceAttributes: IInstanceAttribute<Instance>[],
    _uniforms: IUniform[]
  ): string {
    const out = '';

    // Find the active attribute. If it exists we inject our active attribute handler
    if (!instanceAttributes.find(attr => attr.name === activeAttributeName)) {
      return out;
    }

    // The final item in the destructuring will always be the active attribute handler to ensure elements
    // honor the active control
    this.setDeclaration(
      declarations,
      '__active_attribute_handler__',
      require('./fragments/active-attribute-handler.vs'),
      debugCtx
    );

    return out;
  }
}
