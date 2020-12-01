const ver_JSONHandler = "20201201.1";

//Start
console.log("JSONHandler", ver_JSONHandler, "loaded");

function JSONHandler(json='') {
	let _json = json;
	if(typeof json == 'string') {
		_json = JSON.parse(json);
	}
	this.find = function(value, key=null, root=[]) {
		if(Array.isArray(root)) {
			let path = root;
			for(let [k, v] of Object.entries(this.value(root))) {
				if(typeof v == "object") {
					path.push(k);
					let result = this.find(value, key, path);
					if(Array.isArray(result)) {
						return result;
					} else if(typeof result != "undefined") {
						return path;
					} else {
						path.pop();
					}
				} else {
					if(key) {
						if(key === k && value === v) {
							return null;
						}
					} else {
						if(value === v) {
							return [k];
						}
					}
				}
			}
		} else {
			console.error("input root is invalid!");
		}
		return undefined;
	} // return path keys as array like ["0", "children", "13", "name"]
	this.value = function(path) {
		try {
			let result = _json;
			path.forEach(v => result = result[v]);
			return result;
		} catch(e) {
			console.error("JSONHandler.value", "Error", e.message);	
		}
	}
}
