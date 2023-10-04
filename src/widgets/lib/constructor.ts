import Gtk from 'gi://Gtk?version=4.0';
import { CommonParams, Ctor, EventParams } from './types.js';
import { connect, interval } from '../../utils.js';

function separateCommon({
    className, style, css, halign, valign, connections, properties, binds, setup,
    onKeyPressed, onKeyReleased, onFocusEnter, onFocusLeave,
    onMotion, onHoverEnter, onHoverLeave, onScroll, onScrollUp, onScrollDown,
    onButtonPressed, onButtonReleased,
    ...rest
}: CommonParams & EventParams) {
    return [
        {
            className, style, css, halign, valign, connections, properties, binds, setup,
            onKeyPressed, onKeyReleased, onFocusEnter, onFocusLeave,
            onMotion, onHoverEnter, onHoverLeave, onScroll, onScrollUp, onScrollDown,
            onButtonPressed, onButtonReleased,
        },
        rest,
    ];
}

function parseCommon(widget: Gtk.Widget, {
    className, style, css, halign, valign,
    connections = [], properties, binds, setup,
    ...eventHandlers
}: CommonParams & EventParams) {
    Object.keys(eventHandlers).forEach(handler => {
        // @ts-expect-error
        if (eventHandlers[handler])
            // @ts-expect-error
            widget[handler] = eventHandlers[handler];
    });

    if (className !== undefined)
        // @ts-expect-error
        widget.className = className;

    if (style !== undefined)
        // @ts-expect-error
        widget.style = style;

    if (css !== undefined)
        // @ts-expect-error
        widget.css = css;


    if (typeof halign === 'string') {
        // @ts-expect-error
        const align = Gtk.Align[halign.toUpperCase()];
        if (typeof align !== 'number')
            console.error('wrong halign value');

        widget.halign = align;
    }

    if (typeof halign === 'number')
        widget.halign = halign;

    if (typeof valign === 'string') {
        // @ts-expect-error
        const align = Gtk.Align[valign.toUpperCase()];
        if (typeof align !== 'number')
            console.error('wrong valign value');

        widget.valign = align;
    }

    if (typeof valign === 'number')
        widget.valign = valign;

    if (properties) {
        properties.forEach(([key, value]) => {
            // @ts-expect-error
            widget[`_${key}`] = value;
        });
    }

    if (binds) {
        binds.forEach(([prop, obj, objProp = 'value', transform = out => out]) => {
            if (!prop || !obj) {
                logError(new Error('missing arguments to binds'));
                return;
            }

            // @ts-expect-error
            const callback = () => widget[prop] = transform(obj[objProp]);
            connections.push([obj, callback, `notify::${objProp}`]);
        });
    }

    if (typeof setup === 'function')
        setup(widget);

    if (connections) {
        connections.forEach(([s, callback, event]) => {
            if (!s || !callback) {
                logError(new Error('missing arguments to connections'));
                return;
            }

            if (typeof s === 'string')
                widget.connect(s, callback);

            else if (typeof s === 'number')
                interval(s, () => callback(widget), widget);

            else if (typeof s?.connectWidget === 'function')
                s.connectWidget(widget, callback, event);

            else if (typeof s?.connect === 'function')
                connect(s, widget, callback, event);

            else
                logError(new Error(`${s} is not connectable`));
        });
    }
}

export function constructor(
    ctor: Ctor,
    params: CommonParams | string = {},
) {
    let widget;
    if (typeof params === 'string') {
        widget = new ctor(params);
    } else {
        const [common, rest] = separateCommon(params);
        widget = new ctor(rest);
        parseCommon(widget, common);
    }
    return widget;
}
