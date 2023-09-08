import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=3.0';
import Gdk from 'gi://Gdk?version=3.0';
import GLib from 'gi://GLib';
import App from '../app.js';

const { GtkLayerShell } = imports.gi;

interface Params {
    anchor?: string[] | string
    exclusive?: boolean
    focusable?: boolean
    layer?: string
    margin?: number[] | number
    monitor?: null | Gdk.Monitor | number
    popup?: boolean
    visible?: null | boolean
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
        popup = false,
        visible = null,
        ...params
    }: Params = {}) {
        super(params);
        GtkLayerShell.init_for_window(this);
        GtkLayerShell.set_namespace(this, this.name);

        this.anchor = anchor;
        this.exclusive = exclusive;
        this.focusable = focusable;
        this.layer = layer;
        this.margin = margin;
        this.monitor = monitor;
        this.show_all();
        this.popup = popup;
        this.visible = visible === true || visible === null && !popup;


        this.connect('delete-event', () => !this._forceDestroy);
        this.connect('destroy', () => !this._forceDestroy);
        Gdk.Display.get_default()?.connect('monitor-added', this._onMonitorAdded.bind(this));
        Gdk.Display.get_default()?.connect('monitor-removed', this._onMonitorRemoved.bind(this));
    }

    private _forceDestroy = false;
    forceDestroy() {
        this._forceDestroy = true;
        this.destroy();
    }

    private _shouldShow = false;
    private _onMonitorAdded() {
        if (this._shouldShow && this.visible) {
            this.visible = false;
            GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
                this.present();

                // TODO figure out how to show on correct monitor
                return GLib.SOURCE_REMOVE;
            });
        }
    }

    private _onMonitorRemoved(_: AgsWindow, monitor: Gdk.Monitor) {
        if (monitor === this.monitor)
            this._shouldShow = true;
    }

    _monitor: Gdk.Monitor | null = null;
    get monitor() { return this._monitor; }
    set monitor(monitor: number | null | Gdk.Monitor) {
        const display = Gdk.Display.get_default();
        if (!display) {
            return;
        }

        else if (typeof monitor === 'number') {
            const m = display.get_monitor(monitor);
            if (!m)
                console.error(`Could not find monitor with id: ${monitor}`);

            GtkLayerShell.set_monitor(this, m);
            this._monitor = m;
        }

        else if (monitor instanceof Gdk.Monitor) {
            GtkLayerShell.set_monitor(this, monitor);
            this._monitor = monitor;
        }

        else {
            const gdkWindow = this.get_window();
            if (!gdkWindow)
                return;

            this._monitor = display.get_monitor_at_window(gdkWindow);
        }
    }

    _exclusive = false;
    get exclusive() { return this._exclusive; }
    set exclusive(exclusive: boolean) {
        this._exclusive = exclusive;
        exclusive
            ? GtkLayerShell.auto_exclusive_zone_enable(this)
            : GtkLayerShell.set_exclusive_zone(this, 0);
    }

    _layer = 'top';
    get layer() { return this._layer; }
    set layer(layer: string) {
        this._layer;
        GtkLayerShell.set_layer(this,
            GtkLayerShell.Layer[layer?.toUpperCase()]);
    }

    _anchor: string[] = [];
    get anchor() { return this._anchor; }
    set anchor(anchor: string[] | string) {
        this._anchor = [];
        ['TOP', 'LEFT', 'RIGHT', 'BOTTOM'].forEach(side =>
            GtkLayerShell.set_anchor(
                this, GtkLayerShell.Edge[side], false,
            ),
        );

        if (typeof anchor === 'string')
            anchor = anchor.split(/\s+/);

        if (Array.isArray(anchor)) {
            anchor.forEach(side => {
                GtkLayerShell.set_anchor(
                    this,
                    GtkLayerShell.Edge[side.toUpperCase()],
                    true,
                );
                this._anchor.push(side);
            });
        }
    }

    _margin: number[] | number = [0];

    // @ts-expect-error
    get margin() { return this._margin; }

    // @ts-expect-error
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
            GtkLayerShell.set_margin(this,
                GtkLayerShell.Edge[side], (margin as number[])[i]),
        );

        this._margin = margin;
    }

    _popup!: number;
    get popup() { return !!this._popup; }
    set popup(popup: boolean) {
        if (this._popup)
            this.disconnect(this._popup);

        if (popup) {
            this.connect('key-press-event', (_, event) => {
                if (event.get_keyval()[1] === Gdk.KEY_Escape) {
                    App.getWindow(this.name)
                        ? App.closeWindow(this.name)
                        : this.hide();
                }
            });
        }
    }

    get focusable() {
        return GtkLayerShell.get_keyboard_mode(this) ===
            GtkLayerShell.KeyboardMode.ON_DEMAND;
    }

    set focusable(focusable: boolean) {
        GtkLayerShell.set_keyboard_mode(
            this, GtkLayerShell.KeyboardMode[focusable ? 'ON_DEMAND' : 'NONE'],
        );
    }
}
