# BluetoothRocks! Floower
Controlling a Floower with WebBluetooth


## What do you need?

A browser that support WebBluetooth on your operating system and a [Floower](https://floower.io).


## How does this work?

The browser can connect to a Bluetooth LE device like the Floower using the WebBluetooth API. Each Bluetooth device has a number of services and characteristics. Think of them like objects with properties. Once connected to the device, the API then exposes these services and characteristics and you can read from and write to those characteristics.

## But, how does the CSS animation work?

It's actually not that difficult. The animation is applied to the drawing of the Floower in the DOM. Every 100ms we check the current color using `getComputedStyle`. If the color changes, we send a command to the Floower. So the animation runs in the DOM and we get it almost for free.

## Why??

Because it's fun. And I got to play around with all kinds of new specifications like WebBluetooth, CSS Grids, Viewport units and SVG.
