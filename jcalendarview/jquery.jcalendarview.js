/*
 * jCalendarView
 * 
 * Continuous improvement to convert an unordered list into a calendar view.
 * 
 * TODO License
 */

(function($) {
	
	/**
	 * Convert a &lt;ul&gt; element into a calendar view.
	 * 
	 * TODO Document options
	 */
	$.fn.calendarView = function(options) {
		var options = $.extend({}, $.calendarView.defaultOptions, options);
		var calendar = null;
		$(this).each(function() {
			if (this.nodeName.toLowerCase() == 'ul') {
				calendar = $.calendarView._init(this, options);
			}
		});
		return calendar;
	};
	
	/**
	 * Utility functions for calendar view widget.
	 */
	$.calendarView = {
		
		/**
		 * Calendar view default options.
		 */
		defaultOptions : {
			'displayControls' : true,
			'currentDate' : new Date(),
			'minDate' : null,
			'maxDate' : null,
			
			'dateFieldInputClass' : 'date',
			'titleFieldInputClass' : 'title',
		
			'calendarViewClass' : 'cvCalendarView',
			'monthYearClass' : 'cvMonthYear',
			'dayNameDivClass' : 'cvdayNameDiv',
			'dayNameLabelClass' : 'cvDayNameLabel',
			'dayClass' : 'cvDay',
			'dayOutOfMonthClass' : 'cvDayOutOfMonth',
			'pastDateClass' : 'cvPastDate',
			'currentDateClass' : 'cvCurrentDate',
			'futureDateClass' : 'cvFutureDate',
			'dayNumberClass' : 'cvDayNumber',
			'innerClass' : 'cvInner',
			'dateFieldClass' : 'cvDate',
			'eventTitleFieldClass' : 'cvEventTitle',
			'textContainerClass' : 'cvTextContainer'
		},
		
		/**
		 * Initialise the given element as a calendar view.
		 * 
		 * @param elem &lt;ul&gt; element to convert into a calendar view
		 * @param options See $.fn.calendarView(options)
		 */
		_init : function(elem, options) {
			function getData(liElems) {
				data = [];
				for (var i=0; i<liElems.length; i++) {
					var liElem = liElems[i];
					var dateElem = $(liElem).find('.'+options.dateFieldInputClass);
					var date = Date.parse($(dateElem).text());
					var titleElem = $(liElem).find('.'+options.titleFieldInputClass);
					var title = $(titleElem).html();
					var text = $(liElem).html();
					var textContainer = $('<div class="' + options.textContainerClass + '"></div>').append(text).css('display', 'none');
					$(document.body).append(textContainer);
					date.set({ 'hour' : 0, 'minute' : 0, 'second' : 0, 'millisecond' : 0 });
					data[data.length] = {
						'date' : date,
						'title' : title,
						'text' : text,
						'textContainer' : textContainer
					};
				}
				return data;
			};
			
			function swapContainer(elem) {
				var container = $('<div class="' + options.calendarViewClass + '"></div>');
				elem = $(elem);
				elem.parent().append(container);
				return container;
			};
			
			function createNestedDiv(container, outerClass) {
				var outer = $('<div class="' + outerClass + '"></div>');
				var inner = $('<div class="' + options.innerClass + '"></div>');
				container.append(outer);
				outer.append(inner);
				return inner;
			};
			
			function createMonthYearDiv(container, date) {
				var div = createNestedDiv(container, options.monthYearClass);
				div.append(date.toString('MMMM yyyy'));
				return div;
			};
			
			function createDayNameDiv(container) {
				var div = $('<div class="' + options.dayNameDivClass + '"></div>');
				container.append(div);
				return div;
			};
			
			function createDayDiv(container, date, isOutOfMonth, dateDiff) {
				var cssClass = options.dayClass + ' ' + (
					isOutOfMonth ? 
						options.dayOutOfMonthClass : 
						dateDiff == 0 ? 
							options.currentDateClass : 
							dateDiff < 0 ? 
								options.pastDateClass : 
								options.futureDateClass);
				var div = createNestedDiv(container, cssClass);
				div.append('<div class="'+ options.dayNumberClass + '">' + date.toString('dd') + '</div>');
				return div;
			};
			
			function fixDate(date) {
				if (!date) {
					date = new Date();
				} else if (typeof date == 'string') {
					date = parseDate(date);
				} else if (typeof date == 'number') {
					date = new Date(date);
				}
				date.moveToFirstDayOfMonth();
				date.set({ 'hour' : 0, 'minute' : 0, 'second' : 0, 'millisecond' : 0 });
				return date;
			};
			
			function getCurrentDate() {
				var date = new Date();
				date.set({ 'hour' : 0, 'minute' : 0, 'second' : 0, 'millisecond' : 0 });
				return date;
			};
			
			function processDate(date, data) {
				if (date.getDay() == 0) {
					container.append('<div style="clear:both;"></div>');
				}
				if (dayNameCount++ < 7) {
					createNestedDiv(dayNameDiv, options.dayNameLabelClass)
						.append('<strong>'+date.toString('ddd')+'</strong>')
						.parent().width(size);
				}
				var dayDiv = createDayDiv(container, date, date.getMonth() != month, date.compareTo(now));
				dayDiv.parent().width(size).height(size);
				// TODO get the actual padding and border sizes, not just -10 here
				dayDiv.width(size-10).height(size-10);
				if (date.getMonth() == month) {
					for (var i=0; i<data.length; i++) {
						datum = data[i];
						if (datum['date'].equals(date)) {
							dayDiv.addClass('event');
							dayDiv.append('<div class="' + options.eventTitleFieldClass + '"><span>' + datum['title'] + '</span></div>');
							(function(dayDiv, textContainer) {
								dayDiv.mouseenter(function(event) {
									var offset = dayDiv.parent().offset();
									textContainer.css({
										'display' : 'block',
										'position' : 'absolute',
										'left' : offset['left'] + dayDiv.width(),
										'top' : offset['top']
									});
								});
								dayDiv.mouseleave(function(event) {
									textContainer.css({
										'display' : 'none'
									});
								});
							})($(dayDiv), $(datum['textContainer']));
						}
					}
				}
			};
			
			var x = true;
			
			var data = getData($('li', elem));
			var container = swapContainer($(elem));
			// TODO Get the actual padding and border here, instead of just -4
			var size = (container.width() - 4) / 7;
			var date = fixDate(options.currentDate);
			var now = getCurrentDate();
			var month = date.getMonth();
			var monthYearDiv = createMonthYearDiv(container, date);
			var dayNameDiv = createDayNameDiv(container);
			var dayNameCount = 0;

			date.moveToDayOfWeek(0, -1);
			container.css('display', 'inline-block');
			
			while (date.getMonth() <= month || date.getDay() > 0) {
				processDate(date, data);
				date.addDays(1);
			}
			
			container.append('<div style="clear:both;"></div>');
			$(elem).css('display', 'none');
			return container;
		}
	};
	
})(jQuery);
