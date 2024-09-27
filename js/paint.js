var curitemid = '-1';

$(document).ready(function() {
	"use strict";

	let detect = new MobileDetect(window.navigator.userAgent);

	/*
	$(".fancybox").fancybox({
		 animationEffect: "zoom",
		 defaultType: "image",
  		 animationDuration: 500,
    	 transitionEffect: "zoom-in-out",
		 transitionDuration: 700,
		 beforeClose: function() {
			 var obj = $('.gal-item-visible');
			obj.removeClass('gal-item-visible');
			obj.removeClass('gal-item-front');
		 }
	});*/

	$(document).on('click', '[data-group]', function() {
		  var $this = $(this);
		  var group = $('[data-group="' + $this.data('group') + '"]');

		  $.fancybox.open(group, {
			/*thumbs : {
			  autoStart : true
			}*/
			   animationEffect: "zoom",
			   defaultType: "image",
			   animationDuration: 500,
			   transitionEffect: "zoom-in-out",
			   transitionDuration: 700,
			   beforeClose: function() {
			   		var obj = $('.gal-item-visible');
			   		obj.removeClass('gal-item-visible');
					obj.removeClass('gal-item-front');
			   }
		  }, group.index($this));

		  return false;
	});


	$('.menu-icon').click(function() {
  		$(this).toggleClass('opened');
		if($(this).hasClass('opened')){
			$('header nav').addClass('visible');
		} else {
			$('header nav').removeClass('visible');
		}
	});
	var uri = document.location.href;
	if(uri.indexOf('/en/')===-1){
		$('#ru').addClass('active');
	} else {
		$('#en').addClass('active');
	}

	$('.scroll-up').click(function(){
		$("body,html").animate({
        	scrollTop:0
		}, 300);
	});

	if(!detect.mobile()){
		$('.gal-item').mousemove(function(e){
			/*
			var obj = $('.gal-item-visible');

			var objid = obj.attr('data-id');
			var curid = $(e.currentTarget).attr('data-id');

			console.log("objid = "+objid+" curid = "+curid);

			obj.removeClass('gal-item-visible');

			 */

			$('.gal-item-visible').each(function(indx,elem){
				var itid = $(elem).attr('data-id');
				if(itid!=='curitemid'){
					$(elem).removeClass('gal-item-visible');
				}
			});

			$('.gal-item-front').each(function(indx,elem){
				var itid = $(elem).attr('data-id');
				if(itid!=='curitemid'){
					setTimeout(function(){
						var this_id = $(elem).attr('data-id');
						if(this_id !== curitemid) {
							$(e.currentTarget).removeClass('gal-item-front');
						}
					},310);
				}
			});

			curitemid = $(e.currentTarget).attr('data-id');
			var obj = $(e.currentTarget).find('.gal-info');
			if(!obj.hasClass('gal-item-visible')){
				obj.addClass('gal-item-visible');
			}
			if(!obj.hasClass('gal-item-front')){
				obj.addClass('gal-item-front');
			}
		});
	}

	$('.gal-item img').click(function(e){
		var obj = $('.gal-item-visible');
		obj.removeClass('gal-item-visible');
		setTimeout(function(){
			obj.removeClass('gal-item-front');
		},310);
		$(e.currentTarget).parent().find('.gal-info').addClass('gal-item-visible').addClass('gal-item-front');
	});

	if(!detect.mobile()){
		$('.gal-info').mouseleave(function(e){
			curitemid = '-1';
			$(e.currentTarget).removeClass('gal-item-visible');
			var obj = e.currentTarget;
			setTimeout(function(){
				var this_id = $(obj).attr('data-id');
				if(this_id !== curitemid) {
					$(e.currentTarget).removeClass('gal-item-front');
				}
			},310);
		});
	}

	window.addEventListener('scroll', function() {

	});

});
// init Masonry
var $grid = $('.gallery').masonry({
	 itemSelector: '.gal-item',
	 columnWidth: 250,
	 gutter: 30,
	 fitWidth: true,
	 isFitWidth: true
});

// layout Masonry after each image loads
$grid.imagesLoaded().progress( function() {
	"use strict";
	$grid.masonry('layout');
});

function setFilter(category, obj){
	"use strict";
	var i;

	console.log("Changing filtering:::");
	$("._g_invisible").removeClass('_g_invisible');
	$('.gal-item a').attr('data-group','group');

	if(category){
		for(i=0; i<=7; i++){
			if(i!==category) {
				console.log("Switch off "+".galcat_"+i);
				$(".galcat_"+i).addClass('_g_invisible');
				$(".galcat_"+i+" a").attr('data-group','invisible');
			}
		}
	}

	$grid.masonry('layout');
	$('.rubric a.active').removeClass('active');
	$(obj).addClass('active');
}

function setLang(lang, obj){
	"use strict";
	var uri = document.location.href;

	if($(obj).hasClass('active')) { return; }
	if(lang === 'ru'){
		if(uri.indexOf('/en/')===-1){
			uri = "/ru/gallery.html";
		} else {
			uri = uri.replace('/en/','/ru/');
		}
	} else {
		if(uri.indexOf('/ru/')===-1){
			uri = "/en/gallery.html";
		} else {
			uri = uri.replace('/ru/','/en/');
		}
	}
	window.location.replace(uri);
}

function sendOrder(formid) {
	"use strict";
	var form = $(formid);
	var emptyfound = false;

	form.find(".required").each(function(indx, elem){
		console.log($(elem).attr('name'));
		if($(elem).val().trim()===''){
			CMSL_alert($(elem).attr('data-required'));
			emptyfound = true;
			return false;
		}
	});

	if(emptyfound) return 0;

	var param = $(formid).serialize();
	$.post("/httpr/SendOrder.php",param,function(text){
		form[0].reset();
		CMSL_alert(text);
	});

}
