import {
    InsertSheetMutation,
    RemoveSheetMutation,
    SetWorksheetActivateCommand,
    SetWorksheetActivateMutation,
    SetWorksheetHideMutation,
    SetWorksheetNameMutation,
    SetWorksheetOrderMutation,
    SetWorksheetShowCommand,
} from '@univerjs/base-sheets';
import type { ICommandInfo } from '@univerjs/core';
import { BooleanNumber, DisposableCollection, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { Dropdown } from '@univerjs/design';
import { CheckMarkSingle, ConvertSingle, EyelashSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { ISheetBarService } from '../../../services/sheet-bar/sheet-bar.service';
import { SheetBarButton } from '../sheet-bar-button/SheetBarButton';
import styles from './index.module.less';

export interface ISheetBarMenuItem {
    label?: string;
    hidden?: boolean;
    selected?: boolean;
    index?: string;
    sheetId?: string;
}

export interface ISheetBarMenuProps {
    style?: React.CSSProperties;
    onClick?: (e?: MouseEvent) => void;
}

export function SheetBarMenu(props: ISheetBarMenuProps) {
    const { style } = props;
    const [menu, setMenu] = useState<ISheetBarMenuItem[]>([]);
    const [visible, setVisible] = useState(false);

    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const sheetBarService = useDependency(ISheetBarService);
    const workbook = univerInstanceService.getCurrentUniverSheetInstance();

    const handleClick = (item: ISheetBarMenuItem) => {
        const { sheetId } = item;
        if (!sheetId) return;

        if (item.hidden) {
            commandService.executeCommand(SetWorksheetShowCommand.id, {
                value: sheetId,
            });
        } else if (!item.selected) {
            commandService.executeCommand(SetWorksheetActivateCommand.id, {
                workbookId: workbook.getUnitId(),
                worksheetId: sheetId,
            });
        }

        setVisible(false);
    };

    useEffect(() => {
        statusInit();

        const _disposables = new DisposableCollection();

        _disposables.add(setupStatusUpdate());
        _disposables.add(
            sheetBarService.registerSheetBarMenuHandler({
                handleSheetBarMenu,
            })
        );

        return () => {
            // Clean up disposable when the component unmounts
            _disposables.dispose();
        };
    }, []);

    const setupStatusUpdate = () =>
        commandService.onCommandExecuted((commandInfo: ICommandInfo) => {
            switch (commandInfo.id) {
                case SetWorksheetHideMutation.id:
                case RemoveSheetMutation.id:
                case SetWorksheetNameMutation.id:
                case InsertSheetMutation.id:
                case SetWorksheetOrderMutation.id:
                case SetWorksheetActivateMutation.id:
                    statusInit();
                    break;
                default:
                    break;
            }
        });

    const statusInit = () => {
        const sheets = workbook.getSheets();
        const worksheetMenuItems = sheets.map((sheet, index) => ({
            label: sheet.getName(),
            index: `${index}`,
            sheetId: sheet.getSheetId(),
            hidden: sheet.isSheetHidden() === BooleanNumber.TRUE,
            selected: sheet.getStatus() === BooleanNumber.TRUE,
        }));

        setMenu(worksheetMenuItems);
    };

    function handleSheetBarMenu() {
        setVisible(true);
    }

    const onVisibleChange = (visible: boolean) => {
        setVisible(visible);
    };

    return (
        <Dropdown
            placement="topLeft"
            trigger={['click']}
            overlay={
                <ul className={styles.sheetBarMenu} style={{ ...style }}>
                    {menu.map((item) => (
                        <li
                            key={item.index}
                            onClick={() => handleClick(item)}
                            className={
                                item.selected
                                    ? `${styles.sheetBarMenuItem} ${styles.sheetBarMenuItemSelect}`
                                    : item.hidden
                                      ? `${styles.sheetBarMenuItem} ${styles.sheetBarMenuItemHide}`
                                      : styles.sheetBarMenuItem
                            }
                        >
                            <span className={styles.sheetBarMenuItemIcon}>
                                {item.selected ? (
                                    <CheckMarkSingle />
                                ) : item.hidden ? (
                                    <EyelashSingle />
                                ) : (
                                    <CheckMarkSingle />
                                )}
                            </span>
                            <span className={styles.sheetBarMenuItemLabel}>{item.label}</span>
                        </li>
                    ))}
                </ul>
            }
            visible={visible}
            onVisibleChange={onVisibleChange}
        >
            <SheetBarButton>
                <ConvertSingle />
            </SheetBarButton>
        </Dropdown>
    );
}
