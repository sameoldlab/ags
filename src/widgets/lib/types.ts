import Gtk from 'gi://Gtk?version=4.0';
import GObject from 'gi://GObject';

export type Command = string | ((widget: Gtk.Widget, ...args: unknown[]) => boolean);

export type ConnectWidget = (
    widget: Gtk.Widget,
    callback: (widget: Gtk.Widget, ...args: unknown[]) => void,
    event?: string
) => void

export interface Connectable extends GObject.Object {
    instance: { connectWidget: ConnectWidget }
    connectWidget: ConnectWidget
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Ctor = { new(...args: any[]): Gtk.Widget }

export interface EventParams {
    onFocusEnter?: Command
    onFocusLeave?: Command
    onKeyReleased?: Command
    onKeyPressed?: Command
    onKeyModifier?: Command
    onLegacy?: Command
    onClick?: Command
    onPrimaryClick?: Command
    onPrimaryClickRelease?: Command
    onMiddleClick?: Command
    onMiddleClickRelease?: Command
    onSecondaryClick?: Command
    onSecondaryClickRelease?: Command
    onMotion?: Command
    onHoverLeave?: Command
    onHoverEnter?: Command
    onScroll?: Command
    onScrollUp?: Command
    onScrollDown?: Command
    onScrollRight?: Command
    onScrollLeft?: Command
    onScollDecelerate?: Command
}

export interface CommonParams {
    className?: string
    style?: string
    css?: string
    halign?: 'start' | 'center' | 'end' | 'fill'
    valign?: 'start' | 'center' | 'end' | 'fill'
    connections?: (
        [string, (...args: unknown[]) => unknown] |
        [number, (...args: unknown[]) => unknown] |
        [Connectable, (...args: unknown[]) => unknown, string]
    )[]
    properties?: [prop: string, value: unknown][]
    binds?: [
        prop: string,
        obj: Connectable,
        objProp?: string,
        transform?: (value: unknown) => unknown][],
    setup?: (widget: Gtk.Widget) => void
}

