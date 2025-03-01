import type { IFunctionInfo, IFunctionParam } from '@univerjs/base-formula-engine';
import { RangeSelector } from '@univerjs/ui-plugin-sheets';
import React, { useState } from 'react';

import { FunctionHelp } from '../function-help/FunctionHelp';
import { FunctionParams } from '../function-params/FunctionParams';
import styles from './index.module.less';

export interface IInputParamsProps {
    functionInfo: IFunctionInfo | null;
    onChange: (params: string[]) => void;
}

export function InputParams(props: IInputParamsProps) {
    const { functionInfo, onChange } = props;
    if (!functionInfo) return null;

    const [params, setParams] = useState<string[]>([]);
    const [functionParameter, setFunctionParameter] = useState<IFunctionParam[]>(functionInfo.functionParameter);
    const [activeIndex, setActiveIndex] = useState(-1);

    // TODO@Dushusir: Display description when all range selectors is canceled
    function handleChange(range: string, paramIndex: number) {
        const newParams = [...params];
        newParams[paramIndex] = range;
        setParams(newParams);
        onChange(newParams);
    }

    function handleActive(i: number) {
        if (i === functionParameter.length - 1 && functionParameter[i].repeat) {
            const newFunctionParameter = [...functionParameter];
            newFunctionParameter.push(functionParameter[i]);
            setFunctionParameter(newFunctionParameter);
        }

        setActiveIndex(i);
    }

    return (
        <div className={styles.formulaInputParams}>
            <div className={styles.formulaInputParamsList}>
                {functionParameter.map((item: IFunctionParam, i: number) => (
                    <div key={i}>
                        <div className={styles.formulaInputParamsListItemName}>{item.name}</div>

                        <div className={styles.formulaInputParamsListItemSelector}>
                            <RangeSelector
                                onChange={(range: string) => handleChange(range, i)}
                                onActive={() => handleActive(i)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.formulaInputParamsInfo}>
                <FunctionParams
                    title={
                        activeIndex === -1 ? (
                            <FunctionHelp prefix={functionInfo.functionName} value={functionParameter} />
                        ) : (
                            functionParameter[activeIndex].name
                        )
                    }
                    value={activeIndex === -1 ? functionInfo.description : functionParameter[activeIndex].detail}
                />
            </div>
        </div>
    );
}
