import './widgets/lib/overrides.js';
import AgsBox from './widgets/box.js';
// import AgsIcon from './widgets/icon.js';
import AgsLabel from './widgets/label.js';
import AgsButton from './widgets/button.js';
import AgsSlider from './widgets/slider.js';
import AgsScrollable from './widgets/scrollable.js';
import AgsStack from './widgets/stack.js';
import AgsOverlay from './widgets/overlay.js';
import AgsRevealer from './widgets/revealer.js';
import AgsEntry from './widgets/entry.js';
import AgsWindow from './widgets/window.js';
// import AgsCircularProgress from './widgets/circularprogress.js';
import { constructor } from './widgets/lib/constructor.js';
import { Ctor } from './widgets/lib/types.js';

export default Widget;
export function Widget({ type, ...params }: { type: Ctor, [prop: string]: unknown }) {
    return constructor(type, params);
}

export const Window = (args: object) => constructor(AgsWindow, args);
export const Box = (args: object) => constructor(AgsBox, args);
export const Button = (args: object) => constructor(AgsButton, args);
// export const CircularProgress = (args: object) => constructor(AgsCircularProgress, args);
export const Entry = (args: object) => constructor(AgsEntry, args);
// export const Icon = (args: object) => constructor(AgsIcon, args);
export const Label = (args: object) => constructor(AgsLabel, args);
export const Overlay = (args: object) => constructor(AgsOverlay, args);
export const Revealer = (args: object) => constructor(AgsRevealer, args);
export const Scrollable = (args: object) => constructor(AgsScrollable, args);
export const Slider = (args: object) => constructor(AgsSlider, args);
export const Stack = (args: object) => constructor(AgsStack, args);

Widget.Widget = Widget;
Widget.Box = Box;
Widget.Button = Button;
// Widget.CircularProgress = CircularProgress;
Widget.Entry = Entry;
// Widget.Icon = Icon;
Widget.Label = Label;
Widget.Overlay = Overlay;
Widget.Revealer = Revealer;
Widget.Scrollable = Scrollable;
Widget.Slider = Slider;
Widget.Stack = Stack;
Widget.Window = Window;
