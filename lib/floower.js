
(function() {
	'use strict';

	class Floower {
		constructor() {
			this._events = {}
			this._service = null;
			this._state = {
				petals:		0,
				r:			0,
				g:			0,
				b:			0
			}
		}

		async connect() {
            console.log('Requesting Bluetooth Device...');

			let device = await navigator.bluetooth.requestDevice({
				filters: [ { namePrefix: 'Floower' } ], 
				optionalServices: [ '28e17913-66c1-475f-a76e-86b5242f4cec' ]
			});

			device.addEventListener('gattserverdisconnected', this._disconnect.bind(this));

			let server = await device.gatt.connect();
			this._service = await server.getPrimaryService('28e17913-66c1-475f-a76e-86b5242f4cec');
			
			await this._retrieveState();
		}

		addEventListener(e, f) {
			this._events[e] = f;
		}

		isConnected() {
			return !! this._service;
		}

		get color() {
			return this._rgbToHex(this._state.r, this._state.g, this._state.b);
		}

		set color(color) {
            if (!this._service) return;

			var c = parseInt(color.substring(1), 16);

			this._state.r = (c >> 16) & 255;
			this._state.g = (c >> 8) & 255;
			this._state.b = c & 255;

			this._sendState(0x08);
		}

		get petals() {
			return this._state.petals;
		}

		set petals(value) {
			if (!this._service) return;

			this._state.petals = value;

			this._sendState(0x32);
		}

		_disconnect() {
            console.log('Disconnected from GATT Server...');

			this._service = null;

			if (this._events['disconnected']) {
				this._events['disconnected']();
			}
		}

		async _sendState(speed) {
			let characteristic = await this._service.getCharacteristic('11226015-0424-44d3-b854-9fc332756cbf');
			characteristic.writeValue(new Uint8Array([ this._state.petals, this._state.r, this._state.g, this._state.b, speed, 0x03 ]));
		}

		async _retrieveState() {
			let characteristic = await this._service.getCharacteristic('ac292c4b-8bd0-439b-9260-2d9526fff89a');
			let buffer = await characteristic.readValue();

			if (buffer.byteLength == 4) {
				this._state = new Object({ 
					petals: buffer.getUint8(0), r: buffer.getUint8(1), g: buffer.getUint8(2), b: buffer.getUint8(3) 
				});
			}
		}

		_rgbToHex(red, green, blue) {
			var rgb = blue | (green << 8) | (red << 16);
			return '#' + (0x1000000 + rgb).toString(16).slice(1)
		}
	}

	window.Floower = new Floower();
})();
