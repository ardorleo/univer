export interface IClipboardItem {
    readonly types: readonly string[];
    getType(type: string): Promise<Blob>;
}

export class MockClipboardItem implements IClipboardItem {
    private readonly itemTypes: readonly string[];
    constructor(private props: IMockClipboardProps) {
        this.itemTypes = Object.keys(props);
    }

    get types(): readonly string[] {
        return this.itemTypes;
    }

    getType(type: string): Promise<Blob> {
        // Here the corresponding mock Blob object is returned according to the type
        if (this.itemTypes.includes(type)) {
            // Mock returns a fake HTML/Text/Image content
            const blob = new Blob([this.props[type as keyof IMockClipboardProps] || ''], { type });
            return Promise.resolve(blob);
        }

        // Can return an false Promise if the types do not match
        return Promise.reject(new Error('Unsupported type'));
    }
}

interface IMockClipboardProps {
    'text/plain'?: string;
    'text/html'?: string;
    'image/png'?: string;
}

export class MockClipboard {
    constructor(private props: IMockClipboardProps) {}
    read(): Promise<IClipboardItem[]> {
        // Here you can return the simulated IClipboardItem array
        const clipboardItems: IClipboardItem[] = [new MockClipboardItem(this.props)];
        return Promise.resolve(clipboardItems);
    }
}
