import Gtk from 'gi://Gtk?version=4.0';
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
    set: function(v: string) {
        this.set_halign(aligns.findIndex(align => align === v));
    },
});

// event handlers
function defineHandler(
    prop: string,
    signal: string,
    type: string,
    controllerCtor: { new(): Gtk.EventController },
    handleCondition: (...args: unknown[]) => boolean = () => true,
) {
    Object.defineProperty(Gtk.Widget.prototype, prop, {
        get: function() { return this[`_${prop}`]; },
        set: function(handler: Command) {
            const controller = `__${type}_handler`;
            if (!this[controller]) {
                this[controller] = new controllerCtor();
                this.add_controller(this[controller]);

                this[controller].connect(signal, (_: Gtk.EventController, ...args: unknown[]) => {
                    if (handleCondition(...args))
                        return runCmd(this[`_${prop}`], this, ...args);
                });
            }

            this[`_${prop}`] = handler;
        },
    });
}

defineHandler('onFocusLeave', 'leave', 'focus', Gtk.EventControllerFocus);
defineHandler('onFocusEnter', 'enter', 'focus', Gtk.EventControllerFocus);

defineHandler('onKeyReleased', 'key-released', 'key', Gtk.EventControllerKey);
defineHandler('onKeyPressed', 'key-pressed', 'key', Gtk.EventControllerKey);
defineHandler('onKeyModifier', 'modifiers', 'key', Gtk.EventControllerKey);

defineHandler('onMotion', 'motion', 'motion', Gtk.EventControllerMotion);
defineHandler('onHoverLeave', 'leave', 'motion', Gtk.EventControllerMotion);
defineHandler('onHoverEnter', 'enter', 'motion', Gtk.EventControllerMotion);

// TODO onscroll, onbutton
