import {
    ICellData,
    ICommandService,
    IRange,
    IUniverInstanceService,
    IWorkbookData,
    LocaleType,
    Nullable,
    RANGE_TYPE,
    RedoCommand,
    Tools,
    UndoCommand,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../../services/selection-manager.service';
import { AddWorksheetMergeMutation } from '../../mutations/add-worksheet-merge.mutation';
import { MoveColsMutation, MoveRowsMutation } from '../../mutations/move-rows-cols.mutation';
import { RemoveWorksheetMergeMutation } from '../../mutations/remove-worksheet-merge.mutation';
import { SetSelectionsOperation } from '../../operations/selection.operation';
import {
    IMoveColsCommandParams,
    IMoveRowsCommandParams,
    MoveColsCommand,
    MoveRowsCommand,
} from '../move-rows-cols.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test move rows cols', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createMoveRowsColsTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);

        [
            MoveRowsCommand,
            MoveColsCommand,
            MoveRowsMutation,
            MoveColsMutation,
            RemoveWorksheetMergeMutation,
            AddWorksheetMergeMutation,
            SetSelectionsOperation,
        ].forEach((c) => commandService.registerCommand(c));

        const selectionManagerService = get(SelectionManagerService);
        selectionManagerService.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });
    });

    function selectRow(rowStart: number, rowEnd: number): void {
        const selectionManagerService = get(SelectionManagerService);
        const endColumn = getColCount() - 1;
        selectionManagerService.add([
            {
                range: { startRow: rowStart, startColumn: 0, endColumn, endRow: rowEnd, rangeType: RANGE_TYPE.ROW },
                primary: {
                    startRow: rowStart,
                    endRow: rowEnd,
                    startColumn: 0,
                    endColumn,
                    actualColumn: 0,
                    actualRow: rowStart,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            },
        ]);
    }

    function selectColumn(columnStart: number, columnEnd: number): void {
        const selectionManagerService = get(SelectionManagerService);
        const endRow = getRowCount() - 1;
        selectionManagerService.add([
            {
                range: {
                    startRow: 0,
                    startColumn: columnStart,
                    endColumn: columnEnd,
                    endRow,
                    rangeType: RANGE_TYPE.COLUMN,
                },
                primary: {
                    startRow: 0,
                    endRow,
                    startColumn: columnStart,
                    endColumn: columnEnd,
                    actualColumn: columnStart,
                    actualRow: 0,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            },
        ]);
    }

    function getRowCount(): number {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getRowCount();
    }

    function getColCount(): number {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getColumnCount();
    }

    function getCellInfo(row: number, col: number): Nullable<ICellData> {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getCellMatrix().getValue(row, col);
    }

    function getMergedInfo(row: number, col: number): Nullable<IRange> {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getMergedCells(row, col)?.[0];
    }

    function getRowHeight(row: number): number {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getRowHeight(row);
    }

    function getColWidth(col: number): number {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getColumnWidth(col);
    }

    function getCurrentSelection(): IRange {
        const selectionManagerService = get(SelectionManagerService);
        const currentSelection = selectionManagerService.getSelections();
        if (!currentSelection) {
            throw new Error('No current selection');
        }
        return currentSelection[0].range;
    }

    describe('Move rows', () => {
        it('Should move forward works', async () => {
            selectRow(18, 19);

            const result = await commandService.executeCommand<IMoveRowsCommandParams>(MoveRowsCommand.id, {
                fromRow: 18,
                toRow: 1,
            });
            expect(result).toEqual(true);
            expect(getCellInfo(0, 0)?.v).toEqual('A1');
            expect(getCellInfo(3, 1)?.v).toEqual('B2');
            expect(getMergedInfo(3, 1)).toEqual({ startRow: 3, endRow: 3, startColumn: 1, endColumn: 2 });
            expect(getMergedInfo(4, 1)).toEqual({ startRow: 4, endRow: 5, startColumn: 1, endColumn: 1 });
            expect(getRowHeight(1)).toBe(19);
            expect(getRowHeight(3)).toBe(30);
            expect(getCurrentSelection()).toEqual({
                startRow: 1,
                endRow: 2,
                startColumn: 0,
                endColumn: 19,
                rangeType: RANGE_TYPE.ROW,
            });

            const undoResult = await commandService.executeCommand(UndoCommand.id);
            expect(undoResult).toEqual(true);
            expect(getCellInfo(0, 0)?.v).toEqual('A1');
            expect(getCellInfo(1, 1)?.v).toEqual('B2');
            expect(getMergedInfo(1, 1)).toEqual({ startRow: 1, endRow: 1, startColumn: 1, endColumn: 2 });
            expect(getMergedInfo(2, 1)).toEqual({ startRow: 2, endRow: 3, startColumn: 1, endColumn: 1 });
            expect(getRowHeight(1)).toBe(30);
            expect(getCurrentSelection()).toEqual({
                startRow: 18,
                endRow: 19,
                startColumn: 0,
                endColumn: 19,
                rangeType: RANGE_TYPE.ROW,
            });

            const redoResult = await commandService.executeCommand(RedoCommand.id);
            expect(redoResult).toEqual(true);
            expect(getCellInfo(0, 0)?.v).toEqual('A1');
            expect(getCellInfo(3, 1)?.v).toEqual('B2');
            expect(getMergedInfo(3, 1)).toEqual({ startRow: 3, endRow: 3, startColumn: 1, endColumn: 2 });
            expect(getMergedInfo(4, 1)).toEqual({ startRow: 4, endRow: 5, startColumn: 1, endColumn: 1 });
            expect(getRowHeight(1)).toBe(19);
            expect(getRowHeight(3)).toBe(30);
            expect(getCurrentSelection()).toEqual({
                startRow: 1,
                endRow: 2,
                startColumn: 0,
                endColumn: 19,
                rangeType: RANGE_TYPE.ROW,
            });
        });

        it('Should forbidding moving when parts of merged cells are selected', async () => {
            selectRow(2, 2);

            const result = await commandService.executeCommand<IMoveRowsCommandParams>(MoveRowsCommand.id, {
                fromRow: 2,
                toRow: 1,
            });
            expect(result).toBeFalsy();
        });

        it('Should forbidding moving when rows are moved across a merged cell', async () => {
            selectRow(18, 19);

            const result = await commandService.executeCommand<IMoveRowsCommandParams>(MoveRowsCommand.id, {
                fromRow: 18,
                toRow: 3,
            });
            expect(result).toBeFalsy();

            const result2 = await commandService.executeCommand<IMoveRowsCommandParams>(MoveRowsCommand.id, {
                fromRow: 18,
                toRow: 4,
            });
            expect(result2).toBeTruthy();
        });
    });

    describe('Move cols', () => {
        it('Should move forward works', async () => {
            selectColumn(18, 19);

            const result = await commandService.executeCommand<IMoveColsCommandParams>(MoveColsCommand.id, {
                fromCol: 18,
                toCol: 1,
            });
            expect(result).toEqual(true);
            expect(getCellInfo(0, 0)?.v).toEqual('A1');
            expect(getCellInfo(1, 3)?.v).toEqual('B2');
            expect(getMergedInfo(1, 3)).toEqual({ startRow: 1, endRow: 1, startColumn: 3, endColumn: 4 });
            expect(getMergedInfo(2, 3)).toEqual({ startRow: 2, endRow: 3, startColumn: 3, endColumn: 3 });
            expect(getColWidth(1)).toBe(73);
            expect(getColWidth(3)).toBe(30);
            expect(getCurrentSelection()).toEqual({
                startRow: 0,
                endRow: 19,
                startColumn: 1,
                endColumn: 2,
                rangeType: RANGE_TYPE.COLUMN,
            });

            const undoResult = await commandService.executeCommand(UndoCommand.id);
            expect(undoResult).toEqual(true);
            expect(getCellInfo(0, 0)?.v).toEqual('A1');
            expect(getCellInfo(1, 1)?.v).toEqual('B2');
            expect(getMergedInfo(1, 1)).toEqual({ startRow: 1, endRow: 1, startColumn: 1, endColumn: 2 });
            expect(getMergedInfo(2, 1)).toEqual({ startRow: 2, endRow: 3, startColumn: 1, endColumn: 1 });
            expect(getColWidth(1)).toBe(30);
            expect(getCurrentSelection()).toEqual({
                startRow: 0,
                endRow: 19,
                startColumn: 18,
                endColumn: 19,
                rangeType: RANGE_TYPE.COLUMN,
            });

            const redoResult = await commandService.executeCommand(RedoCommand.id);
            expect(redoResult).toEqual(true);
            expect(getCellInfo(0, 0)?.v).toEqual('A1');
            expect(getCellInfo(1, 3)?.v).toEqual('B2');
            expect(getMergedInfo(1, 3)).toEqual({ startRow: 1, endRow: 1, startColumn: 3, endColumn: 4 });
            expect(getMergedInfo(2, 3)).toEqual({ startRow: 2, endRow: 3, startColumn: 3, endColumn: 3 });
            expect(getColWidth(1)).toBe(73);
            expect(getColWidth(3)).toBe(30);
            expect(getCurrentSelection()).toEqual({
                startRow: 0,
                endRow: 19,
                startColumn: 1,
                endColumn: 2,
                rangeType: RANGE_TYPE.COLUMN,
            });
        });

        it('Should forbidding moving when parts of merged cells are selected', async () => {
            selectColumn(2, 2);

            const result = await commandService.executeCommand<IMoveColsCommandParams>(MoveColsCommand.id, {
                fromCol: 2,
                toCol: 1,
            });
            expect(result).toBeFalsy();
        });

        it('Should forbidding moving when columns are moved across a merged cell', async () => {
            selectColumn(18, 19);

            const result = await commandService.executeCommand<IMoveColsCommandParams>(MoveColsCommand.id, {
                fromCol: 18,
                toCol: 2,
            });
            expect(result).toBeFalsy();

            const result2 = await commandService.executeCommand<IMoveColsCommandParams>(MoveColsCommand.id, {
                fromCol: 18,
                toCol: 3,
            });
            expect(result2).toBeTruthy();
        });
    });
});

const TEST_ROWS_COLS_MOVE_DEMO: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        // 1
        //  2-3-
        // 	4
        //  |
        sheet1: {
            id: 'sheet1',
            cellData: {
                '0': {
                    '0': {
                        v: 'A1',
                        s: 's1',
                    },
                },
                '1': {
                    '1': {
                        v: 'B2',
                        s: 's2',
                    },
                    '4': {
                        v: 'E2',
                        s: 's3',
                    },
                },
                '2': {
                    '1': {
                        v: 'B3',
                        s: 's4',
                    },
                },
            },
            mergeData: [
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 2 },
                {
                    startRow: 1,
                    endRow: 1,
                    startColumn: 3,
                    endColumn: 4,
                },
                {
                    startRow: 2,
                    endRow: 3,
                    startColumn: 1,
                    endColumn: 1,
                },
            ],
            rowData: { '1': { h: 30 } },
            columnData: { '1': { w: 30 } },
            rowCount: 20,
            columnCount: 20,
        },
    },
    locale: LocaleType.EN_US,
    name: '',
    sheetOrder: [],
    styles: {},
};

function createMoveRowsColsTestBed() {
    return createCommandTestBed(Tools.deepClone(TEST_ROWS_COLS_MOVE_DEMO));
}
