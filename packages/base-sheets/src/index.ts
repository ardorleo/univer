export * from './base-sheets-plugin';

// #region services
export { COMMAND_LISTENER_SKELETON_CHANGE } from './basics/const/command-listener-const';
export {
    type IAddWorksheetMergeMutationParams,
    type IDeleteRangeMutationParams,
    type IInsertColMutationParams,
    type IInsertRangeMutationParams,
    type IInsertRowMutationParams,
    type IInsertSheetMutationParams,
    type IRemoveColMutationParams,
    type IRemoveRowsMutationParams,
    type IRemoveSheetMutationParams,
    type IRemoveWorksheetMergeMutationParams,
} from './basics/interfaces/mutation-interface';
export {
    convertPrimaryWithCoordToPrimary,
    convertSelectionDataToRange,
    getNormalSelectionStyle,
    type ISelectionStyle,
    type ISelectionWidgetConfig,
    type ISelectionWithCoordAndStyle,
    type ISelectionWithStyle,
    SELECTION_CONTROL_BORDER_BUFFER_COLOR,
    SELECTION_CONTROL_BORDER_BUFFER_WIDTH,
    transformCellDataToSelectionData,
} from './basics/selection';
export {
    checkIfShrink,
    expandToContinuousRange,
    expandToNextCell,
    expandToNextGapRange,
    expandToWholeSheet,
    shrinkToNextCell,
    shrinkToNextGapRange,
} from './commands/commands/utils/selection-util';
export { MAX_CELL_PER_SHEET_KEY } from './controllers/config/config';
export { BorderStyleManagerService, type IBorderInfo } from './services/border-style-manager.service';
export { SheetEditablePermission, SheetPermissionService } from './services/permission';
export { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from './services/selection-manager.service';

// #region commands

export {
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeCommand,
    AddWorksheetMergeHorizontalCommand,
    AddWorksheetMergeVerticalCommand,
    getAddMergeMutationRangeByType,
} from './commands/commands/add-worksheet-merge.command';
export { ClearSelectionAllCommand } from './commands/commands/clear-selection-all.command';
export { ClearSelectionContentCommand } from './commands/commands/clear-selection-content.command';
export { ClearSelectionFormatCommand } from './commands/commands/clear-selection-format.command';
export { CopySheetCommand } from './commands/commands/copy-worksheet.command';
export { DeleteRangeMoveLeftCommand } from './commands/commands/delete-range-move-left.command';
export { type DeleteRangeMoveLeftCommandParams } from './commands/commands/delete-range-move-left.command';
export { DeleteRangeMoveUpCommand } from './commands/commands/delete-range-move-up.command';
export { InsertRangeMoveDownCommand } from './commands/commands/insert-range-move-down.command';
export { InsertRangeMoveRightCommand } from './commands/commands/insert-range-move-right.command';
export type { IInsertColCommandParams, IInsertRowCommandParams } from './commands/commands/insert-row-col.command';
export {
    InsertColAfterCommand,
    InsertColBeforeCommand,
    InsertColCommand,
    InsertRowAfterCommand,
    InsertRowBeforeCommand,
    InsertRowCommand,
} from './commands/commands/insert-row-col.command';
export { InsertSheetCommand } from './commands/commands/insert-sheet.command';
export { type IMoveRangeCommandParams, MoveRangeCommand } from './commands/commands/move-range.command';
export {
    type IMoveColsCommandParams,
    type IMoveRowsCommandParams,
    MoveColsCommand,
    MoveRowsCommand,
} from './commands/commands/move-rows-cols.command';
export { RemoveColCommand, RemoveRowCommand } from './commands/commands/remove-row-col.command';
export { RemoveSheetCommand } from './commands/commands/remove-sheet.command';
export { RemoveWorksheetMergeCommand } from './commands/commands/remove-worksheet-merge.command';
export type {
    ISetBorderColorCommandParams,
    ISetBorderPositionCommandParams,
    ISetBorderStyleCommandParams,
} from './commands/commands/set-border-command';
export {
    SetBorderBasicCommand,
    SetBorderColorCommand,
    SetBorderCommand,
    SetBorderPositionCommand,
    SetBorderStyleCommand,
} from './commands/commands/set-border-command';
export {
    type ISetSpecificColsVisibleCommandParams,
    SetColHiddenCommand,
    SetSelectedColsVisibleCommand,
    SetSpecificColsVisibleCommand,
} from './commands/commands/set-col-visible.command';
export { SetFrozenCommand } from './commands/commands/set-frozen.command';
export { type ISetRangeValuesCommandParams, SetRangeValuesCommand } from './commands/commands/set-range-values.command';
export {
    type ISetSpecificRowsVisibleCommandParams,
    SetRowHiddenCommand,
    SetSelectedRowsVisibleCommand,
    SetSpecificRowsVisibleCommand,
} from './commands/commands/set-row-visible.command';
export {
    type ISetStyleCommandParams,
    ResetBackgroundColorCommand,
    ResetTextColorCommand,
    SetBackgroundColorCommand,
    SetBoldCommand,
    SetFontFamilyCommand,
    SetFontSizeCommand,
    SetHorizontalTextAlignCommand,
    SetItalicCommand,
    SetStrikeThroughCommand,
    SetStyleCommand,
    SetTextColorCommand,
    SetTextRotationCommand,
    SetTextWrapCommand,
    SetUnderlineCommand,
    SetVerticalTextAlignCommand,
} from './commands/commands/set-style.command';
export { SetTabColorCommand } from './commands/commands/set-tab-color.command';
export { SetWorksheetActivateCommand } from './commands/commands/set-worksheet-activate.command';
export {
    DeltaColumnWidthCommand,
    type IDeltaColumnWidthCommandParams,
    SetColWidthCommand,
} from './commands/commands/set-worksheet-col-width.command';
export { SetWorksheetHideCommand } from './commands/commands/set-worksheet-hide.command';
export { SetWorksheetNameCommand } from './commands/commands/set-worksheet-name.command';
export { SetWorksheetOrderCommand } from './commands/commands/set-worksheet-order.command';
export {
    DeltaRowHeightCommand,
    type IDeltaRowHeightCommand,
    SetRowHeightCommand,
    SetWorksheetRowIsAutoHeightCommand,
} from './commands/commands/set-worksheet-row-height.command';
export { SetWorksheetShowCommand } from './commands/commands/set-worksheet-show.command';
export { getPrimaryForRange } from './commands/commands/utils/selection-util';
export {
    findNextGapRange,
    findNextRange,
    getCellAtRowCol,
    getStartRange,
} from './commands/commands/utils/selection-util';
export {
    AddMergeUndoMutationFactory,
    AddWorksheetMergeMutation,
} from './commands/mutations/add-worksheet-merge.mutation';
export { DeleteRangeMutation } from './commands/mutations/delete-range.mutation';
export { InsertRangeMutation } from './commands/mutations/insert-range.mutation';
export {
    InsertColMutation,
    InsertColMutationUndoFactory,
    InsertRowMutation,
    InsertRowMutationUndoFactory,
} from './commands/mutations/insert-row-col.mutation';
export { InsertSheetMutation, InsertSheetUndoMutationFactory } from './commands/mutations/insert-sheet.mutation';
export { MoveRangeMutation } from './commands/mutations/move-range.mutation';
export { type MoveRangeMutationParams } from './commands/mutations/move-range.mutation';
export { type IMoveColumnsMutationParams } from './commands/mutations/move-rows-cols.mutation';
export { type IMoveRowsMutationParams, MoveRowsMutation } from './commands/mutations/move-rows-cols.mutation';
export { MoveColsMutation } from './commands/mutations/move-rows-cols.mutation';
export { RemoveColMutation, RemoveRowMutation } from './commands/mutations/remove-row-col.mutation';
export { RemoveSheetMutation, RemoveSheetUndoMutationFactory } from './commands/mutations/remove-sheet.mutation';
export { RemoveWorksheetMergeMutation } from './commands/mutations/remove-worksheet-merge.mutation';
export { RemoveMergeUndoMutationFactory } from './commands/mutations/remove-worksheet-merge.mutation';
export {
    type ISetColHiddenMutationParams,
    type ISetColVisibleMutationParams,
    SetColHiddenMutation,
    SetColVisibleMutation,
} from './commands/mutations/set-col-visible.mutation';
export {
    type ISetFrozenMutationParams,
    SetFrozenMutation,
    SetFrozenMutationFactory,
} from './commands/mutations/set-frozen.mutation';
export type { ISetRangeValuesMutationParams } from './commands/mutations/set-range-values.mutation';
export { SetRangeValuesMutation } from './commands/mutations/set-range-values.mutation';
export { SetRangeValuesUndoMutationFactory } from './commands/mutations/set-range-values.mutation';
export { type ISetRangeValuesRangeMutationParams } from './commands/mutations/set-range-values.mutation';
export { SetRowHiddenMutation, SetRowVisibleMutation } from './commands/mutations/set-row-visible.mutation';
export { SetTabColorMutation } from './commands/mutations/set-tab-color.mutation';
export { type ISetTabColorMutationParams } from './commands/mutations/set-tab-color.mutation';
export { SetWorksheetActivateMutation } from './commands/mutations/set-worksheet-activate.mutation';
export { type ISetWorksheetActivateMutationParams } from './commands/mutations/set-worksheet-activate.mutation';
export {
    type ISetWorksheetColWidthMutationParams,
    SetWorksheetColWidthMutation,
    SetWorksheetColWidthMutationFactory,
} from './commands/mutations/set-worksheet-col-width.mutation';
export {
    type ISetWorksheetHideMutationParams,
    SetWorksheetHideMutation,
} from './commands/mutations/set-worksheet-hide.mutation';
export { SetWorksheetNameMutation } from './commands/mutations/set-worksheet-name.mutation';
export { type ISetWorksheetNameMutationParams } from './commands/mutations/set-worksheet-name.mutation';
export { SetWorksheetOrderMutation } from './commands/mutations/set-worksheet-order.mutation';
export { type ISetWorksheetOrderMutationParams } from './commands/mutations/set-worksheet-order.mutation';
export {
    type ISetWorksheetRowAutoHeightMutationParams,
    type ISetWorksheetRowHeightMutationParams,
    type ISetWorksheetRowIsAutoHeightMutationParams,
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowAutoHeightMutationFactory,
    SetWorksheetRowHeightMutation,
    SetWorksheetRowIsAutoHeightMutation,
} from './commands/mutations/set-worksheet-row-height.mutation';
export { type ISetSelectionsOperationParams, SetSelectionsOperation } from './commands/operations/selection.operation';
export { type ISheetCommandSharedParams } from './commands/utils/interface';
export { RefRangeService } from './services/ref-range/ref-range.service';
export type { EffectRefRangeParams } from './services/ref-range/type';
export { EffectRefRangId, OperatorType } from './services/ref-range/type';
export {
    handleDeleteRangeMoveLeft,
    handleDeleteRangeMoveUp,
    handleInsertCol,
    handleInsertRangeMoveDown,
    handleInsertRangeMoveRight,
    handleInsertRow,
    handleIRemoveCol,
    handleIRemoveRow,
    handleMoveRange,
    runRefRangeMutations,
} from './services/ref-range/util';
