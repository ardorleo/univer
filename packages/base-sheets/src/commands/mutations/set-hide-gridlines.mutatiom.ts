import { BooleanNumber, CommandType, IMutation, IUniverInstanceService, Tools } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetHideGridlinesMutationParams {
    hideGridlines: BooleanNumber;
    workbookId: string;
    worksheetId: string;
}

export const SetHideGridlinesUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetHideGridlinesMutationParams
): ISetHideGridlinesMutationParams => {
    const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);
    const worksheet = workbook!.getSheetBySheetId(params.worksheetId);
    const config = worksheet!.getConfig();

    const oldStatus = config.showGridlines;

    return {
        ...Tools.deepClone(params),
        hideGridlines: oldStatus,
    };
};

export const SetHideGridlinesMutation: IMutation<ISetHideGridlinesMutationParams> = {
    id: 'sheet.mutation.set-hide-gridlines',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;
        const config = worksheet.getConfig();

        config.showGridlines = params.hideGridlines;

        return true;
    },
};
