import Gtk from 'gi://Gtk?version=4.0';
import Gdk from 'gi://Gdk?version=4.0';
import { Command } from './types.js';
import { runCmd } from '../../utils.js';

// styles
const widgetProviders: Map<Gtk.Widget, Gtk.CssProvider> = new Map();
function setCss(widget: Gtk.Widget, css: string) {
    const previous = widgetProviders.get(widget);
    if (previous)
        widget.get_style_context().remove_provider(previous);

    const provider = new Gtk.CssProvider();
    widgetProviders.set(widget, provider);
    provider.load_from_data(css, css.length);
    widget.get_style_context()
        .add_provider(provider, Gtk.STYLE_PROVIDER_PRIORITY_USER);
}

Object.defineProperty(Gtk.Widget.prototype, 'style', {
    get: function() {
        return this._style || '';
    },
    set: function(css: string) {
        if (typeof css !== 'string') {
            console.error('style has to be a string');
            return;
        }

        setCss(this, `* { ${css} }`);
        this._style = css;
    },
});

Object.defineProperty(Gtk.Widget.prototype, 'css', {
    get: function() {
        return this._css || '';
    },
    set: function(css: string) {
        if (typeof css !== 'string') {
            console.error('css has to be a string');
            return;
        }

        setCss(this, css);
        this._css = css;
    },
});

// @ts-expect-error
Gtk.Widget.prototype.setCss = function(css: string) {
    setCss(this, css);
};

// @ts-expect-error
Gtk.Widget.prototype.setStyle = function(css: string) {
    setCss(this, `* { ${css} }`);
};

// aligns
const aligns = [
    'fill', 'start', 'end', 'center',
    'baseline_fill', 'baseline', 'baseline_center',
];

Object.defineProperty(Gtk.Widget.prototype, 'halign', {
    get: function() {
        return aligns[this.get_halign()];
    },
    set: function(v: string | number) {
        if (typeof v === 'string')
            this.set_halign(aligns.findIndex(align => align === v));
        else
            this.set_halign(v);
    },
});

// event handlers
type Widget = { [key: string]: Gtk.EventController };
function makeController(
    widget: Widget,
    type: 'Focus' | 'Key' | 'Motion' | 'Legacy' | 'Scroll',
    setup: (controller: Gtk.EventController) => void,
) {
    const name = `_${type.toLowerCase()}Controller`;
    if (!widget[name]) {
        const controller = new Gtk[`EventController${type}`]();
        widget[name] = controller;
        (widget as unknown as Gtk.Widget).add_controller(controller);
        setup(controller);
    }
}

const focus = (w: Widget) => makeController(w, 'Focus', c => {
    const controller = c as Gtk.EventControllerFocus;
    const widget = w as unknown as { [handler: string]: Command };
    controller.connect('enter', () => {
        return runCmd(widget['onFocusEnter'], widget);
    });
    controller.connect('leave', () => {
        return runCmd(widget['onFocusLeave'], widget);
    });
});

const key = (w: Widget) => makeController(w, 'Key', c => {
    const controller = c as Gtk.EventControllerKey;
    const widget = w as unknown as { [handler: string]: Command };
    controller.connect('key-pressed', (_, ...args: number[]) => {
        return runCmd(widget['onKeyPressed'], widget, ...args);
    });
    controller.connect('key-released', (_, ...args: number[]) => {
        return runCmd(widget['onKeyReleased'], widget, ...args);
    });
    controller.connect('modifiers', (_, ...args: number[]) => {
        return runCmd(widget['onKeyModifier'], widget, ...args);
    });
});

const legacy = (w: Widget) => makeController(w, 'Legacy', c => {
    const controller = c as Gtk.EventControllerKey;
    const widget = w as unknown as { [handler: string]: Command };
    controller.connect('event', (_, e: Gdk.Event) => {
        const btnPress = e.get_event_type() === Gdk.EventType.BUTTON_PRESS;
        const btnRelease = e.get_event_type() === Gdk.EventType.BUTTON_RELEASE;
        const mod = e.get_modifier_state();
        let handled = false;

        handled ||= runCmd(widget['onLegacy'], widget, e);

        if (btnPress || btnRelease) {
            const button = (e as Gdk.ButtonEvent).get_button();
            handled ||= runCmd(widget['onClick'], widget, button, mod);
        }

        if (btnPress) {
            const button = (e as Gdk.ButtonEvent).get_button();
            if (button === 1)
                handled ||= runCmd(widget['onPrimaryClick'], widget, mod);

            else if (button === 2)
                handled ||= runCmd(widget['onMiddleClick'], widget, mod);

            else if (button === 3)
                handled ||= runCmd(widget['onSecondaryClick'], widget, mod);
        }


        if (btnRelease) {
            const button = (e as Gdk.ButtonEvent).get_button();
            if (button === 1)
                handled ||= runCmd(widget['onPrimaryClickRelease'], widget, mod);

            else if (button === 2)
                handled ||= runCmd(widget['onMiddleClickRelease'], widget, mod);

            else if (button === 3)
                handled ||= runCmd(widget['onSecondaryClickRelease'], widget, mod);
        }

        return handled;
    });
});

const motion = (w: Widget) => makeController(w, 'Motion', c => {
    const controller = c as Gtk.EventControllerMotion;
    const widget = w as unknown as { [handler: string]: Command };
    controller.connect('enter', (_, ...args: number[]) => {
        return runCmd(widget['onHoverEnter'], widget, ...args);
    });
    controller.connect('leave', () => {
        return runCmd(widget['onHoverLeave'], widget);
    });
    controller.connect('enter', (_, ...args: number[]) => {
        return runCmd(widget['onMotion'], widget, ...args);
    });
});

const scroll = (w: Widget) => makeController(w, 'Scroll', c => {
    const controller = c as Gtk.EventControllerScroll;
    const widget = w as unknown as { [handler: string]: Command };
    controller.set_flags(Gtk.EventControllerScrollFlags.BOTH_AXES);
    controller.connect('scroll', (_, dx: number, dy: number) => {
        let handled = false;

        handled ||= runCmd(widget['onScoll'], widget, dx, dy);

        if (dy < 0)
            handled ||= runCmd(widget['onScrollUp'], widget, dx, dy);

        else if (dy > 0)
            handled ||= runCmd(widget['onScrollDown'], widget, dx, dy);

        if (dx < 0)
            handled ||= runCmd(widget['onScrollLeft'], widget, dx, dy);

        else if (dx > 0)
            handled ||= runCmd(widget['onScrollRight'], widget, dx, dy);

        return handled;
    });
    controller.connect('scroll-begin', () => {
        return runCmd(widget['onScollBegin'], widget);
    });
    controller.connect('scroll-end', () => {
        return runCmd(widget['onScollEnd'], widget);
    });
    controller.connect('scroll-end', (_, ...args: number[]) => {
        return runCmd(widget['onScollDecelerate'], widget, ...args);
    });
});

function defineHandler(
    type: 'Focus' | 'Key' | 'Motion' | 'Legacy' | 'Scroll',
    props: string[],
) {
    props.forEach(prop => Object.defineProperty(Gtk.Widget.prototype, prop, {
        get: function() { return this[`_${prop}`]; },
        set: function(handler: Command) {
            this[`_${prop}`] = handler;
            switch (type) {
                case 'Focus': focus(this as Widget); break;
                case 'Key': key(this as Widget); break;
                case 'Legacy': legacy(this as Widget); break;
                case 'Motion': motion(this as Widget); break;
                case 'Scroll': scroll(this as Widget); break;
            }
        },
    }));
}

defineHandler('Focus', [
    'onFocusEnter',
    'onFocusLeave',
]);

defineHandler('Key', [
    'onKeyReleased',
    'onKeyPressed',
    'onKeyModifier',
]);

defineHandler('Legacy', [
    'onLegacy',
    'onClick',
    'onPrimaryClick',
    'onPrimaryClickRelease',
    'onMiddleClick',
    'onMiddleClickRelease',
    'onSecondaryClick',
    'onSecondaryClickRelease',
]);

defineHandler('Motion', [
    'onMotion',
    'onHoverLeave',
    'onHoverEnter',
]);

defineHandler('Scroll', [
    'onScroll',
    'onScrollUp',
    'onScrollDown',
    'onScrollRight',
    'onScrollLeft',
    'onScollDecelerate',
]);
