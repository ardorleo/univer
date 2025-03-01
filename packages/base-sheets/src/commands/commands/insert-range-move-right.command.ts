import {
    BooleanNumber,
    CommandType,
    Dimension,
    ICellData,
    IColumnData,
    ICommand,
    ICommandService,
    ILogService,
    IMutationInfo,
    IRange,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectArray,
    ObjectMatrix,
    sequenceExecute,
    SheetInterceptorService,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    IDeleteRangeMutationParams,
    IInsertColMutationParams,
    IInsertRangeMutationParams,
    IRemoveColMutationParams,
} from '../../basics/interfaces/mutation-interface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { DeleteRangeMutation } from '../mutations/delete-range.mutation';
import { InsertRangeMutation, InsertRangeUndoMutationFactory } from '../mutations/insert-range.mutation';
import { InsertColMutation, InsertColMutationUndoFactory } from '../mutations/insert-row-col.mutation';
import { RemoveColMutation } from '../mutations/remove-row-col.mutation';
import { calculateTotalLength, IInterval } from './utils/selection-util';

export interface InsertRangeMoveRightCommandParams {
    ranges: IRange[];
}
export const InsertRangeMoveRightCommandId = 'sheet.command.insert-range-move-right';
/**
 * The command to insert range.
 */
export const InsertRangeMoveRightCommand: ICommand = {
    type: CommandType.COMMAND,
    id: InsertRangeMoveRightCommandId,

    handler: async (accessor: IAccessor, params?: InsertRangeMoveRightCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const logService = accessor.get(ILogService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        if (selectionManagerService.isOverlapping()) {
            // TODO@Dushusir: use Dialog after Dialog component completed
            logService.error('Cannot use that command on overlapping selections.');
            return false;
        }

        const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
        let ranges = params?.ranges as IRange[];
        if (!ranges) {
            ranges = selectionManagerService.getSelectionRanges() || [];
        }
        if (!ranges?.length) return false;

        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const redoMutations: IMutationInfo[] = [];
        const undoMutations: IMutationInfo[] = [];

        // 1. insert range
        const cellValue = new ObjectMatrix<ICellData>();
        for (let i = 0; i < ranges.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = ranges[i];

            for (let r = startRow; r <= endRow; r++) {
                for (let c = startColumn; c <= endColumn; c++) {
                    cellValue.setValue(r, c, { m: '', v: '' });
                }
            }
        }

        const insertRangeMutationParams: IInsertRangeMutationParams = {
            ranges,
            worksheetId,
            workbookId,
            shiftDimension: Dimension.COLUMNS,
            cellValue: cellValue.getData(),
        };

        redoMutations.push({ id: InsertRangeMutation.id, params: insertRangeMutationParams });

        const deleteRangeMutationParams: IDeleteRangeMutationParams = InsertRangeUndoMutationFactory(
            accessor,
            insertRangeMutationParams
        );

        undoMutations.push({ id: DeleteRangeMutation.id, params: deleteRangeMutationParams });

        // 2. insert column
        // Only required when the last column has a value, and the column width is set to the column width of the last column
        let hasValueInLastColumn = false;
        let lastColumnWidth = 0;
        const lastColumnIndex = worksheet.getMaxColumns() - 1;
        const columnsObject: IInterval = {};
        for (let i = 0; i < ranges.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = ranges[i];

            columnsObject[`${i}`] = [startColumn, endColumn];
            for (let row = startRow; row <= endRow; row++) {
                const lastCell = worksheet.getCell(row, lastColumnIndex);
                const lastCellValue = lastCell?.v;
                if (lastCellValue && lastCellValue !== '') {
                    hasValueInLastColumn = true;
                    lastColumnWidth = worksheet.getColumnWidth(lastColumnIndex);
                    break;
                }
            }
        }

        // There may be overlap and deduplication is required
        const columnsCount = calculateTotalLength(columnsObject);
        if (hasValueInLastColumn) {
            const lastColumnRange = {
                startRow: ranges[0].startRow,
                endRow: ranges[0].endRow,
                startColumn: lastColumnIndex,
                endColumn: lastColumnIndex,
            };
            const insertColParams: IInsertColMutationParams = {
                workbookId,
                worksheetId,
                ranges: [lastColumnRange],
                colInfo: new ObjectArray<IColumnData>(
                    new Array(columnsCount).fill(undefined).map(() => ({
                        w: lastColumnWidth,
                        hd: BooleanNumber.FALSE,
                    }))
                ),
            };

            redoMutations.push({
                id: InsertColMutation.id,
                params: insertColParams,
            });

            const undoColInsertionParams: IRemoveColMutationParams = InsertColMutationUndoFactory(
                accessor,
                insertColParams
            );

            undoMutations.push({ id: RemoveColMutation.id, params: undoColInsertionParams });
        }
        const sheetInterceptor = sheetInterceptorService.onCommandExecute({
            id: InsertRangeMoveRightCommand.id,
            params: { ranges } as InsertRangeMoveRightCommandParams,
        });
        redoMutations.push(...sheetInterceptor.redos);
        undoMutations.push(...sheetInterceptor.undos);
        // execute do mutations and add undo mutations to undo stack if completed
        const result = sequenceExecute(redoMutations, commandService);
        if (result.result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: undoMutations.reverse(),
                redoMutations,
            });

            return true;
        }

        return false;
    },
    // all subsequent mutations should succeed inorder to make the whole process succeed
    // Promise.all([]).then(() => true),
};
