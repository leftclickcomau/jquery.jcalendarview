/*
 * jcalendarview
 * Continuous improvement to convert an unordered list into a calendar view.
 * 
 * Leftclick.com.au jQuery plugin library
 * 
 * Copyright (c) 2009 Leftclick.com.au, Ben New
 * 
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

;(function($) {
	
	/**
	 * Convert a &lt;ul&gt; element into a calendar view.
	 * 
	 * TODO Document options
	 */
	$.fn.jcalendarview = function(options, date) {
		var calendar = null;
		$(this).each(function() {
			if (this.nodeName.toLowerCase() == 'ul') {
				calendar = new $.jcalendarview(this, options, date);
			}
		});
		return calendar;
	};
	
	/**
	 * Initialise the given element as a calendar view.
	 * 
	 * @param elem &lt;ul&gt; element to convert into a calendar view
	 * @param options See $.fn.jcalendarview(options)
	 */
	$.jcalendarview = function(elem, options, date) {
		this.options = $.extend({}, $.jcalendarview.defaultOptions, options);
		this.date = this.fixDate(date ? date : new Date());
		this.elem = $(elem);
		this.container = $('<div class="' + this.options.calendarViewClass + '"></div>');
		this.elem.parent().append(this.container);
		this.data = this.getData($('li', this.elem));
		this.size = Math.floor(this.container.innerWidth() / 7.0);
		this.render();
		this.container.append('<div style="clear:both;"></div>');
		this.container.css('display', 'inline-block');
		this.elem.css('display', 'none');
		return this.container;
	};

	/**
	 * Calendar view default options.
	 */
	$.jcalendarview.defaultOptions = {
		'displayControls' : true,
		'minDate' : null,
		'maxDate' : null,
		
		'dateFieldInputClass' : 'date',
		'previewTextInputClass' : 'previewText',
		'fullTextInputClass' : 'fullText',
	
		'calendarViewClass' : 'cvCalendarView',
		'monthYearClass' : 'cvMonthYear',
		'previousMonthLinkClass' : 'cvPreviousMonth',
		'nextMonthLinkClass' : 'cvNextMonth',
		'dayNameDivClass' : 'cvDayNameDiv',
		'dayNameLabelClass' : 'cvDayNameLabel',
		'dayClass' : 'cvDay',
		'dayOutOfMonthClass' : 'cvDayOutOfMonth',
		'pastDateClass' : 'cvPastDate',
		'currentDateClass' : 'cvCurrentDate',
		'futureDateClass' : 'cvFutureDate',
		'dayNumberClass' : 'cvDayNumber',
		'currentDateLabelClass' : 'cvCurrentDateLabel',
		'innerClass' : 'cvInner',
		'dateFieldClass' : 'cvDate',
		'previewTextContainerClass' : 'cvPreviewText',
		'fullTextContainerClass' : 'cvFullText',
		
		'currentDateLabelText' : 'today',
		'previousMonthLinkText' : '&lArr; previous',
		'nextMonthLinkText' : 'next &rArr;'
	};
	
	/**
	 * Instance methods for calendar view widget.
	 */
	$.extend($.jcalendarview.prototype, {
		
		/**
		 * Get the data from the given set of &lt;li&gt; elements.
		 * 
		 * @param liElems Elements to inspect.
		 * 
		 * @return Key-value map of data from the list.
		 */
        getData : function(liElems) {
                data = [];
                for (var i=0; i<liElems.length; i++) {
                var liElem = liElems[i];
                if (liElem.nodeName.toLowerCase() == 'li') {
                    liElem = $(liElem);
                    var dateElem = liElem.find('.'+this.options.dateFieldInputClass);
                    if (dateElem && dateElem.length > 0) {
                        var dateText = $.trim($(dateElem).text());
                        var date = Date.parse(dateText);
                        if (date && $.isFunction(date.set)) {
                            var previewTextElem = liElem.find('.'+this.options.previewTextInputClass);
                            var fullTextElem = liElem.find('.'+this.options.fullTextInputClass);
                            date.set({ 'hour' : 0, 'minute' : 0, 'second' : 0, 'millisecond' : 0 });
                            data[data.length] = {
                                'date' : date,
                                'previewText' : previewTextElem.html(),
                                'fullText' : fullTextElem.html()
                            };
                        }
                    }
                    }
                }
                return data;
                },
		
		/**
		 * Helper method.
		 * Create a nested div, that is, a div with another div inside it.  The
		 * outer div has the given class, and the inner div has the innerClass
		 * from the options object.  The outer div is appended to the given
		 * parent.
		 * 
		 * @param param Parent to add the nested div to.
		 * @param outerClass Class for the outer div.
		 * 
		 * @return Inner div.
		 */
		createNestedDiv : function(parent, outerClass) {
			var outer = $('<div class="' + outerClass + '"></div>');
			var inner = $('<div class="' + this.options.innerClass + '"></div>');
			parent.append(outer);
			outer.append(inner);
			return inner;
		},
		
		/**
		 * Create a div containing the month name and year, and month
		 * navigation links.
		 * 
		 * @param date The date to create the calendar view for.
		 * 
		 * @return Created div.
		 */
		createMonthYearDiv : function(date) {
			var div = this.createNestedDiv(this.container, this.options.monthYearClass);
			var previousMonthLink = $('<a href="#" class="' + this.options.previousMonthLinkClass + '">' + this.options.previousMonthLinkText + '</a>');
			var nextMonthLink = $('<a href="#" class="' + this.options.nextMonthLinkClass + '">' + this.options.nextMonthLinkText + '</a>');
			var _jcalendarview = this;
			previousMonthLink.click(function(event) {
				_jcalendarview.move(-1);
				return false;
			});
			nextMonthLink.click(function(event) {
				_jcalendarview.move(+1);
				return false;
			});
			div.append(previousMonthLink);
			div.append(nextMonthLink);
			div.append(date.toString('MMMM yyyy'));
			return div;
		},
		
		/**
		 * Create a div containing the names of the days.
		 * 
		 * @return Created div.
		 */
		createDayNameDiv : function() {
			var div = $('<div class="' + this.options.dayNameDivClass + '"></div>');
			var date = new Date();
			date.moveToDayOfWeek(0, -1);
			for (var i=0; i<7; i++) {
				this.createNestedDiv(div, this.options.dayNameLabelClass)
					.append('<strong>'+date.toString('ddd')+'</strong>')
					.parent().width(this.size);
				date.addDays(1);
			}
			this.container.append(div);
			return div;
		},
		
		/**
		 * Create a div for a single day, not including the data.
		 * 
		 * @param date Date of the day.
		 * @param isOutOfMonth True if the day is out of the current month.
		 * @param dateDiff Number of days between the current date and the
		 *   given date (positive for future dates, negative for past dates).
		 *   
		 * @return Created div.
		 */
		createDayDiv : function(date, isOutOfMonth, dateDiff) {
			var cssClass = this.options.dayClass + ' ' + (
				isOutOfMonth ? 
					this.options.dayOutOfMonthClass : 
					dateDiff == 0 ? 
						this.options.currentDateClass : 
						dateDiff < 0 ? 
							this.options.pastDateClass : 
							this.options.futureDateClass);
			var div = this.createNestedDiv(this.container, cssClass);
			div.append('<div class="'+ this.options.dayNumberClass + '">' + date.toString('dd') + '</div>');
			if (dateDiff == 0) {
				div.append('<div class="' + this.options.currentDateLabelClass + '">' + this.options.currentDateLabelText + '</div>');
			}
			return div;
		},
		
		/**
		 * Fix the given date by ensuring it is a Date object and represents a
		 * date at midnight.
		 * 
		 * @param date Date to fix.
		 * 
		 * @return Fixed date.
		 */
		fixDate : function(date) {
			if (!date) {
				date = new Date();
			} else if (typeof date == 'string') {
				date = parseDate(date);
			} else if (typeof date == 'number') {
				date = new Date(date);
			}
			date.set({ 'hour' : 0, 'minute' : 0, 'second' : 0, 'millisecond' : 0 });
			return date;
		},
		
		/**
		 * Move the given number of months, and re-draw the view.
		 */
		move : function(delta) {
			this.date = this.date.addMonths(delta);
			this.container.html('');
			this.render();
		},
		
		/**
		 * Draw the calendar view at the current date.
		 */
		render : function() {
			// Initialise
			var date = new Date(this.date.getTime());
			date.moveToFirstDayOfMonth();
			var month = date.getMonth();
			var year = date.getYear();
			
			var monthYearDiv = this.createMonthYearDiv(date);
			var dayNameDiv = this.createDayNameDiv(this.size);
			
			// Process each date in order
			date.moveToDayOfWeek(0, -1);
			while (((date.getMonth() <= month) && (date.getYear() <= year)) || ((month == 0) && (date.getYear() < year)) || (date.getDay() > 0)) {
				this.renderDate(date, month);
				date.addDays(1);
			}
		},
		
		/**
		 * Draw a single date.
		 * 
		 * @param date Date to draw.
		 * @param month Month being drawn.
		 */
		renderDate : function(date, month) {
			var now = this.fixDate(new Date());
			if (date.getDay() == 0) {
				this.container.append('<div style="clear:both;"></div>');
			}
			var dayDiv = this.createDayDiv(date, date.getMonth() != month, date.compareTo(now));
			dayDiv.parent().width(this.size).height(this.size);
			// TODO get the actual padding and border sizes, not just -10 here
			dayDiv.width(this.size-10).height(this.size-10);
			for (var i=0; i<this.data.length; i++) {
				datum = this.data[i];
				if (datum['date'].equals(date)) {
					dayDiv.addClass('event');
					this.processDayData($(dayDiv), datum['previewText'], datum['fullText']);
				}
			}
		},
		
		/**
		 * Process a single piece of data on a given date.
		 * 
		 * @param dayDiv Div representing the relevant date.
		 * @param previewText Text to display directly on the calendar.
		 * @param fullText Text to display in the popup div.
		 */
		processDayData : function(dayDiv, previewText, fullText) {
			var previewTextContainer = $('<div class="' + this.options.previewTextContainerClass + '"><span>' + previewText + '</span></div>');
			var fullTextContainer = $('<div class="' + this.options.fullTextContainerClass + '"><span>' + fullText + '</span></div>');
			this.container.append(fullTextContainer.css({
				'position' : 'absolute',
				'display' : 'none'
			}));
			dayDiv.append(previewTextContainer.mouseenter(function(event) {
				var offset = dayDiv.parent().offset();
				var left = offset['left'] + dayDiv.parent().width();
				if (left + fullTextContainer.outerWidth() > $(document.body).width()) {
					left = offset['left'] - fullTextContainer.outerWidth(true);
				}
				fullTextContainer.css({
					'position' : 'absolute',
					'left' : left,
					'top' : offset['top'],
					'display' : 'none'
				}).stop(null, true).fadeIn();
			}).mouseleave(function(event) {
				fullTextContainer.stop(null, true).fadeOut();
			}).css('cursor', 'pointer'));
		}
	});
})(jQuery);
