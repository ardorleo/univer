/* eslint-disable no-magic-numbers */
import { IShapeProps, Rect, RegularPolygon, Shape } from '@univerjs/base-render';

export interface IHeaderMenuShapeProps extends IShapeProps {
    size?: number;
    mode?: HEADER_MENU_SHAPE_TYPE;
    iconRatio?: number;
}

export enum HEADER_MENU_SHAPE_TYPE {
    NORMAL,
    HIGHLIGHT,
}

export const HEADER_MENU_SHAPE_CIRCLE_FILL = 'rgba(0, 0, 0, 0.15)';

export const HEADER_MENU_SHAPE_TRIANGLE_FILL = 'rgb(0, 0, 0)';

export const HEADER_MENU_BACKGROUND_COLOR = 'rgb(255, 255, 255, 1)';

export class HeaderMenuShape<T extends IHeaderMenuShapeProps = IHeaderMenuShapeProps> extends Shape<T> {
    private _size: number = 12;
    private _iconRatio: number = 0.4;
    private _mode: HEADER_MENU_SHAPE_TYPE = HEADER_MENU_SHAPE_TYPE.NORMAL;

    constructor(key?: string, props?: T) {
        super(key, props);
        this.setShapeProps(props);
    }

    setShapeProps(props?: T) {
        if (props?.size) {
            this._size = props.size;
        }

        if (props?.mode) {
            this._mode = props.mode;
        }

        this.transformByState({
            width: this._size,
            height: this._size,
        });
    }

    protected override _draw(ctx: CanvasRenderingContext2D) {
        if (this._mode === HEADER_MENU_SHAPE_TYPE.HIGHLIGHT) {
            Rect.drawWith(ctx, {
                width: this._size,
                height: this._size,
                radius: this._size,
                fill: HEADER_MENU_SHAPE_CIRCLE_FILL,
            });
        }

        const iconSize = this._size * 0.5 * this._iconRatio;
        const sixtyDegree = (Math.PI / 180) * 60;
        const left = iconSize * Math.sin(sixtyDegree);
        const top = iconSize * Math.cos(sixtyDegree);

        RegularPolygon.drawWith(ctx, {
            pointsGroup: [
                [
                    { x: -left + this._size / 2, y: -top + this._size / 2 },
                    { x: left + this._size / 2, y: -top + this._size / 2 },
                    { x: this._size / 2, y: iconSize + this._size / 2 },
                ],
            ],
            // left: this.left,
            // top: this.top,
            fill: HEADER_MENU_SHAPE_TRIANGLE_FILL,
        });
    }
}
