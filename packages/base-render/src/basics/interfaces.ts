import {
    BooleanNumber,
    GridType,
    IDocStyleBase,
    IDocumentLayout,
    IOffset,
    IParagraphStyle,
    IReferenceSource,
    IScale,
    ISectionBreakBase,
    ISize,
    ITextStyle,
    ITransformState,
    LocaleService,
} from '@univerjs/core';

import { DocumentViewModel } from '../components/docs/view-model/document-view-model';
import {
    IDocumentSkeletonBullet,
    IDocumentSkeletonDrawing,
    IDocumentSkeletonDrawingAnchor,
    IDocumentSkeletonFontStyle,
    IDocumentSkeletonFooter,
    IDocumentSkeletonHeader,
    IDocumentSkeletonSpan,
} from './i-document-skeleton-cached';
import { Vector2 } from './vector2';

export interface IObjectFullState extends ITransformState {
    strokeWidth?: number;
    zIndex?: number;
    isTransformer?: boolean;
    forceRender?: boolean;
    debounceParentDirty?: boolean;
}

export interface IRect extends ISize, IOffset {
    points: Vector2[];
}

export interface ISceneTransformState extends ISize, IScale {}

export enum TRANSFORM_CHANGE_OBSERVABLE_TYPE {
    translate,
    resize,
    scale,
    skew,
    flip,
    all,
}

export interface ITransformChangeState {
    type: TRANSFORM_CHANGE_OBSERVABLE_TYPE;
    value:
        | number
        | string
        | boolean
        | { x: number | string | boolean; y: number | string | boolean }
        | IObjectFullState
        | ISceneTransformState;
    preValue:
        | number
        | string
        | boolean
        | { x: number | string | boolean; y: number | string | boolean }
        | IObjectFullState
        | ISceneTransformState;
}

export interface IFontLocale {
    fontList: string[];
    defaultFontSize: number;
}

export interface IMeasureTextCache {
    fontBoundingBoxAscent: number;
    fontBoundingBoxDescent: number;
    actualBoundingBoxAscent: number;
    actualBoundingBoxDescent: number;
    width: number;
}

export interface IDocsConfig extends IReferenceSource, IDocumentLayout {
    localeService: LocaleService;
    documentTextStyle?: ITextStyle;
    headerTreeMap: Map<string, DocumentViewModel>;
    footerTreeMap: Map<string, DocumentViewModel>;
}

export interface IHeaderIds {
    defaultHeaderId?: string;
    evenPageHeaderId?: string;
    firstPageHeaderId?: string;
}

export interface IFooterIds {
    defaultFooterId?: string;
    evenPageFooterId?: string;
    firstPageFooterId?: string;
}

export interface ISectionBreakConfig extends IDocStyleBase, ISectionBreakBase, IDocsConfig {
    headerIds?: IHeaderIds;
    footerIds?: IFooterIds;
    useFirstPageHeaderFooter?: BooleanNumber;
    useEvenPageHeaderFooter?: BooleanNumber;
}

export interface IParagraphConfig {
    paragraphIndex: number;
    paragraphAffectSkeDrawings?: Map<string, IDocumentSkeletonDrawing>;
    // headerAndFooterAffectSkeDrawings?: Map<string, IDocumentSkeletonDrawing>;
    bulletSkeleton?: IDocumentSkeletonBullet;
    // pageContentWidth: number;
    // pageContentHeight: number;
    paragraphStyle?: IParagraphStyle;
    skeHeaders: Map<string, Map<number, IDocumentSkeletonHeader>>;
    skeFooters: Map<string, Map<number, IDocumentSkeletonFooter>>;
    drawingAnchor?: Map<number, IDocumentSkeletonDrawingAnchor>;
    // sectionBreakConfig: ISectionBreakConfig;
}

export interface IFontCreateConfig {
    fontStyle: IDocumentSkeletonFontStyle;
    textStyle: ITextStyle;
    charSpace: number;
    gridType?: GridType;
    snapToGrid: BooleanNumber;
    pageWidth?: number;
}

// export interface IPageConfig {
//     pageNumberStart: number;
//     pageSize: ISize;
//     headerIds: IHeaderIds;
//     footerIds: IFooterIds;
//     footers?: IFooters;
//     headers?: IHeaders;
//     useFirstPageHeaderFooter?: boolean;
//     useEvenPageHeaderFooter?: boolean;
// }

export interface INodeInfo {
    node: IDocumentSkeletonSpan;
    ratioX: number;
    ratioY: number;
}

export interface INodeSearch {
    span: number;
    divide: number;
    line: number;
    column: number;
    section: number;
    page: number;
}

export interface INodePosition extends INodeSearch {
    isBack: boolean;
}
