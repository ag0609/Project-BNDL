let ver_string = "20201214.0";

//
console.log("String.extension", ver_string, "loaded");

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

Object.defineProperty(String.prototype, "toHalfWidth", {value:function(options={}) {
  let string = this;
  let exception = "";
  let range = "\uff01-\uff5e";
  let offset = 0xfee0;
  if(options.oswin) {
    exception += "\uff01\uff02\uff0a\uff0f\uff1a\uff1c\uff1e\uff1f\uff3c\uff5c"; //Windows Filename, 01! 02" 0a* 0f/ 1a: 1c< 1e> 1f? 3c\ 5c|
  }
  if(options.space) string.replace(/\u3000/g, '\u0020');
  const regex = new RegExp("(?!["+exception+"])["+range+"]", "g");
  return string.replace(regex, fwchar => String.fromCharCode(fwchar.charCodeAt(0) - offset));
}});

Object.defineProperty(String.prototype, "similarity", {value:function(key, options={}) {
    let [a,b] = [key, options];
    let c = arguments[2];
    if(!c) c = this;
    let score = 0;
    let matchScore = parseFloat(b.MatchScore) || 50, flowScore = parseFloat(b.FlowScore) || 50;
    let score1=0, score2=0;
    //keys match
    if(typeof a == "string") a = new RegExp(a, "");
    if(b.AllMatch) {
        score1 = a.test(c) ? matchScore : 0;
    } else {
        if(a.source.length*2 > c.length) {
            for(let i=a.source.length; i>0; i--) {
                if((new RegExp(escapeRegExp(a.source.substr(0, i)))).test(c)) {
                    score1 = i * matchScore/a.source.length;
                    break;
                }
            }
        } else {
            for(let i=1; i<=a.source.length; i++) {
                if((new RegExp(escapeRegExp(a.source.substr(0, i)))).test(c)) {
                    score1 = i * matchScore/a.source.length;
                }
            }
        }
    }
    if(score1) {
        score2 = flowScore - (flowScore * Math.abs(c.length - a.source.length)/Math.max(c.length, a.source.length));
    }
    return {"score":score1+score2, "totalScore":matchScore+flowScore, "source":c.toString(), "key":a.source, "MatchScore":score1,"maxMatchScore":matchScore, "FlowScore":score2, "maxFlowScore":flowScore};
}});
