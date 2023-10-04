import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import Gdk from 'gi://Gdk?version=4.0';

const { Gtk4LayerShell: LayerShell } = imports.gi;

interface Params {
    anchor?: string[] | string
    exclusive?: boolean
    focusable?: boolean
    layer?: string
    margin?: number[] | number
    monitor?: null | Gdk.Monitor | number
    visible?: boolean
}

export default class AgsWindow extends Gtk.Window {
    static {
        GObject.registerClass({ GTypeName: 'AgsWindow' }, this);
    }

    constructor({
        anchor = [],
        exclusive = false,
        focusable = false,
        layer = 'top',
        margin = [],
        monitor = null,
        visible = true,
        ...params
    }: Params = {}) {
        super({ visible, ...params });
        LayerShell.init_for_window(this);
        LayerShell.set_namespace(this, this.name);

        this.anchor = anchor;
        this.exclusive = exclusive;
        this.focusable = focusable;
        this.layer = layer;
        this.margin = margin;
        this.monitor = monitor;
    }

    _monitor: Gdk.Monitor | null = null;
    get monitor() { return this._monitor; }
    set monitor(monitor: number | null | Gdk.Monitor) {
        if (monitor === null) {
            this._monitor = monitor;
            return;
        }

        if (typeof monitor === 'number') {
            const m = Gdk.Display.get_default()?.get_monitors()
                .get_item(monitor) as Gdk.Monitor;

            if (m) {
                LayerShell.set_monitor(this, m);
                this._monitor = m;
                return;
            }
            console.error(`Could not find monitor with id: ${monitor}`);
        }

        if (monitor instanceof Gdk.Monitor) {
            LayerShell.set_monitor(this, monitor);
            this._monitor = monitor;
        }
    }

    _exclusive = false;
    get exclusive() { return this._exclusive; }
    set exclusive(exclusive: boolean) {
        this._exclusive = exclusive;
        exclusive
            ? LayerShell.auto_exclusive_zone_enable(this)
            : LayerShell.set_exclusive_zone(this, 0);
    }

    _layer = 'top';
    get layer() { return this._layer; }
    set layer(layer: string) {
        this._layer;
        LayerShell.set_layer(this,
            LayerShell.Layer[layer?.toUpperCase()]);
    }

    _anchor: string[] = [];
    get anchor() { return this._anchor; }
    set anchor(anchor: string[] | string) {
        this._anchor = [];
        ['TOP', 'LEFT', 'RIGHT', 'BOTTOM'].forEach(side =>
            LayerShell.set_anchor(this, LayerShell.Edge[side], false));

        if (typeof anchor === 'string')
            anchor = anchor.split(/\s+/);

        if (Array.isArray(anchor)) {
            anchor.forEach(side => {
                LayerShell.set_anchor(
                    this,
                    LayerShell.Edge[side.toUpperCase()],
                    true,
                );
                this._anchor.push(side);
            });
        }
    }

    _margin: number[] | number = [0];
    get margin() { return this._margin; }
    set margin(margin: number[] | number) {
        let margins: [side: string, index: number][] = [];
        if (typeof margin === 'number')
            margin = [margin];

        switch (margin.length) {
            case 1:
                margins = [['TOP', 0], ['RIGHT', 0], ['BOTTOM', 0], ['LEFT', 0]];
                break;
            case 2:
                margins = [['TOP', 0], ['RIGHT', 1], ['BOTTOM', 0], ['LEFT', 1]];
                break;
            case 3:
                margins = [['TOP', 0], ['RIGHT', 1], ['BOTTOM', 2], ['LEFT', 1]];
                break;
            case 4:
                margins = [['TOP', 0], ['RIGHT', 1], ['BOTTOM', 2], ['LEFT', 3]];
                break;
            default:
                break;
        }

        margins.forEach(([side, i]) =>
            LayerShell.set_margin(this,
                LayerShell.Edge[side], (margin as number[])[i]),
        );

        this._margin = margin;
    }

    get focusable() {
        return LayerShell.get_keyboard_mode(this) ===
            LayerShell.KeyboardMode.ON_DEMAND;
    }

    set focusable(focusable: boolean) {
        LayerShell.set_keyboard_mode(
            this, LayerShell.KeyboardMode[focusable ? 'ON_DEMAND' : 'NONE'],
        );
    }
}
