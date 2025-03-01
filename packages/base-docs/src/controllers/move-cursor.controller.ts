import {
    DocumentSkeleton,
    IDocumentSkeletonLine,
    IDocumentSkeletonSpan,
    INodePosition,
    INodeSearch,
    IRenderManagerService,
    ITextSelectionRenderManager,
    NodePositionConvertToCursor,
    RANGE_DIRECTION,
} from '@univerjs/base-render';
import {
    Direction,
    Disposable,
    ICommandInfo,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { Subscription } from 'rxjs';

import { getDocObject } from '../basics/component-tools';
import {
    IMoveCursorOperationParams,
    MoveCursorOperation,
    MoveSelectionOperation,
} from '../commands/operations/cursor.operation';
import { DocSkeletonManagerService } from '../services/doc-skeleton-manager.service';
import { TextSelectionManagerService } from '../services/text-selection-manager.service';

@OnLifecycle(LifecycleStages.Rendered, MoveCursorController)
export class MoveCursorController extends Disposable {
    private _onInputSubscription: Nullable<Subscription>;

    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    override dispose(): void {
        this._onInputSubscription?.unsubscribe();
    }

    private _initialize() {}

    private _commandExecutedListener() {
        const updateCommandList = [MoveCursorOperation.id, MoveSelectionOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!updateCommandList.includes(command.id)) {
                    return;
                }

                const param = command.params as IMoveCursorOperationParams;

                switch (command.id) {
                    case MoveCursorOperation.id: {
                        return this._handleMoveCursor(param.direction);
                    }

                    case MoveSelectionOperation.id: {
                        return this._handleShiftMoveSelection(param.direction);
                    }

                    default: {
                        throw new Error('Unknown command');
                    }
                }
            })
        );
    }

    private _handleShiftMoveSelection(direction: Direction) {
        const activeRange = this._textSelectionRenderManager.getActiveRange();
        const allRanges = this._textSelectionRenderManager.getAllTextRanges();
        const docDataModel = this._currentUniverService.getCurrentUniverDocInstance();

        const skeleton = this._docSkeletonManagerService.getCurrent()?.skeleton;

        const docObject = this._getDocObject();

        if (activeRange == null || skeleton == null || docObject == null) {
            return;
        }

        const { startOffset, endOffset, style, collapsed, direction: rangeDirection } = activeRange;

        if (allRanges.length > 1) {
            let min = Infinity;
            let max = -Infinity;

            for (const range of allRanges) {
                min = Math.min(min, range.startOffset!);
                max = Math.max(max, range.endOffset!);
            }

            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: direction === Direction.LEFT || direction === Direction.UP ? max : min,
                    endOffset: direction === Direction.LEFT || direction === Direction.UP ? min : max,
                    collapsed: false,
                    style,
                },
            ]);

            return;
        }

        const anchorOffset = collapsed
            ? startOffset
            : rangeDirection === RANGE_DIRECTION.FORWARD
              ? startOffset
              : endOffset;

        let focusOffset = collapsed ? endOffset : rangeDirection === RANGE_DIRECTION.FORWARD ? endOffset : startOffset;
        const dataStreamLength = docDataModel.getBody()!.dataStream.length ?? Infinity;

        if (direction === Direction.LEFT || direction === Direction.RIGHT) {
            focusOffset = direction === Direction.RIGHT ? ++focusOffset : --focusOffset;

            focusOffset = Math.min(dataStreamLength - 2, Math.max(0, focusOffset));

            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: anchorOffset,
                    endOffset: focusOffset,
                    collapsed: anchorOffset === focusOffset,
                    style,
                },
            ]);
        } else {
            const focusSpan = skeleton.findNodeByCharIndex(focusOffset);

            const documentOffsetConfig = docObject.document.getOffsetConfig();

            const newPos = this._getTopOrBottomPosition(skeleton, focusSpan, direction === Direction.DOWN);
            if (newPos == null) {
                // move selection
                const newFocusOffset = direction === Direction.UP ? 0 : dataStreamLength - 2;

                if (newFocusOffset === focusOffset) {
                    return;
                }

                this._textSelectionManagerService.replaceTextRanges([
                    {
                        startOffset: anchorOffset,
                        endOffset: newFocusOffset,
                        collapsed: anchorOffset === newFocusOffset,
                        style,
                    },
                ]);

                return;
            }

            const newActiveRange = new NodePositionConvertToCursor(documentOffsetConfig, skeleton).getRangePointData(
                newPos,
                newPos
            ).cursorList[0];

            // move selection
            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: anchorOffset,
                    endOffset: newActiveRange.endOffset,
                    collapsed: anchorOffset === newActiveRange.endOffset,
                    style,
                },
            ]);
        }
    }

    private _handleMoveCursor(direction: Direction) {
        const activeRange = this._textSelectionRenderManager.getActiveRange();
        const allRanges = this._textSelectionRenderManager.getAllTextRanges();
        const docDataModel = this._currentUniverService.getCurrentUniverDocInstance();

        const skeleton = this._docSkeletonManagerService.getCurrent()?.skeleton;

        const docObject = this._getDocObject();

        if (activeRange == null || skeleton == null || docObject == null) {
            return;
        }

        const { startOffset, endOffset, style, collapsed } = activeRange;
        const dataStreamLength = docDataModel.getBody()!.dataStream.length ?? Infinity;

        if (direction === Direction.LEFT || direction === Direction.RIGHT) {
            let cursor;

            if (!activeRange.collapsed || allRanges.length > 1) {
                let min = Infinity;
                let max = -Infinity;

                for (const range of allRanges) {
                    min = Math.min(min, range.startOffset!);
                    max = Math.max(max, range.endOffset!);
                }

                cursor = direction === Direction.LEFT ? min : max;
            } else {
                if (direction === Direction.LEFT) {
                    cursor = Math.max(0, startOffset - 1);
                } else {
                    // -1 because the length of the string will be 1 larger than the index, and the reason for subtracting another 1 is because it ends in \n
                    cursor = Math.min(dataStreamLength - 2, endOffset + 1);
                }
            }

            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: cursor,
                    endOffset: cursor,
                    collapsed: true,
                    style,
                },
            ]);
        } else {
            const startNode = skeleton.findNodeByCharIndex(startOffset);
            const endNode = skeleton.findNodeByCharIndex(endOffset);

            const documentOffsetConfig = docObject.document.getOffsetConfig();

            const newPos = this._getTopOrBottomPosition(
                skeleton,
                direction === Direction.UP ? startNode : endNode,
                direction === Direction.DOWN
            );

            if (newPos == null) {
                let cursor;

                if (collapsed) {
                    // Move cursor to the beginning place when arrow up at first line,
                    // and move cursor to the end place when arrow down at last line.
                    cursor = direction === Direction.UP ? 0 : dataStreamLength - 2;
                } else {
                    // Handle at the startOffset at first line when arrow up,
                    // and endOffset at the last line when arrow down.
                    cursor = direction === Direction.UP ? startOffset : endOffset;
                }

                this._textSelectionManagerService.replaceTextRanges([
                    {
                        startOffset: cursor,
                        endOffset: cursor,
                        collapsed: true,
                        style,
                    },
                ]);
                return;
            }

            const newActiveRange = new NodePositionConvertToCursor(documentOffsetConfig, skeleton).getRangePointData(
                newPos,
                newPos
            ).cursorList[0];

            // move selection
            this._textSelectionManagerService.replaceTextRanges([
                {
                    ...newActiveRange,
                    style,
                },
            ]);
        }
    }

    private _getTopOrBottomPosition(
        docSkeleton: DocumentSkeleton,
        span: Nullable<IDocumentSkeletonSpan>,
        direction: boolean
    ): Nullable<INodePosition> {
        if (span == null) {
            return;
        }

        const offsetLeft = this._getSpanLeftOffsetInLine(span);

        const line = this._getNextOrPrevLine(span, direction);

        if (line == null) {
            return;
        }

        const position: Nullable<INodeSearch> = this._matchPositionByLeftOffset(docSkeleton, line, offsetLeft);

        if (position == null) {
            return;
        }

        // TODO: @JOCS, hardcode isBack to true, `_getTopOrBottomPosition` need to rewrite.
        return { ...position, isBack: true };
    }

    private _getSpanLeftOffsetInLine(span: IDocumentSkeletonSpan) {
        const divide = span.parent;

        if (divide == null) {
            return -Infinity;
        }

        const divideLeft = divide.left;

        const { left } = span;

        const start = divideLeft + left;

        return start;
    }

    private _matchPositionByLeftOffset(docSkeleton: DocumentSkeleton, line: IDocumentSkeletonLine, offsetLeft: number) {
        const nearestNode: {
            span?: IDocumentSkeletonSpan;
            distance: number;
        } = {
            distance: Infinity,
        };

        for (const divide of line.divides) {
            const divideLeft = divide.left;

            for (const span of divide.spanGroup) {
                const { left } = span;
                const leftSide = divideLeft + left;

                const distance = Math.abs(offsetLeft - leftSide);

                if (distance < nearestNode.distance) {
                    nearestNode.span = span;
                    nearestNode.distance = distance;
                }
            }
        }

        if (nearestNode.span == null) {
            return;
        }

        return docSkeleton.findPositionBySpan(nearestNode.span);
    }

    private _getNextOrPrevLine(span: IDocumentSkeletonSpan, direction: boolean) {
        const divide = span.parent;
        if (divide == null) {
            return;
        }

        const line = divide.parent;
        if (line == null) {
            return;
        }

        const column = line.parent;
        if (column == null) {
            return;
        }

        const currentLineIndex = column.lines.indexOf(line);

        if (currentLineIndex === -1) {
            return;
        }

        let newLine: IDocumentSkeletonLine;

        if (direction === true) {
            newLine = column.lines[currentLineIndex + 1];
        } else {
            newLine = column.lines[currentLineIndex - 1];
        }

        if (newLine != null) {
            return newLine;
        }

        const section = column.parent;

        if (section == null) {
            return;
        }

        const currentColumnIndex = section.columns.indexOf(column);

        if (currentColumnIndex === -1) {
            return;
        }

        if (direction === true) {
            newLine = section.columns[currentColumnIndex + 1]?.lines[0];
        } else {
            const prevColumnLines = section.columns?.[currentColumnIndex - 1]?.lines;
            newLine = prevColumnLines?.[prevColumnLines.length - 1];
        }

        if (newLine != null) {
            return newLine;
        }

        const page = section.parent;

        if (page == null) {
            return;
        }

        const currentSectionIndex = page.sections.indexOf(section);

        if (currentSectionIndex === -1) {
            return;
        }

        if (direction === true) {
            newLine = page.sections[currentSectionIndex - 1]?.columns[0]?.lines[0];
        } else {
            const prevColumns = page.sections?.[currentSectionIndex - 1]?.columns;
            const column = prevColumns?.[prevColumns.length - 1];
            const prevColumnLines = column?.lines;
            newLine = prevColumnLines?.[prevColumnLines.length - 1];
        }

        if (newLine != null) {
            return newLine;
        }

        const skeleton = page.parent;

        if (skeleton == null) {
            return;
        }

        const currentPageIndex = skeleton.pages.indexOf(page);

        if (currentPageIndex === -1) {
            return;
        }

        if (direction === true) {
            newLine = skeleton.pages[currentPageIndex + 1]?.sections[0]?.columns[0]?.lines[0];
        } else {
            const prevSections = skeleton.pages[currentPageIndex - 1]?.sections;
            if (prevSections == null) {
                return;
            }
            const prevColumns = prevSections[prevSections.length - 1]?.columns;
            const column = prevColumns[prevColumns.length - 1];
            const prevColumnLines = column?.lines;
            newLine = prevColumnLines[prevColumnLines.length - 1];
        }

        if (newLine != null) {
            return newLine;
        }
    }

    private _getDocObject() {
        return getDocObject(this._currentUniverService, this._renderManagerService);
    }
}
