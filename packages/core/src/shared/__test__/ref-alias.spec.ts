import { describe, expect, it } from 'vitest';

import { RefAlias } from '../ref-alias';

const createInstance = () =>
    new RefAlias<{ a: string; b: string; c: string; d: string }, 'a' | 'c'>(
        [
            { a: 'aa', b: 'bb', c: 'cc', d: 'dd' },
            { a: 'aaa', b: 'bbb', c: 'ccc', d: 'ddd' },
            { a: 'aaaa', b: 'bbbb', c: 'cccc', d: 'dddd' },
            { a: 'aaaaa', b: 'bbbbb', c: 'ccccc', d: 'ddddd' },
        ],
        ['a', 'c']
    );
describe('test for RefAlias', () => {
    it('test getValue ', () => {
        const instance = createInstance();
        expect(instance.getValue('aa')).toEqual({ a: 'aa', b: 'bb', c: 'cc', d: 'dd' });
        expect(instance.getValue('aas')).toEqual(null);
    });
    it('test hasValue ', () => {
        const instance = createInstance();
        expect(instance.hasValue('aa')).toBe(true);
        expect(instance.hasValue('aas')).toBe(false);
    });

    it('test setValue ', () => {
        const instance = createInstance();
        instance.setValue('aa', 'c', 'abc');
        expect(instance.getValue('aa')).toEqual({ a: 'aa', b: 'bb', c: 'abc', d: 'dd' });
    });
    it('test deleteValue ', () => {
        const instance = createInstance();
        instance.deleteValue('aa');
        expect(instance.getValue('aa')).toEqual(null);
        expect(instance.getKeyMap('a').length).toBe(3);
        expect(instance.getKeyMap('c').length).toBe(3);
        expect(instance.getKeyMap('b' as any).length).toBe(0);
        instance.deleteValue('aaa');
        instance.deleteValue('aaaa');
        instance.deleteValue('aaaaa');
        expect(instance.getKeyMap('a').length).toBe(0);
    });

    it('test ref is keepalive', () => {
        const instance = createInstance();
        const aa = instance.getValue('aa');
        instance.setValue('aa', 'c', 'aaaa');
        expect(instance.getValue('aa')).toEqual({ a: 'aa', b: 'bb', c: 'aaaa', d: 'dd' });
        expect(instance.getValue('aa')).toBe(aa);
    });

    it('test addValue', () => {
        const instance = createInstance();
        instance.addValue({ a: 'asa', b: 'bsb', c: 'csc', d: 'dsd' });
        const aa = instance.getValue('asa');
        expect(aa).toEqual({ a: 'asa', b: 'bsb', c: 'csc', d: 'dsd' });
        expect(instance.getValues().length).toBe(5);
        expect(instance.getKeyMap('a').length).toBe(5);
    });

    it('test clear', () => {
        const instance = createInstance();
        instance.clear();
        expect(instance.getValues().length).toBe(0);
        expect(instance.getKeyMap('a').length).toBe(0);
        expect(instance.getKeyMap('c').length).toBe(0);
    });

    it('test toJson', () => {
        const instance = createInstance();
        const values = [...instance.getValues()];
        const newInstance = new RefAlias(values, ['a', 'c']);
        expect(newInstance.getKeyMap('a')).toEqual(instance.getKeyMap('a'));
        expect(newInstance.getKeyMap('c')).toEqual(instance.getKeyMap('c'));

        newInstance.deleteValue('aa');
        instance.deleteValue('aa');
        expect(newInstance.getValue('aa')).toEqual(instance.getValue('aa'));
        expect(newInstance.getValues()).toEqual(instance.getValues());
    });
});
