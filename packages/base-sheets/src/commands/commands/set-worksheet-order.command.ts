import { CommandType, ICommand, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    ISetWorksheetOrderMutationParams,
    SetWorksheetOrderMutation,
    SetWorksheetOrderUndoMutationFactory,
} from '../mutations/set-worksheet-order.mutation';

export interface ISetWorksheetOrderCommandParams {
    order: number;
    workbookId?: string;
    worksheetId?: string;
}

export const SetWorksheetOrderCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-order',

    handler: async (accessor: IAccessor, params: ISetWorksheetOrderCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbookId = params.workbookId || univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId =
            params.worksheetId || univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();

        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const setWorksheetOrderMutationParams: ISetWorksheetOrderMutationParams = {
            order: params.order,
            workbookId,
            worksheetId,
        };

        const undoMutationParams = SetWorksheetOrderUndoMutationFactory(accessor, setWorksheetOrderMutationParams);
        const result = commandService.syncExecuteCommand(SetWorksheetOrderMutation.id, setWorksheetOrderMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: [{ id: SetWorksheetOrderMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetWorksheetOrderMutation.id, params: setWorksheetOrderMutationParams }],
            });
            return true;
        }

        return false;
    },
};
