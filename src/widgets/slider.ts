import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import Gdk from 'gi://Gdk?version=4.0';
import { runCmd } from '../utils.js';
import { Command } from './lib/types.js';

interface Params {
    onChange?: Command
    value?: number
    min?: number
    max?: number
    step?: number
}

export default class AgsSlider extends Gtk.Scale {
    static {
        GObject.registerClass({
            GTypeName: 'AgsSlider',
            Properties: {
                'dragging': GObject.ParamSpec.boolean(
                    'dragging', 'Dragging', 'Dragging',
                    GObject.ParamFlags.READABLE,
                    false,
                ),
                'vertical': GObject.ParamSpec.boolean(
                    'vertical', 'Vertical', 'Vertical',
                    GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
                    false,
                ),
            },
        }, this);
    }

    onChange: Command;

    constructor({
        onChange = '',
        value = 0,
        min = 0,
        max = 1,
        step = 0.01,
        ...rest
    }: Params = {}) {
        super({
            ...rest,
            adjustment: new Gtk.Adjustment({
                lower: min,
                upper: max,
                stepIncrement: step,
            }),
        });

        this.onChange = onChange;

        this.adjustment.connect('notify::value', ({ value }, event) => {
            if (!this.dragging)
                return;

            if (typeof this.onChange === 'function')
                this.onChange(this, event, value);

            if (typeof this.onChange && this.onChange !== '')
                runCmd((onChange as string).replace(/\{\}/g, value));
        });

        // @ts-expect-error
        this.onLegacy = (_, e: Gdk.Event) => {
            if (e.get_event_type() === Gdk.EventType.BUTTON_PRESS) {
                this._dragging = true;
                this.notify('dragging');
            }

            if (e.get_event_type() === Gdk.EventType.BUTTON_RELEASE) {
                this._dragging = false;
                this.notify('dragging');
            }
        };

        if (value)
            this.value = value;
    }

    get value() { return this.adjustment.value; }
    set value(value: number) {
        if (this.dragging)
            return;

        this.adjustment.value = value;
    }

    get min() { return this.adjustment.lower; }
    set min(min: number) { this.adjustment.lower = min; }

    get max() { return this.adjustment.upper; }
    set max(max: number) { this.adjustment.upper = max; }

    get step() { return this.adjustment.stepIncrement; }
    set step(step: number) { this.adjustment.stepIncrement = step; }

    _dragging = false;
    get dragging() { return this._dragging; }

    get vertical() { return this.orientation === Gtk.Orientation.VERTICAL; }
    set vertical(vertical) {
        this.orientation = vertical
            ? Gtk.Orientation.VERTICAL : Gtk.Orientation.HORIZONTAL;
    }
}
