'use strict';

/* 
 *  Namespace for global constants.
 */
var Const = 
	{
		date: {date_format:  'M d, yy'},
		empty_value: '&nbsp;'
	};



/*
 * Namespace for class constructors.
 */
var Class = {};

/*
 * Constructs an instance of a subscription/publication notification mechanism.
 * 
 * @param params
 *	No parameters are currently defined.
 * 
 * @method SubPub Subscribe(subscription_callback)
 * @method SubPub Unsubscribe(subscription_callback)
 * @method SubPub Publish(topic, data)
 */
Class.SubPub = function ()
	{
		var SubPub, subscription_objects;
		
		construct.call(this);
		return;
		
		function construct()
			{
				SubPub = this;
				SubPub.Subscribe = subscribe;
				SubPub.Unsubscribe = unsubscribe;
				SubPub.Publish = publish;
				
				subscription_objects = [];
			}
		
		function subscribe(subscription_callback)
			{
				subscription_objects.push({subscription_callback: subscription_callback});
				return SubPub;
			}
		
		function unsubscribe(subscription_callback)
			{
				for (var i = 0; i < subscription_objects.length; i++)
					{
						var subscription_object = subscription_objects[i];
						
						if (subscription_object.subscription_callback === subscription_callback)
							{
								subscription_objects.splice(i, 1);
								return;
							}
					}
				
				Utils.Log('SubPub.Unsubscribe:', 'subscription_callback not found');
				return SubPub;
			}
		
		function publish(topic, data)
			{
				//Utils.Log('SubPub.Publish:', 'topic=', topic, 'data=', data);
				
				for (var i = 0; i < subscription_objects.length; i++)
					{
						var subscription_object = subscription_objects[i];
						subscription_object.subscription_callback.call(SubPub, topic, data);
					}
				
				return SubPub;
			}
	};
	
/**
 * Constructs a RequestResponse instance.
 * 
 * @param params 
 *	{
 *		UserText -- object: An instance of Class.UserText.
 *	}
 */
Class.RequestResponse = function (params)
	{
		var RequestResponse, request_objects, sending;
		
		construct.call(this);
		return;
		
		function construct()
			{
				RequestResponse = this;
				RequestResponse.Append = request_append;
				RequestResponse.Send = requests_send;
				
				request_objects = [];
			}
		
		function request_append(request, response_callback)
			{
				if (sending)
					{
						Utils.Log('Class.RequestResponse.request_append', 'currently sending');
						return RequestResponse;
					}
				
				var request_object = {request: request, response_callback: response_callback};
				request_objects.push(request_object);
				return RequestResponse;
			}
		
		/**
		 * Send queued requests, optionally calling back to the app when done.
		 * 
		 * @param send_params
		 *	{
		 *		done_callback -- Optional callback function.
		 *			undefined: No callback.
		 *			function (responses): Called with this set to RequestResponse.
		 *	}
		 */
		function requests_send(send_params)
			{
				if (sending)
					{
						Utils.Log('Class.RequestResponse.requests_send', 'currently sending');
						return RequestResponse;
					}
				else if (request_objects.length === 0)
					{
						Utils.Log('Class.RequestResponse.requests_send', 'no requests queued');
						return RequestResponse;
					}
				else /* not sending */
					{
						sending = true;
					}
				
				if (send_params === undefined) send_params = {};
				var requests = [];
				
				for (var i = 0; i < request_objects.length; i++)
					{
						requests.push(request_objects[i].request);
					}
	
				var data = {requests: requests},
					data_json = JSON.stringify(data),
					ajax_params = {url: "json.php", type: "POST", contentType: 'application/json; charset=utf-8', data: data_json, dataType: "json"};
				
				$.ajax(ajax_params).done(done_handler).fail(fail_handler);
				return RequestResponse;
				
				function done_handler(data)
					{
						var responses = data.responses;

						for (var i = 0; i < request_objects.length; i++)
							{
								var request_object = request_objects[i], 
									response = responses[i];
								
								if (! response)
									{
										Utils.Log('Class.RequestResponse.done_handler', 'response is empty', 'responses=', responses, 'i=', i);
										break;
									}
								
								if (request_object.response_callback !== undefined) 
									{
										request_object.response_callback.call(RequestResponse, response);
									}
								
								if (response['usertext'] && (params['UserText'] !== undefined))
									{
										params['UserText'].ListAppendList(response.usertext);
									}
								
								if (response['error'])
									{
										Utils.Log('RequestResponse:', 'request=', request_object.request, 'response=', response);
									}
								
								if (response.location)
									{
										Utils.Log('RequestResponse:', 'location=', response.location);
										window.location = response.location; //kgiftos: eats UserText, need to have it deferred from backend when there is a location in the response
										return; //kgiftos: need some kind of callback/queuing for this instead of doing redirection here?
									}
							}
						
						if (send_params.done_callback !== undefined)
							{
								send_params.done_callback.call(RequestResponse, responses);
							}
						
						request_objects = [];
						sending = false;
					}
				
				function fail_handler(jq_xhr, text_status, error_thrown)
					{
						Utils.Log('Class.RequestResponse::requests_send::fail_handler:', 'text_status=', text_status, 'error_thrown=', error_thrown);
						
						request_objects = [];
						sending = false;
					}
			}
	};

/**
 * Constructs a closure that handles usertext, a la the PHP UserText class.
 *
 * @param params 
 *	{
 *		container_id -- undefined: use default ('usertext_container'); string: id of the usertext container
 *		class -- undefined: use default ('usertext'); string: the class to give to the div that holds the rendered usertext
 *		noclose -- undefined: use default (false); boolean: false=show the close X, true=don't
 *		autorender_ms -- undefined: use default (100); null: disabled; integer: autorender delay in ms
 *		fadein_ms -- undefined: use default (250); integer: fadein time in ms
 *		fadeout_ms -- undefined: use default (250); integer: fadeout time in ms
 *		slideup_ms -- undefined: use default (500); integer: slide-up time in ms
 *	}
*/
Class.UserText = function (params)
	{
		var UserText, 
			ct_list, $container, autorender_timer;
			
		construct.call(this);
		return;
		
		function construct()
			{
				var params_default = {'container_id': 'usertext_container', 'class': 'usertext', 'noclose': false, 'autorender_ms': 100, 'fadein_ms': 250, 'fadeout_ms': 250, 'slideup_ms': 500};
				params = Utils.ObjectExtend(params_default, params);
				
				UserText = this;
				UserText['CLASS_ERROR'] = 'error';
				UserText['CLASS_INVALID'] = 'invalid';
				UserText['CLASS_NOTE'] = 'note';
				UserText['CLASS_SUCCESS'] = 'success';
				UserText.ListMoveTo = list_move_to;
				UserText.ListAppendList = list_append_list;
				UserText.ListAppend = list_append;
				UserText.ListMarkup = list_markup;
				UserText.ListRender = list_render;
				UserText.AutoRenderCancel = autorender_cancel;
				
				ct_list = [];
				$container = $("#" + params['container_id']);
				
				var $class_uls = $container.find('ul');
				
				for (var i = 0; i < $class_uls.length; i++)
					{
						var $class_ul = $($class_uls[i]).prepend(close_li());
					}
			}
		
		function list_move_to(ToUserText)
			{
				ToUserText.ListAppendList(ct_list);
				ct_list = [];
				return UserText;
			}
		
		function list_append_list(list)
			{
				if (list === undefined) return UserText;
				
				for (var i = 0; i < list.length; i++)
					{
						var item = list[i];
						list_append(item['class'], item['text']);
					}
				
				return UserText;
			}
		
		function list_append(item_class, item_text)
			{
				for (var i = 0; i < ct_list.length; i++)
					{
						var ct_item = ct_list[i];
						if ((ct_item['class'] === item_class) && (ct_item['text'] === item_text)) break;
					}
				
				if (i >= ct_list.length) ct_list.push({'class': item_class, 'text': item_text});
				autorender_delay();
				
				return UserText;
			}
		
		function list_markup(return_element)
			{
				if (ct_list.length === 0) return;
				
				var $div = $('<div></div>').addClass(params['class']),
					ul_class = '', 
					item_text = [];
				
				for (var i = 0; i < ct_list.length; i++)
					{
						var ct_item = ct_list[i];
						
						if ((ct_item['class'] !== ul_class) && (item_text.length !== 0))
							{
								ul_append();
								item_text = [];
							}
						
						ul_class = ct_item['class'];
						item_text.push('<li>$1</li>'.replace('$1', ct_item['text']));
					}

				ct_list = [];
				
				if (item_text.length) 
					{
						ul_append();
					}
				
				if (return_element) return $div;
				
				return $div[0].outerHTML;
				
				function ul_append()
					{
						$('<ul></ul>').addClass(ul_class).append(close_li()).append(item_text.join('')).appendTo($div);
					}
			}
		
		function list_render()
			{
				autorender_cancel();
				
				$container = $("#" + params['container_id']);
				var $list_div;
				
				if ($list_div = list_markup(true)) 
					{
						var $div_uls = $list_div.find('ul').css('opacity', 0);
						$container.html($list_div);
						$div_uls.animate({'opacity': 1}, {'duration': params['fadein_ms']});
					}
				
				return UserText;
			}
				
		function autorender_delay()
			{
				if (params['autorender_ms'] === null) return;
				autorender_cancel(setTimeout(autorender_timeout, params['autorender_ms']));
				return;
				
				function autorender_timeout()
					{
						autorender_cancel();
						list_render();
					}
			}
		
		function autorender_cancel(new_timer)
			{
				if (autorender_timer) clearTimeout(autorender_timer);
				autorender_timer = new_timer;
			}
		
		function close_li()
			{
				if (params['noclose']) return null;
				
				var $close_il = $('<li class="usertext-close"><i class="icon-cancel"></i></li>').on('click', close_click_handler);
				return $close_il;
				
				function close_click_handler(event)
					{
						var $this = $(this),
							animate_css = {'height': 0, 'padding-top': 0, 'padding-bottom': 0, 'margin-top': 0, 'margin-bottom': 0},
							animate_options = {'duration': params['slideup_ms'], 'easing': 'easeOutQuart', 'complete': animate_complete},
							$parent_ul = $this.parent('ul').animate(animate_css, animate_options),
							$parent_lis = $parent_ul.find('li').animate(animate_css, animate_options),
							$gparent_div = $parent_ul.parent('div');

						if ($gparent_div.children().length === 1) 
							{
								$gparent_div.animate(animate_css, animate_options);
							}
						
						return;

						function animate_complete()
							{
								var $this = $(this).remove();
							}
					}
			}
	};

/*
 * Constructs a placeholder-handling closure for the controls in the referenced form.
 *
 * @param params 
 *	{
 *		form_element -- 
 *			string: A selector that identifies the form that containing the controls of interest.
 *			element: The form element itself.
 *		focus_element -- 
 *			undefined: Use default value (null).
 *			null: Do not give focus to any control.
 *			string: A selector that identifies the control that should be given focus.
 *			element: The form element itself that should be given focus.
 *	}
 */
Class.PlaceholderForm = function (params)
	{
		var PlaceholderForm,
			$form, $controls, Placeholders;
		
		construct.call(this);
		return;
		
		function construct()
			{
				var params_default = {'focus_element': null};
				params = Utils.ObjectExtend(params_default, params);
				
				PlaceholderForm = this;
				PlaceholderForm.Initialize = initialize;
				
				Placeholders = [];
			}
		
		function initialize(initialize_params)
			{
				if (! Utils.ObjectRequired(params, ['form_element'], 'Class.PlaceholderForm::initialize')) return PlaceholderForm;
				
				$form = $(params['form_element']);
				$controls = $form.find('[placeholder]').each(each_callback);
				if (params['focus_element'] !== null) $(params['focus_element']).focus();
				
				return PlaceholderForm;
				
				function each_callback()
					{
						var control = this,
							placeholder_params = {'control_element': control},
							Placeholder = new Class.Placeholder(placeholder_params).Initialize();
							
						Placeholders.push(Placeholder);
					}
			}
	};

/*
 * Constructs a placeholder-handling closure for the referenced control.
 * Toggles 'placeholder' class according to when the placeholder text is being shown, allowing for styling.
 * For IE, implements pseudo-placeholder behavior.
 * 
 * @param params 
 *	{
 *		control_element -- 
 *			string: A selector that identifies the form that containing the controls of interest.
 *			element: The form element itself.
 *		focus -- 
 *			undefined: Use default value (false).
 *			boolean: false=Do not give focus to the control; true=Give it focus.
 *	}
 */
Class.Placeholder = function (params)
	{
		var Placeholder,
			$control, $form, placeholder;
			
		construct.call(this);
		return;
		
		function construct()
			{
				var params_default = {'focus': false};
				params = Utils.ObjectExtend(params_default, params);
				
				Placeholder = this;
				Placeholder.Initialize = initialize;
			}
		
		function initialize(initialize_params)
			{
				Utils.ObjectExtend(params, initialize_params);
				if (! Utils.ObjectRequired(params, ['control_element'], 'Class.Placeholder::initialize')) return Placeholder;
				
				$control = $(params['control_element']).blur(blur_handler).focus(focus_handler);
				$form = $($control[0]['form']).submit(submit_handler);
				/* $.browser.msie was deprecated in jquery 1.9
				if ($.browser.msie && ($control.attr('type') !== 'password')) placeholder = $control.attr('placeholder');
				*/
				if (navigator.userAgent.indexOf('MSIE') > 0 && ($control.attr('type') !== 'password')) placeholder = $control.attr('placeholder');
				if (params['focus']) $control.focus();
				
				return Placeholder;
			}
		
		function blur_handler(event)
			{
				if ($control.val()) return;
				
				$control.addClass('placeholder');
				if (placeholder !== undefined) $control.val(placeholder);
			}

		function focus_handler(event)
			{
				$control.removeClass('placeholder');
				if ((placeholder !== undefined) && ($control.val() === placeholder)) $control.val('');
			}

		function submit_handler(event)
			{
				if ((placeholder !== undefined) && ($control.val() === placeholder)) $control.val('');
			}
	};
	
/*
 * Namespace for utility functions.
*/
var Utils = {};

/*
 * Console logging substitute that is both PP_DEVEL and browser aware.
 */
Utils.Log = function (context)
	{
		if (! Const['PP_DEVEL']) return;
		if (! console || (console.log === undefined)) return;
		
		var remaining_arguments = Array.prototype.slice.call(arguments).slice(1);
		console.log(context, remaining_arguments);
	};

/*
 * Should be called via a ready or load handler whenever a table is part of delivered content.
*/
Utils.TableFix = function ()
	{
		$('table.dataGrid td:empty').html('&nbsp;');
	};

/**
 * Compares two values, which are assumed to be either integers or decimal string equivalents.
 * Returns an integer suitable for use as a sort() return value.
 * 
 * @param mixed a, b
 * @returns integer
 */
Utils.CompareInteger = function(a, b)
	{
		if (typeof a === 'string') a = parseInt(a, 10);
		if (typeof b === 'string') b = parseInt(b, 10);
		
		return Utils.Compare(a, b);
	};

/**
 * Compares two values, which are assumed to be .similar types of scalar values.
 * Returns an integer suitable for use as a sort() return value.
 * 
 * @param mixed a, b
 * @returns integer
 */
Utils.Compare = function(a, b)
	{
		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	};

/**
 * A quick way to check for, and optoinally log, missing required object properties.
 * 
 * @param object 
 *	The object being analysed.
 *	object: {name: value, ...}
 *	
 * @param array names
 *	The list of properties required to be in params.
 *	array: [name, ...]
 * 
 * @param mixed context
 *	The logging context.
 *	undefined: Don't log omissions.
 *	string: The context to associate with the log entry.
 * 
 * @returns boolean
 *   true ::= All required properties were defined.
 *   false ::= One or more required properties were undefined.
 */
Utils.ObjectRequired = function (object, names, context)
	{
		var subset = Utils.ObjectSelect(object, names),
			count = 0;
		
		for (var name in subset)
			{
				if (subset[name] === undefined)
					{
						if (context !== undefined) Utils.Log(context, 'required parameter missing', name);
					}
				else /* defined */
					{
						count++;
					}
			}
		
		return (count === names.length);
	};

/**
 * Returns a clone of the original object.
 * 
 * @param {type} param
 */
Utils.ObjectClone = function (original)
	{
		if ((original === null) || (typeof original !== 'object'))
			{
				return original;
			}
		
		var clone = original.constructor();
		for (var property in original) clone[property] = Utils.ObjectClone(original[property]);
		
		return clone;
	};

/**
 * Extends the given target object with the properties of the given source object(s).
 * 
 * @param target
 *   undefined: Initialized to an empty object.
 *   object: {name: value, ...}
 * 
 * @param arguments 
 *	array: [1: {name: value, ...}, ...], ...
 * 
 * @returns 
 *   The updated instance of target.
 */
Utils.ObjectExtend = function (target)
	{
		if (target === undefined) target = {};
		
		for (var i = 1; i < arguments.length; i++)
			{
				var source = arguments[i];
				
				for (var property in source)
					{
						target[property] = source[property];
					}
			}
		
		return target;
	};

Utils.ObjectSelect = function (input, names, output)
	{
		if (input === undefined) input = {};
		if (output === undefined) output = {};
		
		for (var i = 0; i < names.length; i++)
			{
				var name = names[i];
				output[name] = input[name];
			}
		
		return output;
	};

/*
*  For browsers that don't have console available:
*  Prevents javascript errors by creating dummy console function
*/
Utils.ConsoleFix = function () 
	{
		if (window.console) return;
		window.console = {};
		
		 // union of Chrome, FF, IE, and Safari console methods
		 var m = 
			[
				 "log", "info", "warn", "error", "debug", "trace", "dir", "group",
				 "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
				 "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
			 ];

		 // define undefined methods as noops to prevent errors
		 for (var i = 0; i < m.length; i++) window.console[m[i]] = nop;
		 return;
		 
		 function nop()
			{
			}
	};

/*
 * Need to do this early to avoid Angular errors.
 * Take this call and the method itself out when code is de-Angularized.
 */
Utils.ConsoleFix();

Class.Carousel = function(params)
{
	var Carousel;
	
	var $Panes;
	var $Container;
	var $CurrentPane;
	var currentIndex = -1;
	var carouselTimeout;
	var userInteraction = false;
	var initialized = false;

	var $carouselPrev;
	var $carouselNext;

	construct.call(this);
	return;

	function construct()
	{
		var params_default =
			{
				animation: 'fade',
				easing: 'swing',
				animation_ms: 500,
				slideshow_ms: 8000,
				auto_play: true,
				dual_direction: true,
				animationCallback: null
			};
		params = Utils.ObjectExtend(params_default, params);

		$Panes = [];

		Carousel = this;
		Carousel.Initialize = initialize;
		Carousel.SetPanes = set_panes;
		Carousel.NavigateToPane = navigateToPane;
		Carousel.StopTimer = stopTimer;

		Carousel['SubPub'] = new Class.SubPub();
		Carousel['SubPub'].Subscribe(subscription_callback);
	}

	function initialize()
	{
		$Container = (params.id) ? $("#"+params.id+"[jsclass~='carousel_container']") : $("[jsclass~='carousel_container']");
		initialized = true;
		
		return Carousel;
	}
	
	function sizeContainer()
	{
		var $Sizer = $CurrentPane.find("[jsclass~='pane_sizer']");
		
		if ($Sizer)
			{
				var height = $Sizer.outerHeight();
				$Container.height(height);
			}
	}

	function carouselNextClick()
	{ 
		userInteraction = true;
		stopTimer();
		carouselNext();
		return false;
	}
	 
	function carouselNext()
	{
		if (currentIndex == $Panes.length - 1)
		{
			currentIndex = 0;
		}
		else
		{
			currentIndex += 1;
		}

		Carousel['SubPub'].Publish('changedIndex');

		if (carouselTimeout !== undefined)
		{
			startTimer();
		}
	}

	function carouselPrevClick()
	{
		userInteraction = true;
		
		if (currentIndex == 0)
		{
			currentIndex = $Panes.length - 1;
		}
		else
		{
			currentIndex -= 1;
		}

		stopTimer();

		Carousel['SubPub'].Publish('changedIndex', {prevClicked: true});

		return false;
	}

	function startTimer()
	{
		if ($Panes.length > 1)
		{
			if (!userInteraction && params.auto_play)
				{
					carouselTimeout = setTimeout(carouselNext, params.slideshow_ms);
				}	
		}
	}

	function stopTimer()
	{
		if (carouselTimeout !== undefined)
		{
			clearTimeout(carouselTimeout);
			carouselTimeout = undefined;
		}
	}

	function changeIndex(data)
	{
		if ($CurrentPane == undefined)
		{
			if (currentIndex !== undefined)
			{
				$CurrentPane = $Panes[currentIndex];
				$Panes[currentIndex].show();
			}
		}
		else
		{
			animateSlides(data);
		}
	}
	
	function navigateToPane(pane, animations)
	{
		userInteraction = true;
		
		if (currentIndex == pane) return;
		
		if (animations)
			{
				if (currentIndex > pane)
					{
						params.animation = animations.backward;
					}
				else
					{
						params.animation = animations.forward;
					}
			}
		
		var animatingPrevious = (currentIndex > pane) ? true : false;
		
		currentIndex = pane;

		stopTimer();
		
		Carousel['SubPub'].Publish('changedIndex', {prevClicked: animatingPrevious});
	}
	
	function animateSlides(data)
	{
		switch (params.animation)
		{
			// NEW FADE IN, OLD FADE OUT
			case ('fade'):
				$CurrentPane.css('z-index', 1);
				$CurrentPane.fadeOut(params.animation_ms);
				if (currentIndex > -1)
				{
					$CurrentPane = $Panes[currentIndex];
					$CurrentPane.css('z-index', 2);
					$CurrentPane.fadeIn(params.animation_ms);
				}
				break;
				
			// NEW SLIDE IN, NEW SLIDE OUT
			case ('slide'):
				var oldPaneLeft = "-100%";
				var newPaneLeft = "100%";
				if (params.dual_direction)
					{
						if (data && data.prevClicked)
						{
							oldPaneLeft = "100%";
							newPaneLeft = "-100%";
						}
					}
				
				$CurrentPane.animate(
					{
						left: oldPaneLeft
					},
					params.animation_ms,
					function()
					{
						$(this).css({'display': 'none'});
					}
				);

				if (currentIndex > -1)
				{
					$CurrentPane = $Panes[currentIndex];
					$CurrentPane.css({'left': newPaneLeft, 'display': 'block'});
					$CurrentPane.animate(
						{
							left: "0"
						},
						params.animation_ms
					);
				}
				break;
				
			// NEW SLIDE IN, OVER OLD
			case ('cover'):
				var newPaneLeft = "100%";
				if (params.dual_direction)
					{
						if (data && data.prevClicked) newPaneLeft = "-100%";
					}

				$CurrentPane.css({'z-index': '1'});
				if (currentIndex > -1)
				{
					$CurrentPane = $Panes[currentIndex];
					$CurrentPane.css({'left': newPaneLeft, 'z-index': '2', 'display': 'block'});
					$CurrentPane.animate(
						{
							left: "0"
						},
						params.animation_ms,
						function()
						{
							for (var i = 0; i < $Panes.length; i++)
							{
								if (i != currentIndex)
								{
									$Panes[i].css({'z-index': '1', 'display': 'none'});
								}
							}
						}
					);
				}
				break;
				
			// OLD SLIDE OUT, NEW UNDER
			case ('reveal'):
				var oldPaneLeft = "-100%";
				if (params.dual_direction)
					{
						if (data && data.prevClicked) oldPaneLeft = "100%";
					}

				$CurrentPane.css({'z-index': '2'});
				if (currentIndex > -1)
				{
					var $OldPane = $CurrentPane;
					$CurrentPane = $Panes[currentIndex];
					$CurrentPane.css({'z-index': '1', 'display': 'block'});
					$OldPane.animate(
						{
							left: oldPaneLeft
						},
						params.animation_ms,
						function()
						{
							$OldPane.css({'left': '0', 'z-index': '1', 'display': 'none'});
						}
					);
				}
				break;
				
			// OLD SLIDE OUT, NEW FADE IN UNDER
			case ('reveal-fade'):
				var oldPaneLeft = "-100%";
				if (params.dual_direction)
					{
						if (data && data.prevClicked) oldPaneLeft = "100%";
					}

				$CurrentPane.css({'z-index': '2'});
				if (currentIndex > -1)
				{
					var $OldPane = $CurrentPane;
					$CurrentPane = $Panes[currentIndex];
					$CurrentPane.css({'z-index': '1'});
					$CurrentPane.fadeIn(params.animation_ms);
					$OldPane.animate(
						{
							left: oldPaneLeft
						},
						params.animation_ms,
						function()
						{
							$OldPane.css({'left': '0', 'z-index': '1', 'display': 'none'});
						}
					);
				}
				break;
		}
		
		if (params.animationCallback) params.animationCallback.call($CurrentPane);
	}

	function clear_panes()
	{ 
		for (var i = 0; i < $Panes.length; i++)
		{
			$Panes[i].remove();
		}

		stopTimer();
	}

	function set_panes(data)
	{
		if (!initialized)
			initialize();
		
		var $ControlsContainer = $('<div class="carousel-controls"></div>');
		$carouselPrev = $('<div class="carousel-control carousel-control--prev" jsclass="carousel_prev"><i class="icon-chevron-left-thin"></i></div>').click(carouselPrevClick);
		$carouselNext = $('<div class="carousel-control carousel-control--next" jsclass="carousel_next"><i class="icon-chevron-right-thin"></i></div>').click(carouselNextClick);
		$Container.append($ControlsContainer.append($carouselPrev).append($carouselNext));
		
		$Container.hover(stopTimer,startTimer)

		var pane_elems = $Container.children("[jsclass~='pane']");
		for (var i = 0; i < pane_elems.length; i++)
		{
			$Panes.push($(pane_elems[i]));
			$(pane_elems[i]).hide();
		}

		if ($Panes.length)
		{
			if (params.auto_play) startTimer();
			$Container.show();
			currentIndex = 0;
			Carousel['SubPub'].Publish('changedIndex');				
		}
		
		sizeContainer();
		$( window ).resize(sizeContainer);
		
		return Carousel;
	}

	function subscription_callback(topic, data)
	{
		switch (topic)
		{
			case 'changedIndex':
				changeIndex(data);
				break;
			case 'SetPanes':
				set_panes(data);
				break;
		}

		return;
	}

	function toggle_play_pause()
	{
		if (carouselTimeout !== undefined)
		{
			stopTimer();
		}
		else
		{
			startTimer();				
		}
	}
};

Class.TooltipValidation = function(params)
	{
		 var Tooltip,
			$context, $icon, $anchor, $tooltip_container, $tooltip_div, $tooltip_text,
			tooltip_visible, tooltip_text, tooltip_ident, idents_text, user_styling;
			
		 construct.call(this);
		 return;
		 
		 function construct()
			{
				var params_default = {'context_element': document['body'], 'delay_ms': 200, 'animate_ms': 250,'max_width': '25em'};
				params = Utils.ObjectExtend(params_default, params);
				
				Tooltip = this;
				Tooltip.Initialize = initialize;
				Tooltip.TextSet = tooltip_text_set;
				Tooltip.IdentSet = tooltip_ident_set;
				Tooltip.Hide = tooltip_hide;
				Tooltip.Show = tooltip_show;
			}
		 
		 function initialize(initialize_params)
			{
				Utils.ObjectExtend(params, initialize_params);
				if (! Utils.ObjectRequired(params, ['anchor_element', 'tooltip_position'], 'Class.TooltipValidation::initialize')) return Tooltip;
				
				$context = $(params['context_element']);
				$anchor = $(params['anchor_element']);

				user_styling = (params.userStyling) ? params.userStyling : false;
				
				switch (params['tooltip_position'])
					{
						case 'left':
						case 'top':
						case 'top-right':
						case 'bottom-right':
							break;
							
						default:
							Utils.Log('Class.TooltipValidation::initialize', 'unexpected value: tooltip_position=', params['tooltip_position']);
							return Tooltip;
					}
				
				tooltip_text = params['tooltip_text'];
				tooltip_ident = params['tooltip_ident'];
				
				$tooltip_container = $('<div class="toolTipContainer validation"></div>');
				$tooltip_div = $('<div class="tooltip" tabindex="1"></div>').appendTo($tooltip_container);
				$tooltip_text = $('<p class="tooltipText"></p>').appendTo($tooltip_div);
				$('<span class="arrow"></span>').appendTo($tooltip_div);
				$tooltip_div.hide();
				$tooltip_container.appendTo($context);

				$tooltip_div.css('z-index', 60);
				if (params['max_width']) {
					$tooltip_div.css('max-width', params['max_width']);
				}
									 
				tooltip_visible = false;
				idents_text = {};
				
				$(window).scroll(function() {
					tooltip_reposition();
				});
				
				return Tooltip;
			}
		 
		 function tooltip_text_set(text)
			{
				tooltip_text = text;
				return Tooltip;
			}
			
		function tooltip_ident_set(ident)
			{
				tooltip_ident = ident;
				return Tooltip;
			}
		 
		 function tooltip_toggle() 
			{
				if (! tooltip_visible) tooltip_show();
				else tooltip_hide();
			}

		 function tooltip_show() 
			{
				tooltip_visible = true;
				
				if (tooltip_ident)
					{
						if (! idents_text[tooltip_ident]) tooltip_get();
						else tooltip_open();
					}
				else
					{
						tooltip_open();
					}
				
				return Tooltip;
				
				function tooltip_get()
					{
						var request = {'command': 'idents_text', 'params': {'idents': [tooltip_ident]}};
						params['RequestResponse'].Append(request, idents_text_callback).Send();
						return;

						function idents_text_callback(response)
							{
								var RequestResponse = this;

								var result = response.result;
								if (! result) return;

								var result_idents_text = result.idents_text;
								if (! result_idents_text) return;

								for (var ident in result_idents_text)
									{
										idents_text[ident] = result_idents_text[ident];
									}
								
								tooltip_open();
							}
					}
				
				function tooltip_open()
					{
						var text = (tooltip_ident) ? idents_text[tooltip_ident] : tooltip_text;
						$tooltip_text.html(text);
						
						var anchor_offset = $anchor.offset(),
							animate_settings = {};
							
						switch (params['tooltip_position']) 
							{
								case 'left':								 
									$tooltip_div.addClass('e');

									if (!user_styling)
									{
										var left = anchor_offset.left - $tooltip_div.width();
										animate_settings["left"] = left + "px";

										$tooltip_div.addClass('e');


										$tooltip_div.css('left', (left + 25) + 'px');
										$tooltip_div.css('top', Math.round(anchor_offset.top + (($anchor.height() - $tooltip_div.height()) / 2) + 15 ) + 'px');
									}
									
									break;								 
								case 'top':
		 							$tooltip_div.addClass('s');

		 							if (!user_styling)
									{
										 var maxwidth = Math.round(($context.width() - (anchor_offset.left - $context.offset().left) - 10) * 2);

										 if ($tooltip_div.width() > maxwidth) {
		 									// $tooltip_div.css('max-width',maxwidth + "px");
										 }
										 
										 var left = Math.round(anchor_offset.left - ($tooltip_div.width() / 2) + ($anchor.width() / 2));

										 
										 
										 $tooltip_div.css('left', left + 'px');
										 $tooltip_div.css('top', (anchor_offset.top - $tooltip_div.height() - 8) + 'px');
									}

									 break;
									 
								case 'top-right':
		 
									$tooltip_div.addClass('s');

									if (!user_styling)
									{

										 var maxwidth = Math.round(($context.width() - (anchor_offset.left - $context.offset().left) - 10) * 2);

										 if ($tooltip_div.width() > maxwidth) {
		 									// $tooltip_div.css('max-width',maxwidth + "px");
										 }
										 
										 var left = Math.round(anchor_offset.left + $anchor.outerWidth() - $tooltip_div.outerWidth() - 20);
										 var top = (anchor_offset.top - $tooltip_div.height() + ($tooltip_div.height()/2) - 10);


										 
										 $tooltip_div.css('left', left + 'px');
										 $tooltip_div.css('top', top + 'px');
									}
									 break;
									 
								case 'bottom-right':
		 
									$tooltip_div.addClass('n');

									if (!user_styling)
									{
										 var maxwidth = Math.round(($context.width() - (anchor_offset.left - $context.offset().left) - 10) * 2);

										 if ($tooltip_div.width() > maxwidth) {
		 									// $tooltip_div.css('max-width',maxwidth + "px");
										 }
										 
										 var left = Math.round(anchor_offset.left + $anchor.outerWidth() - $tooltip_div.outerWidth());
										 
										 
										 $tooltip_div.css('left', left + 'px');
										 $tooltip_div.css('top', (anchor_offset.top + ($tooltip_div.height()/2) - 5) + 'px');
									}
									 break;
							}

						$tooltip_div.fadeIn({duration: params['animate_ms'], queue: false}).animate(animate_settings, {duration: params['animate_ms'], easing: 'easeInCirc'});
						
						$tooltip_div.css('width', $tooltip_div.outerWidth()+1);
					}
			}
			
		function tooltip_reposition()
			{
				if (tooltip_visible)
					{
						var anchor_offset = $anchor.offset();
						console.log($tooltip_div.outerWidth());

						switch (params['tooltip_position']) 
							{
								case 'left':

									 $tooltip_div.addClass('e');

									if (!user_styling)
									{
										var left = anchor_offset.left - $tooltip_div.width();


									 $tooltip_div.css('left', (left + 25) + 'px');
									 $tooltip_div.css('top', Math.round(anchor_offset.top + (($anchor.height() - $tooltip_div.height()) / 2) + 15 ) + 'px');
									}


									 break;

								case 'top':

									 $tooltip_div.addClass('s');

		 							if (!user_styling)
									{
										 var maxwidth = Math.round(($context.width() - (anchor_offset.left - $context.offset().left) - 10) * 2);

									 if ($tooltip_div.width() > maxwidth) {
										// $tooltip_div.css('max-width',maxwidth + "px");
									 }

									 var left = Math.round(anchor_offset.left - ($tooltip_div.width() / 2) + ($anchor.width() / 2));


									 $tooltip_div.css('left', left + 'px');
									 $tooltip_div.css('top', (anchor_offset.top - $tooltip_div.height() - 8) + 'px');
									}

									 break;

								case 'top-right':

									$tooltip_div.addClass('s');

									if (!user_styling)
									{

										 var maxwidth = Math.round(($context.width() - (anchor_offset.left - $context.offset().left) - 10) * 2);

									 if ($tooltip_div.width() > maxwidth) {
										// $tooltip_div.css('max-width',maxwidth + "px");
									 }

									 var left = Math.round(anchor_offset.left + $anchor.outerWidth() - $tooltip_div.outerWidth() - 20);

									 $tooltip_div.css('left', left + 'px');
									 $tooltip_div.css('top', (anchor_offset.top - $tooltip_div.height() + ($tooltip_div.height()/2) - 10) + 'px');
									}

									 
									 break;

								case 'bottom-right':

									$tooltip_div.addClass('n');

									if (!user_styling)
									{
										 var maxwidth = Math.round(($context.width() - (anchor_offset.left - $context.offset().left) - 10) * 2);

									 if ($tooltip_div.width() > maxwidth) {
										// $tooltip_div.css('max-width',maxwidth + "px");
									 }

									 var left = Math.round(anchor_offset.left + $anchor.outerWidth() - $tooltip_div.outerWidth());

									 $tooltip_div.css('left', left + 'px');
									 $tooltip_div.css('top', (anchor_offset.top + ($tooltip_div.height()/2) - 5) + 'px');
									}
									 
									 break;
							}
					}
			}
		
		function tooltip_hide()
			{
				tooltip_visible = false;
				$tooltip_div.fadeOut(params['animate_ms'] / 2);
				return Tooltip;
			}
	};

Class.Validate = function(params)
{
	var Validate;

	construct.call(this);
	return;

	function construct()
	{
		var params_default = {};
		params = Utils.ObjectExtend(params_default, params);

		Validate = this;
		Validate.Initialize = initialize;
		Validate.Empty = empty;
		Validate.Email = email;
		Validate.Phone = phone;
	}

	function initialize()
	{
		return Validate;
	}
	
	function empty(val)
	{
		if (val == '') return false;
		
		return true;
	}
	
	function email(val)
	{
		var re = /^[a-zA-Z0-9\!\#\$\%\&\'\*\+\-\/\=\?\^\_\`\{\|\}\~]+(\.[a-zA-Z0-9\!\#\$\%\&\'\*\+\-\/\=\?\^\_\`\{\|\}\~]+)*@(([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6})$/;
		return re.test(val.trim());
	}
	
	function phone(val)
	{
		var re = /^(\+[0-9]{1,3} ){0,1}([0-9(). -]{10,20})( [xX][0-9]{1,5}){0,1}$/;
		return re.test(val.trim());
	}
};

Class.SVGAnimations = function(params)
{
	var SVGAnimations, svgDoc;

	construct.call(this);
	return;

	function construct()
	{
		var params_default = {};
		params = Utils.ObjectExtend(params_default, params);

		SVGAnimations = this;
		SVGAnimations.Initialize = initialize;
		
		SVGAnimations.AnimatePath = animatePath;
		SVGAnimations.AnimateAttribute = animateAttribute;
	}

	function initialize()
	{
		if (!params.inline)
			{
				var objectElem = document.getElementById(params.objectID);
				
				objectElem.addEventListener('load', function(){
					if (objectElem.contentDocument)
						{
							svgDoc = objectElem.contentDocument;
						}
					else
						{
							svgDoc = objectElem.getSVGDocument();
						}

					if (params.onLoadCallback) params.onLoadCallback();
				});
			}
		else
			{
				svgDoc = document;
				if (params.onLoadCallback) params.onLoadCallback();
			}
		
		return SVGAnimations;
	}
	
	/*
	 * ANIMATE PATH
	 *   Create a path animation for an SVG element.
	 * 
	 * @param params 
	 *	{
	 *		elemID -- string: The ID of the SVG element to be animated.
	 *		pathString -- string: String of the SVGs path. Path components that are to be animated should be replaced with a '%PV' placeholder.
	 *		endingPathVars -- array: Array of numbers that represent the final values of the path components to be animated.
	 *		currentPathVars -- array: Array of numbers that represent the starting values of the path components to be animated.
	 *		interval -- integer: The number of milliseconds the animation interval should use.
	 *		increment -- integer: The denominator used to calculate the animated Path component intervals. Interval * increment creates the length of the animation.
	 *	}
	 */
	function animatePath(params)
	{
		if (!svgDoc) return false;
		
		var pathVarsIncrements = [];

		for (var i = 0; i < params.endingPathVars.length; i++)
		{
			pathVarsIncrements[i] = (params.endingPathVars[i]-params.currentPathVars[i])/params.increment;
		}

		var pathInterval = setInterval(animation, params.interval);
		
		return true;

		function animation()
		{
			var elem = svgDoc.getElementById(params.elemID);

			var path = params.pathString;

			var allPathsComplete = true;
			for (var i = 0; i < params.endingPathVars.length; i++)
			{
				params.currentPathVars[i] =
					(params.currentPathVars[i]+pathVarsIncrements[i] > params.endingPathVars[i]) ? params.endingPathVars[i] : params.currentPathVars[i]+pathVarsIncrements[i];
				path = path.replace('%PV', params.currentPathVars[i]);

				if (params.currentPathVars[i] < params.endingPathVars[i]) allPathsComplete = false;
			}

			elem.setAttribute('d', path);

			if (allPathsComplete) clearInterval(pathInterval);
		}
	}
	
	/*
	 * ANIMATE ATTRIBUTE
	 *   Create an attribute animation for an SVG element.
	 * 
	 * @param params 
	 *	{
	 *		elemID -- string: The ID of the SVG element to be animated.
	 *		attribute -- string: The SVG attribute to be animated.
	 *		finalValue -- float: The attribute value the element is to be set to.
	 *		interval -- integer: The number of milliseconds the animation interval should use.
	 *		increment -- integer: The denominator used to calculate the animated Path component intervals.
	 *							Interval * increment creates the length of the animation (assuming initial opacity is 0).
	 *	}
	 */
	function animateAttribute(params)
	{
		if (!svgDoc) return false;
		
		var elem = svgDoc.getElementById(params.elemID);
		var initialAttrVal = parseFloat(elem.getAttribute(params.attribute));
		var increasing = (params.finalValue > initialAttrVal);
		
		var attributeIncrement = (increasing) ? (params.finalValue-initialAttrVal)/params.increment : (initialAttrVal-params.finalValue)/params.increment;
		var attributeInterval = setInterval(animation, params.interval);
		
		return true;
		
		function animation()
		{
			var attributeValue = parseFloat(elem.getAttribute(params.attribute));
				if (!attributeValue) attributeValue = 0;
			
			if (increasing)
			{
				attributeValue = ((attributeValue+attributeIncrement) > params.finalValue) ? params.finalValue : (attributeValue+attributeIncrement);
			}
			else
			{
				attributeValue = ((attributeValue-attributeIncrement) < params.finalValue) ? params.finalValue : (attributeValue-attributeIncrement);
			}
			
			elem.setAttribute(params.attribute, attributeValue);
			
			if (increasing)
			{
				if (attributeValue >= params.finalValue) clearInterval(attributeInterval);
			}
			else
			{
				if (attributeValue <= params.finalValue) clearInterval(attributeInterval);
			}
		}
	}
};

Class.Sticky = function(params)
{
	var Sticky, $elem, startingElemPos, $placeholderElem, constrainerElemPos, $constrainerElem;
	var elemTooLarge;

	construct.call(this);
	return;

	function construct()
	{
		var params_default = {};
		params = Utils.ObjectExtend(params_default, params);

		Sticky = this;
		Sticky.Initialize = initialize;
	}

	function initialize()
	{
		if (! $('#'+params.id).length) return;

		if (params.placeholderID) $placeholderElem = $('#'+params.placeholderID);
		if (params.constrainerID) $constrainerElem = $('#'+params.constrainerID);
		
		$elem = $('#'+params.id);

		startingElemPos = $elem.offset();
		
		$( window ).resize(resizeEvent);
		
		$(window).scroll(scrollEvent);
		scrollEvent.apply($(window));
		
		elemTooLarge = false
		if ($constrainerElem)
			{
				var elemHeight = $elem.outerHeight();
				var constrainerHeight = $constrainerElem.outerHeight();
				
				if (elemHeight >= constrainerHeight)
					{
						elemTooLarge = true;
					}
			}
		
		if ($('.vertical-page-nav-mobile').length)
			{
				$('.vertical-page-nav-mobile a').click(function() {
					$('.vertical-page-nav-ul').slideToggle();
					return false;
				});
			}
		
		return Sticky;
	}

	function scrollEvent()
	{
		if (elemTooLarge) return;
		
		if ($placeholderElem) startingElemPos = $placeholderElem.offset();
		
		if ($(this).scrollTop() > (startingElemPos.top + 10))
			{
				if (!$elem.hasClass('stuck'))
					{
						$elem.addClass('stuck');
					}
			}
		else
			{
				if ($elem.hasClass('stuck'))
					{
						$elem.removeClass('stuck');
					}
			}
			
		if ($constrainerElem)
			{
				constrainerElemPos = $constrainerElem.offset();
				var elemHeight = $elem.outerHeight();
				var constrainerHeight = $constrainerElem.outerHeight();
				var bottomVisibleHeight = (constrainerHeight + constrainerElemPos.top) - $(this).scrollTop();
				
				if (elemHeight > bottomVisibleHeight)
					{
						var topPosition = elemHeight - bottomVisibleHeight;
						$elem.css('top', '-'+topPosition+'px')
					}
				else
					{
						$elem.css('top', 0)
					}
			}
	}
	
	function resizeEvent()
	{
		startingElemPos = $elem.offset();
	}
	
};

/*
 * Global ready handler.
 */
$(document).ready(function()
	{
		Utils.TableFix();
		
		if (! Const['CCW_DEVEL'])
			{
				(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
				(i[r].q=i[r].q||[]).push(arguments);},i[r].l=1*new Date();a=s.createElement(o),
				m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m);
				})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

				ga('create', 'UA-9701302-1', 'canfieldsci.com');
				ga('require', 'displayfeatures');
				ga('require', 'linkid', 'linkid.js');
				ga('send', 'pageview');
			}
	});