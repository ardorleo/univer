import React, { useCallback, useEffect, useRef, useState } from 'react';

import styles from './index.module.less';

export interface IScrollbarProps {
    children?: React.ReactNode;
}

/**
 * Scrollbar Component
 */
export function Scrollbar(props: IScrollbarProps) {
    const { children } = props;

    const [isDragging, setIsDragging] = useState(false);
    const [initialScrollTop, setInitialScrollTop] = useState(0);
    const [scrollPositionY, setScrollPositionY] = useState(0);

    const handleThumbMousedown = useCallback((e: React.MouseEvent | MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsDragging(true);

        setScrollPositionY(e.clientY);
        setInitialScrollTop(contentRef.current!.scrollTop);
    }, []);

    const handleThumbMouseup = useCallback(
        (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (isDragging) {
                setIsDragging(false);
            }
        },
        [isDragging]
    );

    const handleThumbMousemove = useCallback(
        (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (isDragging) {
                const { scrollHeight: contentScrollHeight, offsetHeight: contentOffsetHeight } = contentRef.current!;
                const thumbHeight = contentOffsetHeight * (contentOffsetHeight / contentScrollHeight);
                const deltaY = (e.clientY - scrollPositionY) * (contentOffsetHeight / thumbHeight);
                const scrollTop = Math.min(initialScrollTop + deltaY, contentScrollHeight - contentOffsetHeight);

                contentRef.current!.scrollTop = scrollTop;
            }
        },
        [isDragging]
    );

    // Listen for mouse events to handle scrolling by dragging the thumb
    useEffect(() => {
        document.addEventListener('mousemove', handleThumbMousemove);
        document.addEventListener('mouseup', handleThumbMouseup);
        document.addEventListener('mouseleave', handleThumbMouseup);
        return () => {
            document.removeEventListener('mousemove', handleThumbMousemove);
            document.removeEventListener('mouseup', handleThumbMouseup);
            document.removeEventListener('mouseleave', handleThumbMouseup);
        };
    }, [handleThumbMousemove, handleThumbMouseup]);

    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const [thumbHeight, setThumbHeight] = useState(0);
    const [thumbTop, setThumbTop] = useState(0);
    useEffect(() => {
        const observer = new ResizeObserver(() => {
            let timer: number | undefined = requestIdleCallback(() => {
                if (!timer) return;

                const { height: containerHeight } = containerRef.current!.getBoundingClientRect();

                const { scrollHeight } = contentRef.current!;
                setThumbHeight((containerHeight / scrollHeight) * 100);

                timer = undefined;
            });
        });

        observer.observe(document.body);

        // handle scroll event
        contentRef.current!.addEventListener('scroll', (e) => {
            const { scrollTop, scrollHeight } = e.target as HTMLDivElement;
            const thumbTop = (scrollTop / scrollHeight) * 100;
            setThumbTop(thumbTop);
        });

        return () => {
            observer.unobserve(document.body);
        };
    }, []);

    function handleJumpPosition(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        const { scrollHeight: contentScrollHeight, offsetHeight: contentOffsetHeight } = contentRef.current!;
        const thumbHeight = contentOffsetHeight * (contentOffsetHeight / contentScrollHeight);
        const deltaY = (e.clientY - scrollPositionY) * (contentOffsetHeight / thumbHeight);
        const scrollTop = Math.min(initialScrollTop + deltaY, contentScrollHeight - contentOffsetHeight);

        contentRef.current!.scrollTo({
            top: scrollTop,
            behavior: 'smooth',
        });
    }

    return (
        <div ref={containerRef} className={styles.scrollbarContainer}>
            <div className={styles.scrollbarContent} ref={contentRef} {...props}>
                {children}
            </div>
            {thumbHeight < 100 && thumbHeight > 0 && (
                <div className={styles.scrollbarBar} role="scrollbar" onClick={handleJumpPosition}>
                    <div
                        className={styles.scrollbarBarThumb}
                        style={{
                            height: `${thumbHeight}%`,
                            top: `${thumbTop}%`,
                        }}
                        onMouseDown={handleThumbMousedown}
                    />
                </div>
            )}
        </div>
    );
}
