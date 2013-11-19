// Copyright © 2013 BlackJet Software Ltd (http://www.blackjetsoftware.com/)
// Source code distributed under the terms of the GNU General Public License v3 (http://www.gnu.org/licenses/gpl.txt)

test("secondsToHMS tests", function () {
    var totalSeconds0 = window.taskTimer.utils.secondsToHMS(0);
    equal(totalSeconds0.hours, '00');
    equal(totalSeconds0.minutes, '00');
    equal(totalSeconds0.seconds, '00');

    var totalSeconds59 = window.taskTimer.utils.secondsToHMS(59);
    equal(totalSeconds59.hours, '00');
    equal(totalSeconds59.minutes, '00');
    equal(totalSeconds59.seconds, '59');

    var totalSeconds60 = window.taskTimer.utils.secondsToHMS(60);
    equal(totalSeconds60.hours, '00');
    equal(totalSeconds60.minutes, '01');
    equal(totalSeconds60.seconds, '00');

    var totalSeconds61 = window.taskTimer.utils.secondsToHMS(61);
    equal(totalSeconds61.hours, '00');
    equal(totalSeconds61.minutes, '01');
    equal(totalSeconds61.seconds, '01');
    
    var totalSeconds3599 = window.taskTimer.utils.secondsToHMS(3599);
    equal(totalSeconds3599.hours, '00');
    equal(totalSeconds3599.minutes, '59');
    equal(totalSeconds3599.seconds, '59');

    var totalSeconds3600 = window.taskTimer.utils.secondsToHMS(3600);
    equal(totalSeconds3600.hours, '01');
    equal(totalSeconds3600.minutes, '00');
    equal(totalSeconds3600.seconds, '00');

    var totalSecondsin23Hours = window.taskTimer.utils.secondsToHMS(3600 * 23);
    equal(totalSecondsin23Hours.hours, '23');
    equal(totalSecondsin23Hours.minutes, '00');
    equal(totalSecondsin23Hours.seconds, '00');
    
    var totalSecondsin24Hours = window.taskTimer.utils.secondsToHMS(3600 * 24);
    equal(totalSecondsin24Hours.hours, '24');
    equal(totalSecondsin24Hours.minutes, '00');
    equal(totalSecondsin24Hours.seconds, '00');
    
    var totalSecondsin48Hours = window.taskTimer.utils.secondsToHMS(3600 * 48);
    equal(totalSecondsin48Hours.hours, '48');
    equal(totalSecondsin48Hours.minutes, '00');
    equal(totalSecondsin48Hours.seconds, '00');
});

test("getDayDifference", function () {
    equal(window.taskTimer.utils.getDayDifference(new Date(2013, 0, 8, 22, 00, 00, 0), new Date(2013, 0, 8, 09, 00, 00, 0)), 0);
    equal(window.taskTimer.utils.getDayDifference(new Date(2013, 0, 8, 22, 00, 00, 0), new Date(2013, 0, 8, 22, 00, 00, 0)), 0);
    equal(window.taskTimer.utils.getDayDifference(new Date(2013, 0, 8, 22, 02, 03, 0), new Date(2013, 0, 7, 23, 00, 00, 0)), 1);
    equal(window.taskTimer.utils.getDayDifference(new Date(2013, 0, 8, 22, 02, 03, 0), new Date(2013, 0, 7, 20, 00, 00, 0)), 1);
});

test("dateToHtml", function() {

    equal(window.taskTimer.utils.dateToHtml(new Date(2013, 0, 1, 08, 02, 03, 0), new Date(2013, 0, 1, 22, 00, 00, 0)), '<span class="hours">08</span>:<span class="minutes">02</span>:<span class="seconds">03</span>');
    equal(window.taskTimer.utils.dateToHtml(new Date(2013, 0, 1, 14, 15, 16, 0), new Date(2013, 0, 1, 22, 00, 00, 0)), '<span class="hours">14</span>:<span class="minutes">15</span>:<span class="seconds">16</span>');
    equal(window.taskTimer.utils.dateToHtml(new Date(2013, 0, 1, 14, 15, 16, 0), new Date(2013, 0, 2, 22, 00, 00, 0)), 'Tuesday <span class="hours">14</span>:<span class="minutes">15</span>:<span class="seconds">16</span>');
    equal(window.taskTimer.utils.dateToHtml(new Date(2013, 0, 1, 14, 15, 16, 0), new Date(2013, 0, 7, 23, 59, 59, 0)), 'Tuesday <span class="hours">14</span>:<span class="minutes">15</span>:<span class="seconds">16</span>');
    equal(window.taskTimer.utils.dateToHtml(new Date(2013, 0, 1, 14, 15, 16, 0), new Date(2013, 0, 8, 22, 00, 00, 0)), 'Tue 1 Jan 2013 <span class="hours">14</span>:<span class="minutes">15</span>:<span class="seconds">16</span>');
    equal(window.taskTimer.utils.dateToHtml(new Date(2013, 0, 1, 14, 15, 16, 0), new Date(2013, 0, 10, 22, 00, 00, 0)), 'Tue 1 Jan 2013 <span class="hours">14</span>:<span class="minutes">15</span>:<span class="seconds">16</span>');
});