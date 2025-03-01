import { IScale, numberToABC } from '@univerjs/core';

import { DEFAULT_FONTFACE_PLANE, MIDDLE_CELL_POS_MAGIC_NUMBER } from '../../../basics/const';
import { fixLineWidthByScale, getColor } from '../../../basics/tools';
import { SheetColumnHeaderExtensionRegistry } from '../../extension';
import { SpreadsheetSkeleton } from '../sheet-skeleton';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultColumnHeaderLayoutExtension';

export class ColumnHeaderLayout extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override zIndex = 10;

    override draw(ctx: CanvasRenderingContext2D, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
        const { rowColumnSegment, columnHeaderHeight = 0 } = spreadsheetSkeleton;
        const { startColumn, endColumn } = rowColumnSegment;

        if (!spreadsheetSkeleton) {
            return;
        }

        const { rowHeightAccumulation, columnTotalWidth, columnWidthAccumulation, rowTotalHeight } =
            spreadsheetSkeleton;

        if (
            !rowHeightAccumulation ||
            !columnWidthAccumulation ||
            columnTotalWidth === undefined ||
            rowTotalHeight === undefined
        ) {
            return;
        }

        const scale = this._getScale(parentScale);

        // painting background
        ctx.fillStyle = getColor([248, 249, 250])!;
        ctx.fillRect(0, 0, columnTotalWidth, columnHeaderHeight);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = getColor([0, 0, 0])!;
        ctx.beginPath();
        ctx.lineWidth = 1 / scale;
        ctx.strokeStyle = getColor([217, 217, 217])!;
        ctx.font = `13px ${DEFAULT_FONTFACE_PLANE}`;
        let preColumnPosition = 0;
        const columnWidthAccumulationLength = columnWidthAccumulation.length;
        for (let c = startColumn - 1; c <= endColumn; c++) {
            if (c < 0 || c > columnWidthAccumulationLength - 1) {
                continue;
            }

            const columnEndPosition = fixLineWidthByScale(columnWidthAccumulation[c], scale);
            if (preColumnPosition === columnEndPosition) {
                // Skip hidden rows
                continue;
            }

            // painting line border
            ctx.moveTo(columnEndPosition, 0);
            ctx.lineTo(columnEndPosition, columnHeaderHeight);

            // painting column header text
            const middleCellPos = preColumnPosition + (columnEndPosition - preColumnPosition) / 2;
            ctx.fillText(numberToABC(c), middleCellPos, columnHeaderHeight / 2 + MIDDLE_CELL_POS_MAGIC_NUMBER); // Magic number 1, because the vertical alignment appears to be off by 1 pixel
            preColumnPosition = columnEndPosition;
        }

        // painting line bottom border
        const columnHeaderHeightFix = fixLineWidthByScale(columnHeaderHeight, scale);
        ctx.moveTo(0, columnHeaderHeightFix);
        ctx.lineTo(columnTotalWidth, columnHeaderHeightFix);
        ctx.stroke();
    }
}

SheetColumnHeaderExtensionRegistry.add(new ColumnHeaderLayout());
