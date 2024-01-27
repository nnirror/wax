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
	let s = "";
	for (let i = 0; i < length; i++) {
		s += choose(["0","1"]);
	}
	return s;
}