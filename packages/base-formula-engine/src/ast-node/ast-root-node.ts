import { LexerNode } from '../analysis/lexer-node';
import { DEFAULT_TOKEN_TYPE_ROOT } from '../basics/token-type';
import { BaseAstNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

export class AstRootNode extends BaseAstNode {
    override get nodeType() {
        return NodeType.ROOT;
    }

    override execute() {
        const children = this.getChildren();
        const node = children[0];
        // if (node.nodeType === NodeType.FUNCTION) {
        //     await node.executeAsync(interpreterCalculateProps);
        // } else {
        //     node.execute(interpreterCalculateProps);
        // }
        this.setValue(node.getValue());
        // return Promise.resolve(AstNodePromiseType.SUCCESS);
    }
}
// export class AstVariantNode extends BaseAstNode {
//     get nodeType() {
//         return NodeType.Variant;
//     }

//     async executeAsync(interpreterCalculateProps: IInterpreterCalculateProps) {
//         const children = this.getChildren();
//         const childrenCount = children.length;
//         for (let i = 0; i < childrenCount; i++) {
//             const node = children[i];
//             if (node.nodeType === NodeType.FUNCTION) {
//                 await node.executeAsync(interpreterCalculateProps);
//             } else {
//                 node.execute(interpreterCalculateProps);
//             }
//         }

//         return Promise.resolve(AstNodePromiseType.SUCCESS);
//     }
// }

export class AstRootNodeFactory extends BaseAstNodeFactory {
    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.ROOT) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        if (!(param instanceof LexerNode)) {
            return;
        }
        const token = param.getToken();
        if (token === DEFAULT_TOKEN_TYPE_ROOT) {
            return new AstRootNode(DEFAULT_TOKEN_TYPE_ROOT);
        }
    }
}

// FORMULA_AST_NODE_REGISTRY.add(new AstRootNodeFactory());
