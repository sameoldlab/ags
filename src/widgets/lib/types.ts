import Gtk from 'gi://Gtk?version=4.0';
import Gdk from 'gi://Gdk?version=4.0';
import GObject from 'gi://GObject';

export type Command = string | ((...args: unknown[]) => boolean);

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
    // eslint-disable-next-line max-len
    onKeyPressed?: (widget: Gtk.Widget, keyval: number, keycode: number, state: Gdk.ModifierType) => void,
    // eslint-disable-next-line max-len
    onKeyReleased?: (widget: Gtk.Widget, keyval: number, keycode: number, state: Gdk.ModifierType) => void,
    onFocusEnter?: (widget: Gtk.Widget) => void,
    onFocusLeave?: (widget: Gtk.Widget) => void,
    onMotion?: (widget: Gtk.Widget, x: number, y: number) => void,
    onHoverEnter?: (widget: Gtk.Widget, x: number, y: number) => void,
    onHoverLeave?: (widget: Gtk.Widget) => void,
    onScroll?: (widget: Gtk.Widget, dx: number, dy: number) => void,
    onScrollUp?: (widget: Gtk.Widget) => void,
    onScrollDown?: (widget: Gtk.Widget) => void,
    onButtonPressed?: (widget: Gtk.Widget, button: number) => void,
    onButtonReleased?: (widget: Gtk.Widget, button: number) => void,
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

