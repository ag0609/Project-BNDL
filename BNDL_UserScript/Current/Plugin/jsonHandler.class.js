if(!ver) let ver;
ver["JSONHandler"] = "20201130.2";

//Start
console.log("JSONHandler", ver["JSONHandler"], "loaded");

function JSONHandler(json='') {
	let _json = json;
	if(typeof json == 'string') {
		_json = JSON.parse(json);
	}
	this.find = function(value, key=null, root=[]) {
		if(Array.isArray(root)) {
			let path = root;
			root = this.value(root);
			for(let [k, v] of Object.entries(root)) {
				if(typeof v == "object") {
					path.push(k);
					let result = this.find(value, key, path);
					if(Array.isArray(result)) {
						return result;
					} else if(typeof result != "undefined") {
						return path;
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
			error("input root is invalid!");
		}
		return undefined;
	} // return path keys as array like ["0", "children", "13", "name"]
	this.value = function(path) {
		let result = _json;
		path.forEach(v => result = result[v]);
		return result;
	}
}
