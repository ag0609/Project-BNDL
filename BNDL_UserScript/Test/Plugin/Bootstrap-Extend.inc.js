function toast($_msg, _$t='default', _hT, $_t, _0pts={}) {
	let _reTi = 5000;
	let no_Co = HTML_Con = false;
	let pos = {top:0, left:0};
	let tc = $('.toast-container');
	let ntc;
	for(let k in _0pts) {
		switch(k) {
			case "noCollaspe":
				no_Co = _0pts[k] ? true : false;
				break;
			case "refreshTime":
				_reTi = parseInt(_0pts[k]) || 0;
				break;
			case "htmlBody":
				HTML_Con = _0pts[k] ? true : false;
				break;
			case "containerSel":
				ntc = $(_0pts[k]);
				ntc = ntc.length ? _0pts[k] : null;
				break;
			case "containerPos":
				//Clear all position class
				if(tc.length) tc.removeClass('top-0 left-0 right-0 bottom-0').css({top:'',bottom:'',left:'',right:''})
				//Default is LT(LeftTop)
				let newpos = {};
				if(_0pts[k].includes("R")) {
					if(tc.length) tc.addClass('right-0');
					newpos.right = 0;
				} else {
					if(tc.length) tc.addClass('left-0');
					newpos.left = 0;
				}
				if(_0pts[k].includes("B")) {
					if(tc.length) tc.addClass('bottom-0');
					newpos.bottom = 0;
				} else {
					if(tc.length) tc.addClass('top-0');
					newpos.top = 0;
				}
				pos = newpos;
				if(tc.length) tc.css(newpos);
				break;
		}
	}
	
	if(!tc.length) {
		let bnt = $("<div>").addClass('toast-container container position-fixed overflow-auto w-25 mh-100 h-auto p-3').css(pos).css({'overflow-x':'hidden', 'z-index':1070000});
		let bnto = $("<div>").addClass('toast w-100 p-0 bg-white overflow-hidden')
						 .attr({role:'alert','aria-live':'assertive','aria-atomic':'true'});
		bnto.toast({autohide:false});
		let bntoh = $('<div>').addClass('toast-header text-truncate text-start user-select-none p-1');
		bntoh.appendTo(bnto);
		let bntob = $('<div>').attr({id:"toast-00000"}).addClass('toast-body text-dark collapse show font-weight-normal p-0').html('<span class="d-block ml-4 mr-2 mt-2 mb-1"></span>');
		bntob.appendTo(bnto);
		let bntof = $('<div>').addClass('toast-footer text-muted text-right font-weight-light font-italic user-select-none').html('<small class="timebadge container-fluid"></small><div class="timebar"></div>');
		bntof.appendTo(bnto);
		$('<a>').addClass('collapsed container-fluid text-decoration-none')
					  .attr({id:'header', role:'button', href:'#', 'data-toggle':'collapse', 'aria-expanded':'true', 'aria-label':'Header'})
					  .appendTo(bntoh);
		$('<a>').addClass('close')
					  .attr({type:'button','data-bs-dismiss':'toast','aria-label':'Close'})
					  .html('<span aria-hidden="true">&times;</span>').appendTo(bntoh);
		setInterval(function() {
			const toastList = $('.toast:not(.latest)').find('.toast-footer');
			toastList.find('.timebadge').text(function() {
				const diff = (Date.now() - $(this).parent().attr('aria-timestamp'))/1000;
				if(Math.abs(diff) >= 60*60*24*365) {
					return Math.floor(diff/(60*60*24*365)) + " years ago.";
				} else if(Math.abs(diff) >= 60*60*24*30) {
					return Math.floor(diff/(60*60*24*30)) + " months ago.";
				} else if(Math.abs(diff) >= 60*60*24) {
					return Math.floor(diff/(60*60*24)) + " days ago.";
				} else if(Math.abs(diff) >= 60*60) {
					return Math.floor(diff/(60*60)) + " hours " + Math.floor((diff/60)%60) + " minutes ago.";
				} else if(Math.abs(diff) >= 60) {
					return Math.floor(diff/60) + " minutes " + Math.floor(diff%60) + " seconds ago.";
				} else {
					return Math.floor(diff) + " seconds ago.";
				}
			});
		}, _reTi);
		if(ntc) {
			tc = $('ntc');
			tc.html(bnt);
		} else {
			let tid = '00000';
			while($('#toaster'+tid).length) {
				tid = ('0'.repeat(5) + Math.floor(Math.random()*99999)).slice(-5);
			}
			bnt.attr({id:'toaster'+tid});
			tc = bnt;
			tc.appendTo('body');
		}
		tc.data('bnto', bnto);
	}
	if(!$_msg && !$_t) return;
	const nT = tc.data('bnto').clone();
	let cid = '00000';
	while($('#toast'+cid).length) {
		cid = ('0'.repeat(5) + Math.floor(Math.random()*99999)).slice(-5);
	}
	nT.find('.toast-body').attr({id:'toast'+cid});
	if(!no_Co) nT.find('.collapsed').attr({href:'#toast'+cid, 'data-target':'#toast'+cid, 'aria-controls':'toast'+cid});
	nT.find('.toast-footer').attr({'aria-timestamp':Date.now()});
	const type = {
		info:['text-white', 'bg-primary', '&#x1F4AC;'],
		success:['text-white', '', '&#x2705;'],
		warning:['text-white', '', '&#x26A0;'],
		danger:['text-white', '', '&#x26D4;'],
		default:['text-dark', 'bg-'+_$t]
	};
	for(const k of type[_$t].keys()) {
		if(type[_$t][k] == '') type[_$t][k] = type['default'][k];
	}
	const head = nT.find('.toast-header').addClass(type[_$t][1]).find('#header');
	$('<span>').html(type[_$t][2]).appendTo(head);
	$('<strong>').addClass(type[_$t][0]).text($_t ? $_t : _$t).appendTo(head);
	if($_msg) { nT.find('.toast-body').addClass(type[_$t]['b']).find('span'); HTML_Con ? nT.find('.toast-body').find('span').html($_msg) : nT.find('.toast-body').find('span').text($_msg); } else { nT.find('.toast-body').hide(); nT.find('.collapsed').off(); }
	nT.find('.close').addClass(type[_$t]['h']);
	if(_hT != 0) {
		nT.find(".close:not(.collapsed)").remove();
		if(_hT > 0) {
			nT.toast({autohide:false});
			nT.find('.toast-footer > .timebar').css({height:'4px', width:'100%'}).addClass('bg-'+_$t).delay(250).animate({width:['toggle','linear']},_hT,function() {nT.animate({height:['toggle','linear'], opacity:['toggle','swing']}, 250, function() {nT.toast('dispose').remove();});});
		} else {
			nT.toast({autohide:false});
		}
	} else {
		nT.toast({autohide:false});
		nT.find('.close').on("click", function() {nT.animate({height:['toggle','linear'], opacity:['toggle','swing']}, 250, function() {nT.toast('dispose').remove();});});
	}
	nT.find('.toast-footer > .timebadge').text('now.');
	nT.appendTo(tc);
	nT.toast('show');
	nT.parent().scrollTop(nT.parent().prop('scrollHeight'));
}//toast out
function DisposeAllToast() {
	$('.toast').find('.timebar').stop();
	$('.toast').animate({opacity:['toggle','swing']}, 250, function() {$('.toast').toast('dispose').remove();});
}
