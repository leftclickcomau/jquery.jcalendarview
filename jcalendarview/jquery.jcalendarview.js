/*
 * jCalendarView
 * 
 * Continuous improvement to convert an unordered list into a calendar view.
 * 
 * TODO License
 */

(function($) {
	
	$.fn.calendarView = function(options) {
		var options = $.extend({}, $.calendarView.defaultOptions, options);
		$(this).each(function() {
			if (this.nodeName.toLowerCase() == 'ul') {
				$.calendarView._init(this, options);
			}
		});
	};
	
	$.calendarView = {
		defaultOptions : {
			'calendarViewClass' : 'cvCalendarView',
			'monthYearClass' : 'cvMonthYear',
			'dayNameContainerClass' : 'cvDayNameContainer',
			'dayNameLabelClass' : 'cvDayNameLabel',
			'dayClass' : 'cvDay',
			'dayOutOfMonthClass' : 'cvDayOutOfMonth',
			'dayNumberClass' : 'cvDayNumber',
			'innerClass' : 'cvInner',
			'dateFieldClass' : 'cvDate',
			'eventTitleFieldClass' : 'cvEventTitle',
			'eventTimesFieldClass' : 'cvEventTimes',
			'dateFieldInputClass' : 'date',
			'titleFieldInputClass' : 'title',
			'timesFieldInputClass' : 'times',
			'displayControls' : true,
			'currentDate' : new Date(),
			'minDate' : null,
			'maxDate' : null
		},
		
		_init : function(elem, options) {
			var appendNestedDiv = function(container, outerClass) {
				var outer = $('<div class="' + outerClass + '"></div>');
				var inner = $('<div class="' + options.innerClass + '"></div>');
				container.append(outer);
				outer.append(inner);
				return inner;
			};
			
			var createDayDiv = function(container, date, outOfMonth) {
				var cssClass = options.dayClass + (outOfMonth ? ' '+options.dayOutOfMonthClass : '');
				var div = appendNestedDiv(container, cssClass);
				div.append('<div class="'+ options.dayNumberClass + '">' + date.toString('dd') + '</div>');
				return div;
			};
			
			elem = $(elem);
			var data = $('li', elem);
			elem.css('display', 'none');
			
			var container = $('<div class="' + options.calendarViewClass + '"></div>');
			elem.parent().append(container);
			
			var date = options.currentDate;
			if (!date) {
				date = new Date();
			} else if (typeof date == 'string') {
				date = parseDate(date);
			} else if (typeof date == 'number') {
				date = new Date(date);
			}
			
			var monthYearDiv = appendNestedDiv(container, options.monthYearClass);
			monthYearDiv.append(date.toString('MMMM yyyy'));
			
			var dayNameContainer = $('<div class="' + options.dayNameContainerClass + '"></div>');
			container.append(dayNameContainer);
			var dayNameCount = 0;
			
			var month = date.getMonth();
			date.moveToFirstDayOfMonth();
			date.moveToDayOfWeek(0, -1);
			date.set({ 'hour' : 0, 'minute' : 0, 'second' : 0, 'millisecond' : 0 });

			while (date.getMonth() <= month || date.getDay() > 0) {
				if (date.getDay() == 0) {
					container.append('<div style="clear:both;"></div>');
				}
				if (dayNameCount++ < 7) {
					appendNestedDiv(dayNameContainer, options.dayNameLabelClass).append(date.toString('dddd'));
				}
				var dayDiv = createDayDiv(container, date, date.getMonth() != month);
				if (date.getMonth() == month) {
					for (var i=0; i<data.length; i++) {
						var liElem = data[i];
						var dataDateElem = $(liElem).find('.'+options.dateFieldInputClass);
						var dataDate = Date.parse($(dataDateElem).text());
						dataDate.set({ 'hour' : 0, 'minute' : 0, 'second' : 0, 'millisecond' : 0 });
						if (dataDate.equals(date)) {
							dayDiv.addClass('event');
							var titleElem = $(liElem).find('.'+options.titleFieldInputClass);
							var timesElem = $(liElem).find('.'+options.timesFieldInputClass);
							dayDiv.append('<div class="' + options.eventTitleFieldClass + '"><span>' + $(titleElem).html() + '</span></div>');
							dayDiv.append('<div class="' + options.eventTimesFieldClass + '"><span>' + $(timesElem).html() + '</span></div>');
						}
					}
				}
				date.addDays(1);
			}
			container.append('<div style="clear:both;"></div>');
		}
	};
	
})(jQuery);
