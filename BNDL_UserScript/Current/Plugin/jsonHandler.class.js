function JSONHandler(json='') {
	let _json = json;
    if(typeof json == 'string') {
        _json = JSON.parse(json);
    }
    this.find = function(value, key=null, root=_json) {
		if(typeof root == "object") {
			let path = [];
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
			this.error("json input is invalid!");
		}
		return undefined;
    }
}