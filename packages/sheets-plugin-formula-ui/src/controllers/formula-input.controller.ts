import { FormulaEngineService, matchToken, sequenceNodeType } from '@univerjs/base-formula-engine';
import { DeviceInputEventType, IRenderManagerService, ITextSelectionRenderManager } from '@univerjs/base-render';
import { KeyCode } from '@univerjs/base-ui';
import {
    AbsoluteRefType,
    deserializeRangeWithSheet,
    Disposable,
    ICommandInfo,
    ICommandService,
    LifecycleStages,
    OnLifecycle,
    serializeRange,
    toDisposable,
} from '@univerjs/core';
import { EditorBridgeService, getEditorObject, IEditorBridgeService } from '@univerjs/ui-plugin-sheets';
import { Inject } from '@wendellhu/redi';

import { ReferenceAbsoluteOperation } from '../commands/operations/reference-absolute.operation';
import { IFormulaInputService } from '../services/formula-input.service';

@OnLifecycle(LifecycleStages.Steady, FormulaInputController)
export class FormulaInputController extends Disposable {
    private _userCursorMove: boolean = false;

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(IEditorBridgeService) private readonly _editorBridgeService: EditorBridgeService,
        @Inject(FormulaEngineService) private readonly _formulaEngineService: FormulaEngineService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IFormulaInputService private readonly _formulaInputService: IFormulaInputService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();

        this._initialEditorInputChange();

        this._userMouseListener();

        this._inputFormulaListener();
    }

    private _initialEditorInputChange() {
        this.disposeWithMe(
            toDisposable(
                this._textSelectionRenderManager.onInputBefore$.subscribe((param) => {
                    const e = param?.event as KeyboardEvent;
                    if (e == null) {
                        return;
                    }
                    if (e.which !== KeyCode.F4) {
                        this._userCursorMove = false;
                    }
                })
            )
        );
    }

    private _userMouseListener() {
        const editorObject = this._getEditorObject();

        if (editorObject == null) {
            return;
        }

        const { document: documentComponent } = editorObject;
        this.disposeWithMe(
            toDisposable(
                documentComponent.onPointerDownObserver.add(() => {
                    this._userCursorMove = true;
                })
            )
        );
    }

    private _inputFormulaListener() {
        this.disposeWithMe(
            toDisposable(
                this._formulaInputService.inputFormula$.subscribe((formulaString) => {
                    const visibleState = this._editorBridgeService.isVisible();
                    if (visibleState.visible === false) {
                        this._editorBridgeService.changeVisible({
                            visible: true,
                            eventType: DeviceInputEventType.Dblclick,
                        });
                    }

                    const dataStream = `=${formulaString}(`;

                    const lastSequenceNodes = this._formulaEngineService.buildSequenceNodes(dataStream) || [];

                    this._formulaInputService.setSequenceNodes(lastSequenceNodes);

                    this._formulaInputService.syncToEditor(dataStream.length - 1);
                })
            )
        );
    }

    private _changeRefString() {
        const activeRange = this._textSelectionRenderManager.getActiveRange();

        if (activeRange == null) {
            return;
        }

        const { startOffset } = activeRange;

        const strIndex = startOffset - 2;

        const nodeIndex = this._formulaInputService.getCurrentSequenceNodeIndex(strIndex);

        const node = this._formulaInputService.getCurrentSequenceNodeByIndex(nodeIndex);

        if (node == null || typeof node === 'string' || node.nodeType !== sequenceNodeType.REFERENCE) {
            return;
        }

        const tokenArray = node.token.split('!');

        let token = node.token;

        if (tokenArray.length > 1) {
            token = tokenArray[tokenArray.length - 1];
        }

        let unitIDAndSheetName = '';

        for (let i = 0, len = tokenArray.length; i < len - 1; i++) {
            unitIDAndSheetName += tokenArray[i];
        }

        let finalToken = token;
        if (token.indexOf(matchToken.COLON) > -1) {
            if (!this._userCursorMove) {
                finalToken = this._changeRangeRef(token);
            } else {
                const refStringSplit = token.split(matchToken.COLON);
                const prefix = refStringSplit[0];
                const suffix = refStringSplit[1];
                const relativeIndex = strIndex - node.startIndex;

                if (relativeIndex <= prefix.length) {
                    finalToken = this._changeSingleRef(prefix) + matchToken.COLON + suffix;
                } else {
                    finalToken = prefix + matchToken.COLON + this._changeSingleRef(suffix);
                }
            }
        } else {
            finalToken = this._changeSingleRef(token);
        }

        finalToken = unitIDAndSheetName + finalToken;

        const difference = finalToken.length - node.token.length;

        this._formulaInputService.updateSequenceRef(nodeIndex, finalToken);

        this._formulaInputService.syncToEditor(strIndex + difference + 1);
    }

    private _changeRangeRef(token: string) {
        const range = deserializeRangeWithSheet(token).range;
        let resultToken = '';
        if (range.startAbsoluteRefType === AbsoluteRefType.NONE || range.startAbsoluteRefType == null) {
            range.startAbsoluteRefType = AbsoluteRefType.ALL;
            range.endAbsoluteRefType = AbsoluteRefType.ALL;
        } else {
            range.startAbsoluteRefType = AbsoluteRefType.NONE;
            range.endAbsoluteRefType = AbsoluteRefType.NONE;
        }
        resultToken = serializeRange(range);
        return resultToken;
    }

    private _changeSingleRef(token: string) {
        const range = deserializeRangeWithSheet(token).range;
        const type = range.startAbsoluteRefType;
        let resultToken = '';
        if (type === AbsoluteRefType.NONE || type == null) {
            range.startAbsoluteRefType = AbsoluteRefType.ALL;
            range.endAbsoluteRefType = AbsoluteRefType.ALL;
        } else if (type === AbsoluteRefType.ALL) {
            range.startAbsoluteRefType = AbsoluteRefType.ROW;
            range.endAbsoluteRefType = AbsoluteRefType.ROW;
        } else if (type === AbsoluteRefType.ROW) {
            range.startAbsoluteRefType = AbsoluteRefType.COLUMN;
            range.endAbsoluteRefType = AbsoluteRefType.COLUMN;
        } else {
            range.startAbsoluteRefType = AbsoluteRefType.NONE;
            range.endAbsoluteRefType = AbsoluteRefType.NONE;
        }

        resultToken = serializeRange(range);
        return resultToken;
    }

    private _commandExecutedListener() {
        // Listen to document edits to refresh the size of the editor.
        const updateCommandList = [ReferenceAbsoluteOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!updateCommandList.includes(command.id)) {
                    return;
                }

                this._changeRefString();
            })
        );
    }

    private _getEditorObject() {
        return getEditorObject(this._editorBridgeService.getCurrentEditorId(), this._renderManagerService);
    }
}
