import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import { runCmd } from '../utils.js';
import { Command } from './lib/types.js';

export default class AgsButton extends Gtk.Button {
    static {
        GObject.registerClass({ GTypeName: 'AgsButton' }, this);
    }

    onClicked: Command;

    constructor({ onClicked = '', ...params } = {}) {
        super(params);

        this.onClicked = onClicked;
        this.connect('clicked', (...args) => runCmd(this.onClicked, ...args));
    }
}
