import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Button } from '../../Button';
import { notification } from '../Notification';

describe('Notification', () => {
    test('renders correctly', () => {
        const { container } = render(
            <Button
                onClick={() => {
                    notification.show({
                        type: 'success',
                        title: 'success title',
                        content: 'success content',
                    });
                }}
            >
                btn2
            </Button>
        );

        fireEvent.click(container.querySelector('button')!);

        expect(screen.getByText('success content')).toBeTruthy();
    });
});