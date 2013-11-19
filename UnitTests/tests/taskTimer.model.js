// Copyright © 2013 BlackJet Software Ltd (http://www.blackjetsoftware.com/)
// Source code distributed under the terms of the GNU General Public License v3 (http://www.gnu.org/licenses/gpl.txt)

var model = window.taskTimer.model;
test("adding task generates a non blank Guid", function () {
    var task = model.addTask('Task 1');
    console.log('new id = ' + task.getId());
    notEqual(task.getId(), '');
    notEqual(task.getId(), null);
});

test("adding task generates a unique Guid", function() {
    var task1 = model.addTask('Task 1');
    var task2 = model.addTask('Task 2');
    var task3 = model.addTask('Task 3');
    notEqual(task1.getId(), task2.getId());
    notEqual(task1.getId(), task3.getId());
    notEqual(task2.getId(), task3.getId());
});

test("getTaskById returns task if it exists", function () {
    
    var task1 = model.addTask('Task 1');
    var task1Id = task1.getId();
    
    deepEqual(model.getTaskById(task1Id), task1);
});

test("getTaskById returns null if task doesn't exist", function () {

    deepEqual(model.getTaskById('0'), null);
});