/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ctor, Injector } from '@wendellhu/redi';

import { DocumentDataModel } from '../docs/data-model/document-data-model';
import { Plugin, PluginCtor, PluginRegistry, PluginStore, PluginType } from '../plugin/plugin';
import { CommandService, ICommandService } from '../services/command/command.service';
import { ConfigService, IConfigService } from '../services/config/config.service';
import { ContextService, IContextService } from '../services/context/context.service';
import { ErrorService } from '../services/error/error.service';
import {
    FloatingObjectManagerService,
    IFloatingObjectManagerService,
} from '../services/floating-object/floating-object-manager.service';
import { IUniverInstanceService, UniverInstanceService } from '../services/instance/instance.service';
import { LifecycleStages } from '../services/lifecycle/lifecycle';
import { LifecycleInitializerService, LifecycleService } from '../services/lifecycle/lifecycle.service';
import { LocaleService } from '../services/locale/locale.service';
import { DesktopLogService, ILogService } from '../services/log/log.service';
import { IPermissionService, PermissionService } from '../services/permission/permission.service';
import { UniverPermissionService } from '../services/permission/univer.permission.service';
import { ThemeService } from '../services/theme/theme.service';
import { IUndoRedoService, LocalUndoRedoService } from '../services/undoredo/undoredo.service';
import { GenName } from '../shared/gen-name';
import { Workbook } from '../sheets/workbook';
import { Slide } from '../slides/domain/slide-model';
import { LocaleType } from '../types/enum/locale-type';
import { IDocumentData, ISlideData, IUniverData, IWorkbookData } from '../types/interfaces';
import { UniverDoc } from './univer-doc';
import { UniverSheet } from './univer-sheet';
import { UniverSlide } from './univer-slide';

/**
 * Univer.
 */
export class Univer {
    private readonly _rootInjector: Injector;

    private readonly _univerPluginStore = new PluginStore();
    private readonly _univerPluginRegistry = new PluginRegistry();

    private _univerSheet: UniverSheet | null = null;
    private _univerDoc: UniverDoc | null = null;
    private _univerSlide: UniverSlide | null = null;

    private get _univerInstanceService(): IUniverInstanceService {
        return this._rootInjector.get(IUniverInstanceService);
    }

    constructor(univerData: Partial<IUniverData> = {}) {
        this._rootInjector = this._initDependencies();

        const { theme, locale, locales } = univerData;
        theme && this._rootInjector.get(ThemeService).setTheme(theme);
        locales && this._rootInjector.get(LocaleService).load(locales);
        locale && this._rootInjector.get(LocaleService).setLocale(locale);
    }

    __getInjector(): Injector {
        return this._rootInjector;
    }

    dispose(): void {
        this._rootInjector.dispose();
    }

    /** Register a plugin into univer. */
    registerPlugin<T extends Plugin>(plugin: PluginCtor<T>, configs?: any): void {
        if (plugin.type === PluginType.Univer) {
            this._registerUniverPlugin(plugin, configs);
        } else if (plugin.type === PluginType.Sheet) {
            this._registerSheetPlugin(plugin, configs);
        } else if (plugin.type === PluginType.Doc) {
            this._registerDocPlugin(plugin, configs);
        } else if (plugin.type === PluginType.Slide) {
            this._registerSlidePlugin(plugin, configs);
        } else {
            throw new Error(`Unimplemented plugin system for business: "${plugin.type}".`);
        }
    }

    setLocale(locale: LocaleType) {
        this._rootInjector.get(LocaleService).setLocale(locale);
    }

    /**
     * Create a univer sheet instance with internal dependency injection.
     */
    createUniverSheet(config: Partial<IWorkbookData>): Workbook {
        let workbook: Workbook;
        const addSheet = () => {
            workbook = this._univerSheet!.createSheet(config);
            this._univerInstanceService.addSheet(workbook);
        };

        if (!this._univerSheet) {
            this._univerSheet = this._rootInjector.createInstance(UniverSheet);
            this._univerPluginRegistry
                .getRegisterPlugins(PluginType.Sheet)
                .forEach((p) => this._univerSheet!.addPlugin(p.plugin as unknown as PluginCtor<any>, p.options));
            this._tryStart();
            this._univerSheet.start();

            addSheet();

            this._tryProgressToReady();
            this._univerSheet.ready();
        } else {
            addSheet();
        }

        return workbook!;
    }

    createUniverDoc(config: Partial<IDocumentData>): DocumentDataModel {
        let doc: DocumentDataModel;
        const addDoc = () => {
            doc = this._univerDoc!.createDoc(config);
            this._univerInstanceService.addDoc(doc);
        };

        if (!this._univerDoc) {
            this._univerDoc = this._rootInjector.createInstance(UniverDoc);
            this._univerPluginRegistry
                .getRegisterPlugins(PluginType.Doc)
                .forEach((p) => this._univerDoc!.addPlugin(p.plugin as unknown as PluginCtor<any>, p.options));
            this._tryStart();
            this._univerDoc.start();

            addDoc();

            this._tryProgressToReady();
            this._univerDoc.ready();
        } else {
            addDoc();
        }

        return doc!;
    }

    createUniverSlide(config: Partial<ISlideData>): Slide {
        let slide: Slide;
        const addSlide = () => {
            slide = this._univerSlide!.createSlide(config);
            this._univerInstanceService.addSlide(slide);
        };

        if (!this._univerSlide) {
            this._univerSlide = this._rootInjector.createInstance(UniverSlide);

            this._univerPluginRegistry
                .getRegisterPlugins(PluginType.Slide)
                .forEach((p) => this._univerSlide!.addPlugin(p.plugin as unknown as PluginCtor<any>, p.options));
            this._tryStart();
            this._univerSlide.ready();
            addSlide();

            this._tryProgressToReady();
        } else {
            addSlide();
        }

        return slide!;
    }

    private _initDependencies(): Injector {
        return new Injector([
            [
                IUniverInstanceService,
                {
                    useFactory: (contextService: IContextService) =>
                        new UniverInstanceService(
                            {
                                createUniverDoc: (data) => this.createUniverDoc(data),
                                createUniverSheet: (data) => this.createUniverSheet(data),
                                createUniverSlide: (data) => this.createUniverSlide(data),
                            },
                            contextService
                        ),
                    deps: [IContextService],
                },
            ],
            [ErrorService],
            [LocaleService],
            [ThemeService],
            [GenName],
            [LifecycleService],
            [LifecycleInitializerService],
            [IPermissionService, { useClass: PermissionService }],
            [UniverPermissionService],
            [ILogService, { useClass: DesktopLogService, lazy: true }],
            [ICommandService, { useClass: CommandService, lazy: true }],
            [IUndoRedoService, { useClass: LocalUndoRedoService, lazy: true }],
            [IConfigService, { useClass: ConfigService }],
            [IContextService, { useClass: ContextService }],
            [IFloatingObjectManagerService, { useClass: FloatingObjectManagerService, lazy: true }],
        ]);
    }

    private _tryStart(): void {
        this._rootInjector.get(LifecycleInitializerService).start();
    }

    private _tryProgressToReady(): void {
        const lifecycleService = this._rootInjector.get(LifecycleService);
        if (lifecycleService.stage < LifecycleStages.Ready) {
            this._rootInjector.get(LifecycleService).stage = LifecycleStages.Ready;
            this._univerPluginStore.forEachPlugin((p) => p.onReady());
        }
    }

    private _registerUniverPlugin<T extends Plugin>(plugin: PluginCtor<T>, options?: any): void {
        // For plugins at Univer level. Plugins would be initialized immediately so they can register dependencies.
        const pluginInstance: Plugin = this._rootInjector.createInstance(plugin as unknown as Ctor<any>, options);
        pluginInstance.onStarting(this._rootInjector);
        this._univerPluginStore.addPlugin(pluginInstance);
    }

    private _registerSheetPlugin<T extends Plugin>(pluginCtor: PluginCtor<T>, options?: any) {
        this._univerPluginRegistry.registerPlugin(pluginCtor, options);
        // TODO: implement add plugin when Univer business object is created
        // Add plugins to the plugin registration. And for each initialized UniverSheet, instantiate these dependencies immediately.
        // const sheets = this._currentUniverService.getAllUniverSheetsInstance();
        // if (sheets.length) {
        //     sheets.forEach((sheet) => {
        //         sheet.addPlugin(pluginCtor, options);
        //     });
        // }
    }

    private _registerDocPlugin<T extends Plugin>(pluginCtor: PluginCtor<T>, options?: any) {
        this._univerPluginRegistry.registerPlugin(pluginCtor, options);
        // const docs = this._currentUniverService.getAllUniverDocsInstance();
        // if (docs.length) {
        //     docs.forEach((doc) => {
        //         doc.addPlugin(pluginCtor, options);
        //     });
        // }
    }

    private _registerSlidePlugin<T extends Plugin>(pluginCtor: PluginCtor<T>, options?: any) {
        this._univerPluginRegistry.registerPlugin(pluginCtor, options);
        // const slides = this._currentUniverService.getAllUniverSlidesInstance();
        // if (slides.length) {
        //     slides.forEach((slide) => {
        //         slide.addPlugin(pluginCtor, options);
        //     });
        // }
    }

    private _initializePluginsForDoc(doc: UniverDoc): void {
        const plugins = this._univerPluginRegistry.getRegisterPlugins(PluginType.Doc);
        plugins.forEach((p) => {
            doc.addPlugin(p.plugin as unknown as PluginCtor<any>, p.options);
        });
    }

    private _initializePluginsForSlide(slide: UniverSlide): void {
        const plugins = this._univerPluginRegistry.getRegisterPlugins(PluginType.Slide);
        plugins.forEach((p) => {
            slide.addPlugin(p.plugin as unknown as PluginCtor<any>, p.options);
        });
    }
}
