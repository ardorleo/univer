import array from './function-list/array/zh-CN';
import compatibility from './function-list/compatibility/zh-CN';
import cube from './function-list/cube/zh-CN';
import database from './function-list/database/zh-CN';
import date from './function-list/date/zh-CN';
import engineering from './function-list/engineering/zh-CN';
import financial from './function-list/financial/zh-CN';
import information from './function-list/information/zh-CN';
import logical from './function-list/logical/zh-CN';
import lookup from './function-list/lookup/zh-CN';
import math from './function-list/math/zh-CN';
import statistical from './function-list/statistical/zh-CN';
import text from './function-list/text/zh-CN';
import univer from './function-list/univer/zh-CN';
import web from './function-list/web/zh-CN';

export default {
    formula: {
        insert: {
            tooltip: '函数',
            sum: '求和',
            average: '平均值',
            count: '计数',
            max: '最大值',
            min: '最小值',
            more: '更多函数...',
        },
        functionList: {
            ...financial,
            ...date,
            ...math,
            ...statistical,
            ...lookup,
            ...database,
            ...text,
            ...logical,
            ...information,
            ...engineering,
            ...cube,
            ...compatibility,
            ...web,
            ...array,
            ...univer,
        },

        prompt: {
            helpExample: '示例',
            helpAbstract: '简介',
            required: '必需。',
            optional: '可选。',
        },

        functionType: {
            financial: '财务',
            date: '日期与时间',
            math: '数学与三角函数',
            statistical: '统计',
            lookup: '查找与引用',
            database: '数据库',
            text: '文本',
            logical: '逻辑',
            information: '信息',
            engineering: '工程',
            cube: '多维数据集',
            compatibility: '兼容性',
            web: 'Web',
            array: '数组',
            univer: 'Univer',
        },

        moreFunctions: {
            confirm: '应用',
            prev: '上一步',
            next: '下一步',
            searchFunctionPlaceholder: '搜索函数',
            allFunctions: '全部函数',
            syntax: '语法',
        },
    },
};
