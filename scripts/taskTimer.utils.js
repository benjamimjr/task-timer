// Copyright © 2013 BlackJet Software Ltd (http://www.blackjetsoftware.com/)
// Source code distributed under the terms of the GNU General Public License v3 (http://www.gnu.org/licenses/gpl.txt)

if (typeof window.taskTimer === 'undefined') {
    window.taskTimer = {};
}

window.taskTimer.utils = (function () {
    var getDateWithoutTime = function(date) {
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        return new Date(year, month, day);
    };
    
    var getDayDifference = function (date1, date2) {
        var datePart1 = getDateWithoutTime(date1);
        var datePart2 = getDateWithoutTime(date2);
        var timeDiffMs = datePart1.getTime() - datePart2.getTime();
        var dayDiffDays = timeDiffMs / (1000 * 60 * 60 * 24);
        return dayDiffDays;
    };

    var pad = function (num) {
        var s = "0" + num;
        return s.substr(s.length - 2);
    };
    
    var secondsToHMS = function(totalSeconds) {
        var hours = Math.floor(totalSeconds / 60 / 60);
        var minutes = Math.floor(totalSeconds / 60) - (hours * 60);
        var seconds = Math.floor(totalSeconds) - (minutes * 60);

        return { hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds) };
    };
    
    var wrapInSpan = function (val, cssClass) {
        return '<span class="' + cssClass + '">' + val + '</span>';
    };

    var hmsToHtml = function(h, m, s) {
        return h == 0
            ? wrapInSpan(pad(m), 'minutes') + ':' + wrapInSpan(pad(s), 'seconds')
            : wrapInSpan(pad(h), 'hours') + ':' + wrapInSpan(pad(m), 'minutes') + ':' + wrapInSpan(pad(s), 'seconds');
    };

    var dateToHtml = function(date, today) {
        if (today == null) {
            today = new Date();
        }

        // Returns a fairly unambiguous date format of the specified date (in local time) that should be recognisable to a large proportion of users
        var dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        var dayDiffFromToday = getDayDifference(today, date);

        var timeHtml = timeToHtml(date);

        if (dayDiffFromToday == 0) return timeHtml;
        if (dayDiffFromToday < 7) return dayNames[date.getDay()] + ' ' + timeHtml;

        var dayNumber = date.getDate();
        var shortDayName = dayNamesShort[date.getDay()];
        var monthName = monthNames[date.getMonth()];
        var year = date.getFullYear();

        return shortDayName + ' ' + dayNumber + ' ' + monthName + ' ' + year + ' ' + timeHtml;
    };
    
    var timeToHtml = function(date) {
        return hmsToHtml(date.getHours(), date.getMinutes(), date.getSeconds());
    };

    var periodToHtml = function(startDate, endDate) {
        var withinSameDay = function() {
            return startDate.getFullYear() == endDate.getFullYear() &&
                startDate.getMonth() == endDate.getMonth() &&
                startDate.getDate() == endDate.getDate();
        };

        var startDateHtml = dateToHtml(startDate);

        var endDateHtml = endDate == null
            ? 'now'
            : withinSameDay()
                ? timeToHtml(endDate)
                : dateToHtml(endDate);

        return '<span class="periodRange">' +
            '<span class="startDate" title="' + startDate + '">' + startDateHtml + '</span>' +
            ' to ' +
            '<span class="endDate" title="' + endDate + '">' + endDateHtml + '</span>' +
            '</span>';
    };
    
    return {
        getDateWithoutTime: getDateWithoutTime,
        secondsToHMS: secondsToHMS,
        secondsToHMSHtml: function(totalSeconds) {
            var hms = secondsToHMS(totalSeconds);

            return hmsToHtml(hms.hours, hms.minutes, hms.seconds);
        },
        getDayDifference: getDayDifference,
        dateToHtml: dateToHtml,
        timeToHtml: timeToHtml,
        periodToHtml: periodToHtml
    };
})();
