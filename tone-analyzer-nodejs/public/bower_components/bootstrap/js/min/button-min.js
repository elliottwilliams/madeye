+function($){"use strict";function t(t){return this.each(function(){var s=$(this),n=s.data("bs.button"),a="object"==typeof t&&t;n||s.data("bs.button",n=new e(this,a)),"toggle"==t?n.toggle():t&&n.setState(t)})}var e=function(t,s){this.$element=$(t),this.options=$.extend({},e.DEFAULTS,s),this.isLoading=!1};e.VERSION="3.3.6",e.DEFAULTS={loadingText:"loading..."},e.prototype.setState=function(t){var e="disabled",s=this.$element,n=s.is("input")?"val":"html",a=s.data();t+="Text",null==a.resetText&&s.data("resetText",s[n]()),setTimeout($.proxy(function(){s[n](null==a[t]?this.options[t]:a[t]),"loadingText"==t?(this.isLoading=!0,s.addClass(e).attr(e,e)):this.isLoading&&(this.isLoading=!1,s.removeClass(e).removeAttr(e))},this),0)},e.prototype.toggle=function(){var t=!0,e=this.$element.closest('[data-toggle="buttons"]');if(e.length){var s=this.$element.find("input");"radio"==s.prop("type")?(s.prop("checked")&&(t=!1),e.find(".active").removeClass("active"),this.$element.addClass("active")):"checkbox"==s.prop("type")&&(s.prop("checked")!==this.$element.hasClass("active")&&(t=!1),this.$element.toggleClass("active")),s.prop("checked",this.$element.hasClass("active")),t&&s.trigger("change")}else this.$element.attr("aria-pressed",!this.$element.hasClass("active")),this.$element.toggleClass("active")};var s=$.fn.button;$.fn.button=t,$.fn.button.Constructor=e,$.fn.button.noConflict=function(){return $.fn.button=s,this},$(document).on("click.bs.button.data-api",'[data-toggle^="button"]',function(e){var s=$(e.target);s.hasClass("btn")||(s=s.closest(".btn")),t.call(s,"toggle"),$(e.target).is('input[type="radio"]')||$(e.target).is('input[type="checkbox"]')||e.preventDefault()}).on("focus.bs.button.data-api blur.bs.button.data-api",'[data-toggle^="button"]',function(t){$(t.target).closest(".btn").toggleClass("focus",/^focus(in)?$/.test(t.type))})}(jQuery);