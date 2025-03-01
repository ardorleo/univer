import { SelectionManagerService } from '@univerjs/base-sheets';
import {
    Disposable,
    IRange,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    SheetInterceptorService,
    toDisposable,
} from '@univerjs/core';
import { createIdentifier, IDisposable, Inject } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

import {
    chnNumberRule,
    chnWeek2Rule,
    chnWeek3Rule,
    extendNumberRule,
    formulaRule,
    loopSeriesRule,
    numberRule,
    otherRule,
} from './rules';
import { APPLY_TYPE, IAutoFillHook, IAutoFillRule } from './type';

export interface IAutoFillService {
    getRules(): IAutoFillRule[];
    getApplyType(): APPLY_TYPE;
    isFillingStyle(): boolean;
    setApplyType(type: APPLY_TYPE): void;
    setRanges(sourceRange: IRange, destRange: IRange, applyRange: IRange): void;
    getRanges(): { sourceRange: IRange | null; destRange: IRange | null; applyRange: IRange | null };
    setFillingStyle(isFillingStyle: boolean): void;
    applyType$: Observable<APPLY_TYPE>;
    menu$: Observable<IApplyMenuItem[]>;
    setDisableApplyType: (type: APPLY_TYPE, disable: boolean) => void;
    registerRule(rule: IAutoFillRule): void;
    getHooks(): IAutoFillHook[];
    addHook(hook: IAutoFillHook): IDisposable;
}

export interface IApplyMenuItem {
    label: string;
    value: APPLY_TYPE;
    disable: boolean;
}

@OnLifecycle(LifecycleStages.Rendered, AutoFillService)
export class AutoFillService extends Disposable implements IAutoFillService {
    private _rules: IAutoFillRule[] = [];
    private _hooks: IAutoFillHook[] = [];
    private readonly _applyType$: BehaviorSubject<APPLY_TYPE> = new BehaviorSubject<APPLY_TYPE>(APPLY_TYPE.SERIES);
    private _isFillingStyle: boolean = true;
    private _sourceRange: IRange | null = null;
    private _destRange: IRange | null = null;
    private _applyRange: IRange | null = null;
    readonly applyType$ = this._applyType$.asObservable();

    private readonly _menu$: BehaviorSubject<IApplyMenuItem[]> = new BehaviorSubject<IApplyMenuItem[]>([
        {
            label: 'autoFill.copy',
            value: APPLY_TYPE.COPY,
            disable: false,
        },
        {
            label: 'autoFill.series',
            value: APPLY_TYPE.SERIES,
            disable: false,
        },
        {
            label: 'autoFill.formatOnly',
            value: APPLY_TYPE.ONLY_FORMAT,
            disable: false,
        },
        {
            label: 'autoFill.noFormat',
            value: APPLY_TYPE.NO_FORMAT,
            disable: false,
        },
    ]);
    readonly menu$ = this._menu$.asObservable();
    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SelectionManagerService) private _selectionManagerService: SelectionManagerService
    ) {
        super();
        this._init();
    }

    private _init() {
        this._rules = [
            formulaRule,
            numberRule,
            extendNumberRule,
            chnNumberRule,
            chnWeek2Rule,
            chnWeek3Rule,
            loopSeriesRule,
            otherRule,
        ].sort((a, b) => b.priority - a.priority);
        this._isFillingStyle = true;
    }

    addHook(hook: IAutoFillHook) {
        if (this._hooks.find((h) => h.hookName === hook.hookName)) {
            throw new Error(`Add hook failed, hook name '${hook.hookName}' already exist!`);
        }
        this._hooks.push(hook);
        return toDisposable(() => {
            const index = this._hooks.findIndex((item) => item === hook);
            if (index > -1) {
                this._hooks.splice(index, 1);
            }
        });
    }

    registerRule(rule: IAutoFillRule) {
        // if rule.type is used, console error
        if (this._rules.find((r) => r.type === rule.type)) {
            throw new Error(`Registry rule failed, type '${rule.type}' already exist!`);
        }
        // insert rules according to the rule.priority, the higher priority will be inserted at the beginning of the array
        const index = this._rules.findIndex((r) => r.priority < rule.priority);
        this._rules.splice(index === -1 ? this._rules.length : index, 0, rule);
    }

    getRules() {
        return this._rules;
    }

    getHooks() {
        return this._hooks;
    }

    getApplyType() {
        return this._applyType$.getValue();
    }

    setApplyType(type: APPLY_TYPE) {
        this._applyType$.next(type);
    }

    isFillingStyle(): boolean {
        return this._isFillingStyle;
    }

    setFillingStyle(isFillingStyle: boolean) {
        this._isFillingStyle = isFillingStyle;
    }

    setRanges(destRange: IRange, sourceRange: IRange, applyRange: IRange) {
        this._sourceRange = sourceRange;
        this._destRange = destRange;
        this._applyRange = applyRange;
    }

    getRanges() {
        return {
            sourceRange: this._sourceRange,
            destRange: this._destRange,
            applyRange: this._applyRange,
        };
    }

    setDisableApplyType(type: APPLY_TYPE, disable: boolean) {
        this._menu$.next(
            this._menu$.getValue().map((item) => {
                if (item.value === type) {
                    return {
                        ...item,
                        disable,
                    };
                }
                return item;
            })
        );
    }
}

export const IAutoFillService = createIdentifier<AutoFillService>('univer.auto-fill-service');
