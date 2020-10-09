/* Pills */

document.getElementById('color').addEventListener('click', (e) => {
	document.body.classList.remove('color', 'customize');
	document.body.classList.add('color');
});

document.getElementById('customize').addEventListener('click', (e) => {
	document.body.classList.remove('color', 'customize');
	document.body.classList.add('customize');
});





/* Color swatches */

var controls = document.getElementById('colorView');

controls.addEventListener('mousedown', handleMouseEvent);
controls.addEventListener('touchstart', handleMouseEvent);

function handleMouseEvent(event) {
    if (event.target.tagName != 'BUTTON') {
        return;
    }
    
	var c = event.target.dataset.value;
	Floower.color = c;
	document.body.style.setProperty('--color', c);

    event.preventDefault();
}




/* Connect to device */

document.getElementById('connect')
	.addEventListener('click', () => {
		Floower.connect()
			.then(() => {
				document.body.classList.add('connected');
				document.body.style.setProperty('--color', Floower.color);
				document.body.style.setProperty('--petal', Floower.petals);

				if (Floower.petals) {
					document.body.classList.add('open');
				}
				
				Floower.addEventListener('disconnected', () => {
					document.body.classList.remove('connected');
				});
			});
	});

document.getElementById('emulate')
	.addEventListener('click', () => {
	    emulateState = true;
		document.body.classList.add('connected');
	});


	document.getElementById('open')
	.addEventListener('click', () => {
		Floower.petals = 100;
		document.body.style.setProperty('--petal', 100);
		document.body.classList.add('open');

	});	
	
	document.getElementById('close')
	.addEventListener('click', () => {
		Floower.petals = 0;
		document.body.style.setProperty('--petal', 0);
		document.body.classList.remove('open');
	});	
	



/* Color format conversion */

// function normalizeColor(rgb) {
// 	if (rgb.search("rgb") == -1) {
// 		return rgb;
// 	}
// 	else if (rgb == 'rgba(0, 0, 0, 0)') {
// 		return 'transparent';
// 	}
// 	else {
// 		rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
		
// 		function hex(x) {
// 		   return ("0" + parseInt(x).toString(16)).slice(-2);
// 		}
		
// 		return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]); 
// 	}
// }  

