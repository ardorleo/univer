import { IRange, RANGE_TYPE } from '../types/interfaces/i-range';
import { Nullable } from './types';

/**
 * This class provides a set of methods to calculate `IRange`.
 */
export class Rectangle {
    static clone(src: IRange): IRange {
        return {
            startRow: src.startRow,
            startColumn: src.startColumn,
            endRow: src.endRow,
            endColumn: src.endColumn,
            rangeType: src.rangeType,
        };
    }

    static equals(src: IRange, target: IRange): boolean {
        return (
            src.endRow === target.endRow &&
            src.endColumn === target.endColumn &&
            src.startRow === target.startRow &&
            src.startColumn === target.startColumn &&
            (src.rangeType === target.rangeType ||
                (src.rangeType === undefined && target.rangeType === RANGE_TYPE.NORMAL) ||
                (target.rangeType === undefined && src.rangeType === RANGE_TYPE.NORMAL))
        );
    }

    static intersects(src: IRange, target: IRange): boolean {
        const currentStartRow = src.startRow;
        const currentEndRow = src.endRow;
        const currentStartColumn = src.startColumn;
        const currentEndColumn = src.endColumn;

        const incomingStartRow = target.startRow;
        const incomingEndRow = target.endRow;
        const incomingStartColumn = target.startColumn;
        const incomingEndColumn = target.endColumn;

        const zx = Math.abs(currentStartColumn + currentEndColumn - incomingStartColumn - incomingEndColumn);
        const x = Math.abs(currentStartColumn - currentEndColumn) + Math.abs(incomingStartColumn - incomingEndColumn);
        const zy = Math.abs(currentStartRow + currentEndRow - incomingStartRow - incomingEndRow);
        const y = Math.abs(currentStartRow - currentEndRow) + Math.abs(incomingStartRow - incomingEndRow);

        return zx <= x && zy <= y;
    }

    static getIntersects(src: IRange, target: IRange): Nullable<IRange> {
        const currentStartRow = src.startRow;
        const currentEndRow = src.endRow;
        const currentStartColumn = src.startColumn;
        const currentEndColumn = src.endColumn;

        const incomingStartRow = target.startRow;
        const incomingEndRow = target.endRow;
        const incomingStartColumn = target.startColumn;
        const incomingEndColumn = target.endColumn;

        let startColumn;
        let startRow;
        let endColumn;
        let endRow;
        if (incomingStartRow <= currentEndRow) {
            if (incomingStartRow >= currentStartRow) {
                startRow = incomingStartRow;
            } else {
                startRow = currentStartRow;
            }
        } else {
            return null;
        }

        if (incomingEndRow >= currentStartRow) {
            if (incomingEndRow >= currentEndRow) {
                endRow = currentEndRow;
            } else {
                endRow = incomingEndRow;
            }
        } else {
            return null;
        }

        if (incomingStartColumn <= currentEndColumn) {
            if (incomingStartColumn > currentStartColumn) {
                startColumn = incomingStartColumn;
            } else {
                startColumn = currentStartColumn;
            }
        } else {
            return null;
        }

        if (incomingEndColumn >= currentStartColumn) {
            if (incomingEndColumn >= currentEndColumn) {
                endColumn = currentEndColumn;
            } else {
                endColumn = incomingEndColumn;
            }
        } else {
            return null;
        }

        return {
            startRow,
            endRow,
            startColumn,
            endColumn,
            rangeType: RANGE_TYPE.NORMAL, // TODO: this may not be accurate
        };
    }

    // static subtract(src: IRange, target: IRange): Nullable<IRange[]> {
    //     const intersected = Rectangle.getIntersects(src, target);
    //     if (!intersected) {
    //         return [src];
    //     }

    //     const result: IRange[] = [];
    //     const { startRow, endRow, startColumn, endColumn } = intersected;
    //     const { startRow: srcStartRow, endRow: srcEndRow, startColumn: srcStartColumn, endColumn: srcEndColumn } = src;

    //     // subtract could result in eight pieces and these eight pieces and be merged to at most four pieces
    // }

    static contains(src: IRange, target: IRange): boolean {
        return (
            src.startRow <= target.startRow &&
            src.endRow >= target.endRow &&
            src.startColumn <= target.startColumn &&
            src.endColumn >= target.endColumn
        );
    }

    static realContain(src: IRange, target: IRange): boolean {
        return (
            Rectangle.contains(src, target) &&
            (src.startRow < target.startRow ||
                src.endRow > target.endRow ||
                src.startColumn < target.startColumn ||
                src.endColumn > target.endColumn)
        );
    }

    static union(...ranges: IRange[]): IRange {
        // TODO: range type may not be accurate
        return ranges.reduce(
            (acc, current) => ({
                startRow: Math.min(acc.startRow, current.startRow),
                startColumn: Math.min(acc.startColumn, current.startColumn),
                endRow: Math.max(acc.endRow, current.endRow),
                endColumn: Math.max(acc.endColumn, current.endColumn),
                rangeType: RANGE_TYPE.NORMAL,
            }),
            ranges[0]
        );
    }
    static getRelativeRange = (range: IRange, originRange: IRange) =>
        ({
            startRow: range.startRow - originRange.startRow,
            endRow: range.endRow - range.startRow,
            startColumn: range.startColumn - originRange.startColumn,
            endColumn: range.endColumn - range.startColumn,
        }) as IRange;

    static getPositionRange = (relativeRange: IRange, originRange: IRange) =>
        ({
            startRow: relativeRange.startRow + originRange.startRow,
            endRow: relativeRange.endRow + relativeRange.startRow + originRange.startRow,
            startColumn: relativeRange.startColumn + originRange.startColumn,
            endColumn: relativeRange.endColumn + relativeRange.startColumn + originRange.startColumn,
        }) as IRange;

    static moveHorizontal = (range: IRange, step: number = 0, length: number = 0): IRange => ({
        ...range,
        startColumn: range.startColumn + step,
        endColumn: range.endColumn + step + length,
    });

    static moveVertical = (range: IRange, step: number = 0, length: number = 0): IRange => ({
        ...range,
        startRow: range.startRow + step,
        endRow: range.endRow + step + length,
    });

    static moveOffset = (range: IRange, offsetX: number, offsetY: number): IRange => ({
        ...range,
        startRow: range.startRow + offsetY,
        endRow: range.endRow + offsetY,
        startColumn: range.startColumn + offsetX,
        endColumn: range.endColumn + offsetX,
    });
}
