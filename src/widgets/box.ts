import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';

export default class AgsBox extends Gtk.Box {
    static {
        GObject.registerClass({
            GTypeName: 'AgsBox',
            Properties: {
                'vertical': GObject.ParamSpec.boolean(
                    'vertical', 'Vertical', 'Vertical',
                    GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
                    false,
                ),
            },
        }, this);
    }

    constructor({ children, ...rest }: { children?: Gtk.Widget[] | null }) {
        super(rest);

        if (children)
            this.children = children;
    }

    get children(): Gtk.Widget[] {
        const arr = [];
        let ch = this.get_first_child();
        while (ch) {
            arr.push(ch);
            ch = ch.get_next_sibling();
        }
        return arr;
    }

    set children(children: Gtk.Widget[] | null) {
        this.children.forEach(ch => this.remove(ch));

        if (children)
            children.forEach(w => w && this.append(w));
    }

    get vertical() { return this.orientation === Gtk.Orientation.VERTICAL; }
    set vertical(vertical) {
        this.orientation = vertical
            ? Gtk.Orientation.VERTICAL : Gtk.Orientation.HORIZONTAL;
    }
}
