import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';

interface Params {
    overlays?: Gtk.Widget[]
    pass_through?: boolean
    passThrough?: boolean
}

export default class AgsOverlay extends Gtk.Overlay {
    static {
        GObject.registerClass({ GTypeName: 'AgsOverlay' }, this);
    }

    constructor({
        overlays = [],
        ...rest
    }: Params = {}) {
        super(rest);
        this.overlays = overlays;
    }

    _overlays!: Gtk.Widget[];
    get overlays() { return this._overlays; }
    set overlays(overlays: Gtk.Widget[]) {
        this._overlays.forEach(ch => this.remove_overlay(ch));
        this._overlays = [];
        overlays.forEach(ch => this.add_overlay(ch));
    }

    add_overlay(widget: Gtk.Widget): void {
        this._overlays.push(widget);
        super.add_overlay(widget);
    }
}
