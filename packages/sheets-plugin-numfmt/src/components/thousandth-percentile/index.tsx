import { InputNumber, SelectList } from '@univerjs/design';
import type { FC } from 'react';
import React, { useEffect, useMemo, useState } from 'react';

import type { BusinessComponentProps } from '../../base/types';
import {
    getDecimalFromPattern,
    isPatternEqualWithoutDecimal,
    isPatternHasDecimal,
    setPatternDecimal,
} from '../../utils/decimal';
import { getNumberFormatOptions } from '../../utils/options';

export const isThousandthPercentilePanel = (pattern: string) =>
    getNumberFormatOptions().some((item) => isPatternEqualWithoutDecimal(item.value, pattern));

export const ThousandthPercentilePanel: FC<BusinessComponentProps> = (props) => {
    const options = useMemo(getNumberFormatOptions, []);
    const [decimal, decimalSet] = useState(() => getDecimalFromPattern(props.defaultPattern || '', 0));

    const [suffix, suffixSet] = useState(() => {
        const item = options.find((item) => isPatternEqualWithoutDecimal(item.value, props.defaultPattern || ''));
        return item?.value || options[0].value;
    });

    const pattern = useMemo(() => setPatternDecimal(suffix, Number(decimal || 0)), [suffix, decimal]);

    const isInputDisable = useMemo(() => !isPatternHasDecimal(suffix), [suffix]);

    const handleClick = (v: string) => {
        decimalSet(getDecimalFromPattern(v, 0));
        suffixSet(v);
    };

    useEffect(() => {
        props.onChange(pattern);
    }, [pattern]);

    return (
        <div>
            <div className="m-t-16 label">小数位数</div>
            <div className="m-t-8">
                <InputNumber
                    disabled={isInputDisable}
                    value={decimal}
                    max={20}
                    min={0}
                    onChange={(value) => decimalSet(value || 0)}
                />
            </div>
            <div className="m-t-16 label"> 负数类型</div>
            <div className="m-t-8">
                <SelectList onChange={handleClick} options={options} value={suffix} />
            </div>
            <div className="describe m-t-14">货币格式用于表示一般货币数值。会计格式可以对一列数值进行小数点对齐。</div>
        </div>
    );
};
