import numfmt from '@univerjs/base-numfmt-engine';
import { LocaleService } from '@univerjs/core';
import { SelectList } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { FC } from 'react';
import React, { useEffect, useMemo, useState } from 'react';

import type { BusinessComponentProps } from '../../base/types';
import { getDateFormatOptions } from '../../utils/options';

export const isDatePanel = (pattern: string) => {
    const info = numfmt.getInfo(pattern);
    return (
        getDateFormatOptions()
            .map((item) => item.value)
            .includes(pattern) || ['date', 'datetime', 'time'].includes(info.type)
    );
};

export const DatePanel: FC<BusinessComponentProps> = (props) => {
    const options = useMemo(getDateFormatOptions, []);
    const localeService = useDependency(LocaleService);
    const t = localeService.t;
    const [suffix, suffixSet] = useState(() => {
        if (props.defaultPattern) {
            const item = options.find((item) => item.value === props.defaultPattern);
            if (item) {
                return item.value;
            }
        }
        return options[0].value;
    });

    useEffect(() => {
        props.onChange(suffix);
    }, [suffix]);
    return (
        <div>
            <div className="m-t-16 label">{t('sheet.numfmt.dateType')}</div>
            <div className="m-t-8">
                <SelectList value={suffix} options={options} onChange={suffixSet} />
            </div>
            <div className="describe m-t-14">{t('sheet.numfmt.dateDes')}</div>
        </div>
    );
};
