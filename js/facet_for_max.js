function ri (min = 0, max = 1, weight = 1) {
	return random(min,max,1,weight);
}
  
function rf (min = 0, max = 1, weight = 1) {
	return random(min,max,0,weight);
}
  
function random(min = 0, max = 1, int_mode = 0, weight = 1) {
	let num = Math.pow(Math.random(), weight) * (Number(max) - Number(min)) + Number(min);
	if (int_mode != 0) {
		num = Math.round(num);
	}
	return num;
}

function choose (list) {
	return list[Math.floor(Math.random()*list.length)];
}

function turing(length) {
	let s = [];
	for (let i = 0; i < length; i++) {
		s.push(choose([0,1]));
	}
	return s;
}

function sine ( frequency, length ) {
	let s = [];
	for (let i = 0; i < length; i++) {
		s.push(Math.sin(2*Math.PI*frequency*i/length));
	}
	return s;
}

function noise (length) {
	let s = [];
	for (let i = 0; i < length; i++) {
		s.push(Math.random()*2-1);
	}
	return s;
}