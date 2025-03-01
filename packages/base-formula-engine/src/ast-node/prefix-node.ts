import { Nullable } from '@univerjs/core';
import { IAccessor, Inject, Injector } from '@wendellhu/redi';

import { LexerNode } from '../analysis/lexer-node';
import { ErrorType } from '../basics/error-type';
import { FUNCTION_NAMES } from '../basics/function';
import { prefixToken } from '../basics/token';
import { BaseFunction } from '../functions/base-function';
import { ErrorValueObject } from '../other-object/error-value-object';
import { BaseReferenceObject, FunctionVariantType } from '../reference-object/base-reference-object';
import { IFunctionService } from '../services/function.service';
import { IFormulaRuntimeService } from '../services/runtime.service';
import { NumberValueObject } from '../value-object/primitive-object';
import { BaseAstNode, ErrorNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

export class PrefixNode extends BaseAstNode {
    constructor(
        private _accessor: IAccessor,
        private _operatorString: string,
        private _functionExecutor?: Nullable<BaseFunction>
    ) {
        super(_operatorString);
    }

    override get nodeType() {
        return NodeType.PREFIX;
    }

    override execute() {
        const children = this.getChildren();
        const value = children[0].getValue();
        let result: FunctionVariantType;
        if (value == null) {
            throw new Error('object is null');
        }
        if (this._operatorString === prefixToken.MINUS) {
            result = this._functionExecutor!.calculate(new NumberValueObject(0), value) as FunctionVariantType;
        } else if (this._operatorString === prefixToken.AT) {
            result = this._handlerAT(value);
        } else {
            result = ErrorValueObject.create(ErrorType.VALUE);
        }
        this.setValue(result);
    }

    private _handlerAT(value: FunctionVariantType) {
        if (!value.isReferenceObject()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const currentValue = value as BaseReferenceObject;

        if (currentValue.isCell()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const runtimeService = this._accessor.get(IFormulaRuntimeService);

        const currentRow = runtimeService.currentRow || 0;
        const currentColumn = runtimeService.currentColumn || 0;

        // @ projection to current
        if (currentValue.isRow()) {
            return currentValue.getCellByColumn(currentColumn);
        }
        if (currentValue.isColumn()) {
            return currentValue.getCellByRow(currentRow);
        }
        if (currentValue.isRange()) {
            return currentValue.getCellByPosition();
        }
        if (currentValue.isTable()) {
            return currentValue.getCellByPosition();
        }

        return ErrorValueObject.create(ErrorType.VALUE);
    }
}

export class PrefixNodeFactory extends BaseAstNodeFactory {
    constructor(
        @IFunctionService private readonly _functionService: IFunctionService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
    }

    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.PREFIX) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        if (!(param instanceof LexerNode)) {
            return;
        }

        const token = param.getToken();
        const tokenTrim = token.trim();

        if (tokenTrim.charAt(0) === '"' && tokenTrim.charAt(tokenTrim.length - 1) === '"') {
            return;
        }

        let functionName = '';
        if (tokenTrim === prefixToken.MINUS) {
            functionName = FUNCTION_NAMES.MINUS;
        } else if (tokenTrim === prefixToken.AT) {
            return new PrefixNode(this._injector, tokenTrim);
        } else {
            return;
        }

        const functionExecutor = this._functionService.getExecutor(functionName);
        if (!functionExecutor) {
            console.error(`No function ${token}`);
            return ErrorNode.create(ErrorType.NAME);
        }
        return new PrefixNode(this._injector, tokenTrim, functionExecutor);
    }
}
