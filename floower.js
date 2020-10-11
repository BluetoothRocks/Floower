
(function() {
	'use strict';

	class Floower {
		constructor() {
			this._events = {}
			this._service = null;
			this._colorScheme = [];
			this._threshold = 0;
			this._state = {
				petals:		0,
				r:			0,
				g:			0,
				b:			0
			}
		}

		/* Functions */

		async connect() {
			let device = await navigator.bluetooth.requestDevice({
				filters: [ { namePrefix: 'Floower' } ], 
				optionalServices: [ '28e17913-66c1-475f-a76e-86b5242f4cec' ]
			});

			device.addEventListener('gattserverdisconnected', this._disconnect.bind(this));

			let server = await device.gatt.connect();
			this._service = await server.getPrimaryService('28e17913-66c1-475f-a76e-86b5242f4cec');

			await this._retrieveState();
			await this._retrieveThreshold();
			await this._retrieveColorScheme();
		}

		disconnect() {
			this._service.device.gatt.disconnect();
		}

		addEventListener(e, f) {
			this._events[e] = f;
		}

		off() {
			this._state.petals = 0;
			this._state.r = 0;
			this._state.g = 0;
			this._state.b = 0;

			this._sendState(0x32);
		}

		open() {
			this._state.petals = 100;
			this._sendState(0x32);
		}

		close() {
			this._state.petals = 0;
			this._sendState(0x32);
		}

		toggle() {
			this._state.petals = this._state.petals ? 0 : 100;
			this._sendState(0x32);
		}


		/* Properties */

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

		get colorScheme() {
			return new Proxy([...this._colorScheme], {
				set: function(target, prop, value) {
					this._colorScheme[prop] = value;
					this._sendColorScheme();
				}
			})
		}

		set colorScheme(value) {
			this._colorScheme = [...value];
			this._sendColorScheme();
		}

		get threshold() {
			return this._threshold;
		}

		set threshold(value) {
			this._threshold = value;
			this._sendThreshold();
		}

		get petals() {
			return this._state.petals;
		}

		set petals(value) {
			if (!this._service) return;

			this._state.petals = value;

			this._sendState(0x32);
		}



		/* Internal functions */

		_disconnect() {
			this._service = null;

			if (this._events['disconnected']) {
				this._events['disconnected']();
			}
		}

		async _sendState(speed) {
			if (!this._service) return; 

			let characteristic = await this._service.getCharacteristic('11226015-0424-44d3-b854-9fc332756cbf');
			characteristic.writeValue(new Uint8Array([ this._state.petals, this._state.r, this._state.g, this._state.b, speed, 0x03 ]));
		}

		async _retrieveState() {
			if (!this._service) return; 
			
			let characteristic = await this._service.getCharacteristic('ac292c4b-8bd0-439b-9260-2d9526fff89a');
			let buffer = await characteristic.readValue();

			if (buffer.byteLength == 4) {
				this._state = new Object({ 
					petals: buffer.getUint8(0), r: buffer.getUint8(1), g: buffer.getUint8(2), b: buffer.getUint8(3) 
				});
			}
		}

		async _retrieveThreshold() {
			if (!this._service) return; 
			
			let characteristic = await this._service.getCharacteristic('c380596f-10d2-47a7-95af-95835e0361c7');
			let buffer = await characteristic.readValue();

			this._threshold = buffer.getUint8(0);
		}

		async _sendThreshold(speed) {
			if (!this._service) return; 
			
			let characteristic = await this._service.getCharacteristic('c380596f-10d2-47a7-95af-95835e0361c7');
			characteristic.writeValue(new Uint8Array([ this._threshold ]));
		}

		async _sendColorScheme() {
			if (!this._service) return; 
			
			let buffer = new Uint8Array(this._colorScheme.length * 3);

			for (let i = 0; i < this._colorScheme.length; i++) {
				buffer.set([
					parseInt(this._colorScheme[i].substring(1, 3), 16),
					parseInt(this._colorScheme[i].substring(3, 5), 16),
					parseInt(this._colorScheme[i].substring(5, 7), 16)
				], i * 3);
			}

			let characteristic = await this._service.getCharacteristic('7b1e9cff-de97-4273-85e3-fd30bc72e128');
			characteristic.writeValue(buffer);
		}

		async _retrieveColorScheme() {
			if (!this._service) return; 
			
			let characteristic = await this._service.getCharacteristic('7b1e9cff-de97-4273-85e3-fd30bc72e128');
			let buffer = await characteristic.readValue();

			for (let i = 0; i < buffer.byteLength / 3; i++) {
				this._colorScheme[i] = this._rgbToHex(
					buffer.getUint8((i * 3)),
					buffer.getUint8((i * 3) + 1),
					buffer.getUint8((i * 3) + 2)
				);
			}
		}

		_rgbToHex(red, green, blue) {
			var rgb = blue | (green << 8) | (red << 16);
			return '#' + (0x1000000 + rgb).toString(16).slice(1)
		}
	}

	window.Floower = new Floower();
})();
