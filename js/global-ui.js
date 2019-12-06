$(document).ready(function() {
	
	// Mega Drop Down Menus
	$('.nav-a').hover(function() {
		$('.nav-sub').removeClass('nav-sub-active');
	});
	$('.nav-li').mouseleave(function() {
		$('.nav-sub').removeClass('nav-sub-active');
	});
	$('.nav-a-is').hover(function() {
		$('.nav-sub-is').addClass('nav-sub-active');
	});
	$('.nav-a-cs').hover(function() {
		$('.nav-sub-cs').addClass('nav-sub-active');
	});
	$('.nav-a-ic').hover(function() {
		$('.nav-sub-ic').addClass('nav-sub-active');
	});
	$('.nav-a-lang').hover(function() {
		$('.nav-sub-lang').addClass('nav-sub-active');
	});	
	// Mobile Parts
	$('.nav-a-is--mobile-trigger').click(function() {
		$('.nav-sub-is').toggleClass('nav-sub--active');
		$('.nav-li-is').toggleClass("nav-li--active");
	});
	$('.nav-a-cs--mobile-trigger').click(function() {
		$('.nav-sub-cs').toggleClass('nav-sub--active');
		$('.nav-li-cs').toggleClass("nav-li--active");
	});
	$('.nav-a-ic--mobile-trigger').click(function() {
		$('.nav-sub-ic').toggleClass('nav-sub--active');
		$('.nav-li-ic').toggleClass("nav-li--active");
	});
	$('.nav-a-lang--mobile-trigger').click(function() {
		$('.nav-sub-lang').toggleClass('nav-sub--active');
		$('.nav-li-lang').toggleClass("nav-li--active");
	});
	// Mobile Navigation
	$('.nav-mobile-icon').click(function() {

		if ($(this).hasClass("nav-mobile-icon--active"))
			{
				$(this).removeClass("nav-mobile-icon--active");
				$(".nav").removeClass("nav--active");
				$("body").removeClass("no-scroll");
			}
		else
			{
				$(this).addClass("nav-mobile-icon--active");
				$(".nav").addClass("nav--active");
				$("body").addClass("no-scroll");
			}
			
		return false;
	});
	
	// Basic Aside Menu (Case Studies)
	// Toggles menu and animates menu-to-x icon
	$('.basic-aside-menu-mobile').click(function() {
		
		if ($(this).hasClass("basic-aside-menu-mobile-active"))
			{
				$(this).removeClass("basic-aside-menu-mobile-active");
				$(".basic-aside-menu-ul-wrapper").removeClass("basic-aside-menu-ul-wrapper-active");
				$(".menu-to-x").toggleClass("active");
			}
		else
			{
				$(this).addClass("basic-aside-menu-mobile-active");
				$(".basic-aside-menu-ul-wrapper").addClass("basic-aside-menu-ul-wrapper-active");
				$(".menu-to-x").toggleClass("active");
			}
			
		return false;
	});
	
	// Mobile Page Navigation
	$('.page-nav-mobile-li--menu').click(function() {
		//$(this).toggleClass("page-nav-mobile-li--menu-active");
		//$(".page-nav-links").toggleClass("page-nav-links-active");
		
		if ($(this).hasClass("page-nav-mobile-li--menu-active"))
			{
				$(this).removeClass("page-nav-mobile-li--menu-active");
				$(".page-nav-links").removeClass("page-nav-links-active");
			}
		else
			{
				$(this).addClass("page-nav-mobile-li--menu-active");
				$(".page-nav-links").addClass("page-nav-links-active");
			}
		
		return false;
	});
	
	$('.page-nav-li-primary a').click(function() {
		setTimeout(function() {
			$('.page-nav-links').removeClass("page-nav-links-active");
			$('.page-nav-mobile-li--menu').removeClass("page-nav-mobile-li--menu-active");
		}, 500);
	});

	// Accordion
	$(".accordion-list--click").click(function(e) {
		
		$(this).next(".accordion-list--toggled").slideToggle(150);
		$(this).parent(".accordion-list--item").toggleClass("open");
	});
	$(".accordion-list--click--exclude").click(function(e){
    e.stopPropagation();
    return;
  });

	// Square Card with Caption
	$('.card-caption').click(function() {
		$(this).toggleClass("card-caption-active");
		return false;
	});

	// This code is a bit rudimentary, however, the only thing it needs to do is to check if the field has any value and change the class name. The rest is done with CSS.
  function floatingPlaceholder(event){
    var input=$(this);
    setTimeout(function(){
      var val=input.val();
      if(val!="")
        input.parent().addClass("floating-placeholder-float");
      else
        input.parent().removeClass("floating-placeholder-float");
    },1)
  }
  $(".floating-placeholder input").keydown(floatingPlaceholder);
  $(".floating-placeholder input").change(floatingPlaceholder);
  $(".floating-placeholder textarea").keydown(floatingPlaceholder);
  $(".floating-placeholder textarea").change(floatingPlaceholder);

  $(".floating-placeholder input").keydown();
  $(".floating-placeholder textarea").keydown();

});

/*!
 * hoverIntent v1.8.0 // 2014.06.29 // jQuery v1.9.1+
 * http://cherne.net/brian/resources/jquery.hoverIntent.html
 *
 * You may use hoverIntent under the terms of the MIT license. Basically that
 * means you are free to use hoverIntent as long as this header is left intact.
 * Copyright 2007, 2014 Brian Cherne
(function($){$.fn.hoverIntent=function(handlerIn,handlerOut,selector){var cfg={interval:100,sensitivity:6,timeout:0};if(typeof handlerIn==="object"){cfg=$.extend(cfg,handlerIn)}else{if($.isFunction(handlerOut)){cfg=$.extend(cfg,{over:handlerIn,out:handlerOut,selector:selector})}else{cfg=$.extend(cfg,{over:handlerIn,out:handlerIn,selector:handlerOut})}}var cX,cY,pX,pY;var track=function(ev){cX=ev.pageX;cY=ev.pageY};var compare=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);if(Math.sqrt((pX-cX)*(pX-cX)+(pY-cY)*(pY-cY))<cfg.sensitivity){$(ob).off("mousemove.hoverIntent",track);ob.hoverIntent_s=true;return cfg.over.apply(ob,[ev])}else{pX=cX;pY=cY;ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}};var delay=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);ob.hoverIntent_s=false;return cfg.out.apply(ob,[ev])};var handleHover=function(e){var ev=$.extend({},e);var ob=this;if(ob.hoverIntent_t){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t)}if(e.type==="mouseenter"){pX=ev.pageX;pY=ev.pageY;$(ob).on("mousemove.hoverIntent",track);if(!ob.hoverIntent_s){ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}}else{$(ob).off("mousemove.hoverIntent",track);if(ob.hoverIntent_s){ob.hoverIntent_t=setTimeout(function(){delay(ev,ob)},cfg.timeout)}}};return this.on({"mouseenter.hoverIntent":handleHover,"mouseleave.hoverIntent":handleHover},cfg.selector)}})(jQuery);
 */


/**
 * ScrollIt.js
 * Latest version: https://github.com/cmpolis/scrollIt.js
 */
(function($){'use strict';var pluginName='ScrollIt',pluginVersion='1.0.3';var defaults={upKey:33,downKey:34,easing:'swing',scrollTime:500,activeClass:'current',onPageChange:null,topOffset:0};$.scrollIt=function(options){var settings=$.extend(defaults,options),active=0,lastIndex=$('[data-scroll-index]:last').attr('data-scroll-index');var navigate=function(ndx,animationComplete){if(ndx<0||ndx>lastIndex)return;var targetTop=$('[data-scroll-index='+ndx+']').offset().top-settings.topOffset+1;$('html,body').animate({scrollTop:targetTop},settings.scrollTime,settings.easing,animationComplete)};var doScroll=function(e){var target=$(e.target).closest("[data-scroll-nav]").attr('data-scroll-nav')||$(e.target).closest("[data-scroll-goto]").attr('data-scroll-goto');navigate(parseInt(target),navComplete);function navComplete(){updateActive(parseInt(target))}};var keyNavigation=function(e){var key=e.which;if(key==settings.upKey&&active>0){navigate(parseInt(active)-1);return false}else if(key==settings.downKey&&active<lastIndex){navigate(parseInt(active)+1);return false}return true};var updateActive=function(ndx){if(settings.onPageChange&&ndx&&(active!=ndx))settings.onPageChange(ndx);active=ndx;$('[data-scroll-nav]').removeClass(settings.activeClass);$('[data-scroll-nav='+ndx+']').addClass(settings.activeClass)};var watchActive=function(){var winTop=$(window).scrollTop();var visible=$('[data-scroll-index]').filter(function(ndx,div){return winTop>=$(div).offset().top-settings.topOffset&&winTop<$(div).offset().top-(settings.topOffset)+$(div).outerHeight()});var newActive=visible.first().attr('data-scroll-index');updateActive(newActive);if(!visible.length){newActive=$('[data-scroll-index]').first().attr('data-scroll-index');updateActive(newActive)}if($(window).scrollTop()+$(window).height()==$(document).height()){newActive=$('[data-scroll-index]').last().attr('data-scroll-index');updateActive(newActive)}};$(window).on('scroll',watchActive).on('scroll');$(window).on('keydown',keyNavigation);$('body').on('click','[data-scroll-nav], [data-scroll-goto]',function(e){e.preventDefault();doScroll(e)});var initialLoadInterval=setInterval(function(){if($(window).scrollTop()!=0){watchActive();clearInterval(initialLoadInterval)}},1000);watchActive()}}(jQuery));

/*
	Pretty much copied and pasted from:
	https://github.com/bgrins/ExpandingTextareas/blob/master/expanding.js

	Auto-growing textareas; technique ripped from Facebook
	http://github.com/jaz303/jquery-grab-bag/tree/master/javascripts/jquery.autogrow-textarea.js
*/
(function($)
{
    $.fn.autogrow = function(options)
    {
        return this.filter('.expanding-textarea').each(function()
        {
            var self         = this;
            var $self        = $(self);
            var minHeight    = $self.height();
            var noFlickerPad = $self.hasClass('autogrow-short') ? 0 : parseInt($self.css('lineHeight')) || 0;
            var settings = $.extend({
                preGrowCallback: null,
                postGrowCallback: null
              }, options );

            var shadow = $('<div></div>').css({
                position:    'absolute',
                top:         -10000,
                left:        -10000,
                width:       $self.width(),
                fontSize:    $self.css('fontSize'),
                fontFamily:  $self.css('fontFamily'),
                fontWeight:  $self.css('fontWeight'),
                lineHeight:  $self.css('lineHeight'),
                resize:      'none',
    			'word-wrap': 'break-word'
            }).appendTo(document.body);

            var update = function(event)
            {
                var times = function(string, number)
                {
                    for (var i=0, r=''; i<number; i++) r += string;
                    return r;
                };

                var val = self.value.replace(/&/g, '&amp;')
                                    .replace(/</g, '&lt;')
                                    .replace(/>/g, '&gt;')
                                    .replace(/\n$/, '<br/>&nbsp;')
                                    .replace(/\n/g, '<br/>')
                                    .replace(/ {2,}/g, function(space){ return times('&nbsp;', space.length - 1) + ' ' });

				// Did enter get pressed?  Resize in this keydown event so that the flicker doesn't occur.
				if (event && event.data && event.data.event === 'keydown' && event.keyCode === 13) {
					val += '<br />';
				}

                shadow.css('width', $self.width());
                shadow.html(val + (noFlickerPad === 0 ? '...' : '')); // Append '...' to resize pre-emptively.
                
                var newHeight=Math.max(shadow.height() + noFlickerPad, minHeight);
                if(settings.preGrowCallback!=null){
                  newHeight=settings.preGrowCallback($self,shadow,newHeight,minHeight);
                }
                
                $self.height(newHeight);
                
                if(settings.postGrowCallback!=null){
                  settings.postGrowCallback($self);
                }
            }

            $self.change(update).keyup(update).keydown({event:'keydown'},update);
            $(window).resize(update);

            update();
        });
    };
})(jQuery);