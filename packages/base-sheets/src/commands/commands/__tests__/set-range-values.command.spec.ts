import {
    CellValueType,
    ICellData,
    ICommandService,
    IDocumentData,
    IStyleData,
    IUniverInstanceService,
    Nullable,
    RANGE_TYPE,
    RedoCommand,
    Tools,
    UndoCommand,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../../services/selection-manager.service';
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { ISetRangeValuesCommandParams, SetRangeValuesCommand } from '../set-range-values.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test set range values commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let selectionManager: SelectionManagerService;
    let getValue: () => any;
    let getStyle: () => any;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);

        selectionManager = get(SelectionManagerService);
        selectionManager.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });
        selectionManager.add([
            {
                range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);

        getValue = (): Nullable<ICellData> =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(0, 0, 0, 0)
                .getValue();

        getStyle = (): Nullable<IStyleData> => {
            const value = getValue();
            const styles = get(IUniverInstanceService).getUniverSheetInstance('test')?.getStyles();
            if (value && styles) {
                return styles.getStyleByCell(value);
            }
        };
    });

    afterEach(() => {
        univer.dispose();
    });
    describe('set range values', () => {
        describe('correct situations', () => {
            it('will set range values when there is a selected range', async () => {
                function getParams() {
                    const richTextDemo: IDocumentData = {
                        id: 'd',
                        body: {
                            dataStream: `Instructions:\f①Project division - Fill in the specific division of labor after the project is disassembled:\f②Responsible Person - Enter the responsible person's name here:\f③Date-The specific execution time of the project (detailed to the date of a certain month), and the gray color block marks the planned real-time time of the division of labor of the project (for example,\fthe specific execution time of [regional scene model arrangement and construction] is the 2 days marked in gray. \r\n`,
                            textRuns: [
                                {
                                    st: 0,
                                    ed: 488,
                                    ts: {
                                        cl: {
                                            rgb: 'rgb(92,92,92)',
                                        },
                                    },
                                },
                            ],
                            paragraphs: [
                                {
                                    startIndex: 489,
                                    paragraphStyle: {
                                        spaceAbove: 10,
                                        lineSpacing: 1.2,
                                    },
                                },
                            ],
                        },
                        documentStyle: {
                            pageSize: {
                                width: Infinity,
                                height: Infinity,
                            },
                            marginTop: 0,
                            marginBottom: 0,
                            marginRight: 2,
                            marginLeft: 2,
                        },
                    };

                    const params: ISetRangeValuesCommandParams = {
                        value: {
                            p: richTextDemo,
                            v: 'a1',
                            m: 'a1',
                            t: CellValueType.STRING,
                        },
                    };

                    return params;
                }

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getParams())).toBeTruthy();
                expect(getValue()).toStrictEqual(getParams().value);
                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({
                    v: 'A1',
                });

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual(getParams().value);
            });
            it('set formats', async () => {
                // set IStyleBase, the original cell has no style information
                function getParamsStyleBase() {
                    const paramsStyleBase: ISetRangeValuesCommandParams = {
                        value: {
                            s: {
                                ff: 'Arial',
                                fs: 12,
                                it: 1,
                                bl: 1,
                                ul: {
                                    s: 1,
                                    cl: {
                                        rgb: 'rgb(0,0,0)',
                                    },
                                    t: 1,
                                },
                                st: {
                                    s: 1,
                                    cl: {
                                        rgb: 'rgb(0,0,0)',
                                    },
                                    t: 1,
                                },
                                ol: {
                                    s: 1,
                                    cl: {
                                        rgb: 'rgb(0,0,0)',
                                    },
                                    t: 1,
                                },
                                bg: {
                                    rgb: 'rgb(0,0,0)',
                                },
                                bd: {
                                    t: {
                                        s: 1,
                                        cl: {
                                            rgb: 'rgb(0,0,0)',
                                        },
                                    },
                                    r: {
                                        s: 1,
                                        cl: {
                                            rgb: 'rgb(0,0,0)',
                                        },
                                    },
                                    b: {
                                        s: 1,
                                        cl: {
                                            rgb: 'rgb(0,0,0)',
                                        },
                                    },
                                    l: {
                                        s: 1,
                                        cl: {
                                            rgb: 'rgb(0,0,0)',
                                        },
                                    },
                                },
                                cl: {
                                    rgb: 'rgb(0,0,0)',
                                },
                                va: 1,
                            },
                        },
                    };

                    return paramsStyleBase;
                }

                function getParamsStyleBaseObject() {
                    const paramsStyleBase = getParamsStyleBase();
                    return (paramsStyleBase.value as ICellData).s as IStyleData;
                }

                expect(
                    await commandService.executeCommand(SetRangeValuesCommand.id, getParamsStyleBase())
                ).toBeTruthy();
                expect(getStyle()).toStrictEqual(getParamsStyleBaseObject());

                // set IStyleData, the original cell has style information
                function getParamsStyleData() {
                    const paramsStyleData: ISetRangeValuesCommandParams = {
                        value: {
                            s: {
                                tr: {
                                    a: 45,
                                    v: 0,
                                },
                                td: 1,
                                ht: 1,
                                vt: 1,
                                tb: 1,
                                pd: {
                                    t: 4,
                                    r: 4,
                                    b: 4,
                                    l: 4,
                                },
                            },
                        },
                    };

                    return paramsStyleData;
                }

                const allStyle = Tools.deepMerge({}, getParamsStyleBase(), getParamsStyleData());
                expect(
                    await commandService.executeCommand(SetRangeValuesCommand.id, getParamsStyleData())
                ).toBeTruthy();
                expect(getStyle()).toStrictEqual((allStyle.value as ICellData).s);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getStyle()).toStrictEqual(getParamsStyleBaseObject());

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getStyle()).toStrictEqual((allStyle.value as ICellData).s);
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                selectionManager.clear();
                const params: ISetRangeValuesCommandParams = {
                    value: {
                        v: 'a1',
                    },
                };
                const result = await commandService.executeCommand(SetRangeValuesCommand.id, params);
                expect(result).toBeFalsy();
            });
        });
    });
});
