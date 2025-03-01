export default {
    AVERAGE: {
        description: '返回参数的平均值（算术平均值）。',
        abstract: '返回参数平均值',
        functionParameter: {
            number1: {
                name: '数值1',
                detail: '要计算平均值的第一个数字、单元格引用或单元格区域。',
            },
            number2: {
                name: '数值2',
                detail: '要计算平均值的其他数字、单元格引用或单元格区域，最多可包含 255 个。',
            },
        },
    },
    COUNT: {
        description: '计算包含数字的单元格个数以及参数列表中数字的个数。',
        abstract: '计算参数列表中数字的个数',
        functionParameter: {
            value1: {
                name: '值1',
                detail: '要计算其中数字的个数的第一项、单元格引用或区域。',
            },
            value2: {
                name: '值2',
                detail: '要计算其中数字的个数的其他项、单元格引用或区域，最多可包含 255 个。',
            },
        },
    },
    MAX: {
        description: '返回一组值中的最大值。',
        abstract: '返回参数列表中的最大值',
        functionParameter: {
            number1: {
                name: '数值1',
                detail: '要计算最大值的第一个数字、单元格引用或单元格区域。',
            },
            number2: {
                name: '数值2',
                detail: '要计算最大值的其他数字、单元格引用或单元格区域，最多可包含 255 个。',
            },
        },
    },
    MIN: {
        description: '返回一组值中的最小值。',
        abstract: '返回参数列表中的最小值',
        functionParameter: {
            number1: {
                name: '数值1',
                detail: '要计算最小值的第一个数字、单元格引用或单元格区域。',
            },
            number2: {
                name: '数值2',
                detail: '要计算最小值的其他数字、单元格引用或单元格区域，最多可包含 255 个。',
            },
        },
    },
};
