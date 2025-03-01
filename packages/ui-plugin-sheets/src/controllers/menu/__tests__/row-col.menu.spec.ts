import {
    NORMAL_SELECTION_PLUGIN_NAME,
    SelectionManagerService,
    SetColHiddenCommand,
    SetColHiddenMutation,
    SetColVisibleMutation,
    SetRowHiddenCommand,
    SetRowHiddenMutation,
    SetRowVisibleMutation,
    SetSelectedColsVisibleCommand,
    SetSelectedRowsVisibleCommand,
    SetSelectionsOperation,
    SetSpecificColsVisibleCommand,
    SetSpecificRowsVisibleCommand,
} from '@univerjs/base-sheets';
import { ISetSelectionsOperationParams } from '@univerjs/base-sheets/commands/operations/selection.operation.js';
import {
    DisposableCollection,
    ICommandService,
    IUniverInstanceService,
    RANGE_TYPE,
    toDisposable,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ShowColMenuItemFactory, ShowRowMenuItemFactory } from '../menu';
import { createMenuTestBed } from './create-menu-test-bed';

describe('Test row col menu items', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let disposableCollection: DisposableCollection;

    beforeEach(() => {
        const testBed = createMenuTestBed();

        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);

        [
            SetRowHiddenCommand,
            SetRowHiddenMutation,
            SetColHiddenCommand,
            SetColHiddenMutation,
            SetSelectedRowsVisibleCommand,
            SetSelectedColsVisibleCommand,
            SetRowVisibleMutation,
            SetColVisibleMutation,
            SetSelectionsOperation,
            SetSpecificColsVisibleCommand,
            SetSpecificRowsVisibleCommand,
        ].forEach((command) => {
            commandService.registerCommand(command);
        });

        disposableCollection = new DisposableCollection();

        const selectionManager = get(SelectionManagerService);
        selectionManager.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });
    });

    afterEach(() => univer.dispose());

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

    async function selectRow(rowStart: number, rowEnd: number): Promise<boolean> {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const endColumn = getColCount() - 1;
        return commandService.executeCommand<ISetSelectionsOperationParams, boolean>(SetSelectionsOperation.id, {
            workbookId: workbook.getUnitId(),
            worksheetId: worksheet.getSheetId(),
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [
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
            ],
        });
    }

    async function selectColumn(columnStart: number, columnEnd: number): Promise<boolean> {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const endRow = getRowCount() - 1;
        return commandService.executeCommand<ISetSelectionsOperationParams, boolean>(SetSelectionsOperation.id, {
            workbookId: workbook.getUnitId(),
            worksheetId: worksheet.getSheetId(),
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [
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
            ],
        });
    }

    describe('Test row col hide/unhide menu items', () => {
        it('Should only show "Show Hidden Rows" when there are hidden rows in current selections', async () => {
            let hidden = false;

            const menuItem = get(Injector).invoke(ShowRowMenuItemFactory);
            disposableCollection.add(toDisposable(menuItem.hidden$!.subscribe((v: boolean) => (hidden = v))));
            expect(hidden).toBeTruthy();

            await selectRow(1, 1);
            await commandService.executeCommand(SetRowHiddenCommand.id);
            await selectRow(0, 2);
            expect(hidden).toBeFalsy();

            await commandService.executeCommand(SetSelectedRowsVisibleCommand.id);
            expect(hidden).toBeTruthy();
        });

        it('Should only show "Show Hidden Cols" when there are hidden cols in current selections', async () => {
            let hidden = false;

            const menuItem = get(Injector).invoke(ShowColMenuItemFactory);
            disposableCollection.add(toDisposable(menuItem.hidden$!.subscribe((v: boolean) => (hidden = v))));
            expect(hidden).toBeTruthy();

            await selectColumn(1, 1);
            await commandService.executeCommand(SetColHiddenCommand.id);
            await selectColumn(0, 2);
            expect(hidden).toBeFalsy();

            await commandService.executeCommand(SetSelectedColsVisibleCommand.id);
            expect(hidden).toBeTruthy();
        });
    });
});
