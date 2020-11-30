if(!ver) let ver;
ver["JSONHandler"] = "20201130.1";

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
			root = zt.find(root);
			for(let [k, v] of Object.entries(root)) {
				if(typeof v == "object") {
					path[0] = k;
					let result = this.find(value, key, root[k]);
					if(Array.isArray(result)) {
						path = path.concat(result);
						return path;
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
							path.push(k);
							return path;
						}
					}
				}
			}
		} else {
			this.error("input root is invalid!");
		}
		return undefined;
	} // return path keys as array like ["0", "children", "13", "name"]
	this.value = function(path) {
		let result = _json;
		path.forEach(v => result = result[v]);
		return result;
	}
}
