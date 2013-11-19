// Copyright © 2013 BlackJet Software Ltd (http://www.blackjetsoftware.com/)
// Source code distributed under the terms of the GNU General Public License v3 (http://www.gnu.org/licenses/gpl.txt)

if (typeof window.taskTimer === 'undefined') {
    window.taskTimer = {};
}

window.taskTimer.model = (function () {
    var model = {
        tasks: {},
        activeTaskId: null
    };

    var newActivePeriod = function (startDate, endDate) {
        var getTotalDurationMs = function() {
            var intervalStart = startDate;
            var intervalEnd = endDate != null ? endDate : new Date();
            return  intervalEnd - intervalStart;
        };
        return {
            end: function() {
                endDate = new Date();
            },
            getStartDate: function() {
                return startDate;
            },
            getEndDate: function () {
                return endDate;
            },
            getTotalDurationMs: getTotalDurationMs,
            toJSON: function () {
                return {
                    start: startDate.getTime(),
                    end: endDate == null ? null : endDate.getTime()
                };
            }
        };
    };
    
    var newTask = function (id, name, activePeriods) {
        if (name.trim() == '') {
            name = 'no name';
        }
        var hasOpenPeriod = function() {
            if (activePeriods.length == 0)
                return false;
            var latestPeriod = activePeriods[activePeriods.length - 1];
            return latestPeriod.getEndDate() == null;
        };

        var startNewPeriod = function() {
            var newPeriod = newActivePeriod(new Date(), null);
            activePeriods.push(newPeriod);
        };
        
        return {
            getId: function () {
                return id;
            },
            getName: function () {
                return name;
            },
            setName: function (newName) {
                if (newName.trim() == '') {
                    newName = 'no name';
                }
                name = newName;
            },
            endCurrentPeriod: function () {
                if (!hasOpenPeriod())
                    throw 'Task "' + id + '" does not have a currently open period';
                
                var openPeriod = activePeriods[activePeriods.length - 1];
                openPeriod.end();
            },
            startNewPeriod: startNewPeriod,
            getActivePeriods: function () {
                return activePeriods.slice(0).sort(function (a, b) {
                    var aStart = a.getStartDate();
                    var bStart = b.getStartDate();
                    return aStart > bStart ? -1 : aStart < bStart ? 1 : 0;
                });
            },
            clearPeriods: function () {
                var isActive = hasOpenPeriod();
                activePeriods = [];
                if (isActive)
                    startNewPeriod();
            },
            getTotalDurationMs: function () {
                var totalMs = 0;
                activePeriods.forEach(function (activePeriod) {
                    totalMs += activePeriod.getTotalDurationMs();
                });
                return totalMs;
            },
            toJSON: function () {
                return {
                    id: id,
                    name: name,
                    activePeriods: activePeriods
                };
            }
        };
    };
    
    var saveToLocalStorage = function() {
        localStorage.tasks = JSON.stringify(window.taskTimer.model);
    };
    
    var loadFromLocalStorage = function () {
        if (localStorage.tasks) {

            var persistedModel = JSON.parse(localStorage.tasks);

            persistedModel.tasks.forEach(function(persistedTask) {
                var activePeriods = persistedTask.activePeriods.map(function(persistedPeriod) {
                    var startDate = new Date(persistedPeriod.start);
                    var endDate = persistedPeriod.end == null ? null : new Date(persistedPeriod.end);
                    return newActivePeriod(startDate, endDate);
                });

                var task = newTask(persistedTask.id, persistedTask.name, activePeriods);
                model.tasks[task.getId()] = task;
            });

            model.activeTaskId = persistedModel.activeTaskId;
        }
    };

    var newGuid = function () {
        var template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
        return template.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    var getTaskById = function (id) {
        if (model.tasks.hasOwnProperty(id))
            return model.tasks[id];
        return null;
    };
    
    var getActiveTask = function () {
        if (model.activeTaskId == null)
            return null;
        return getTaskById(model.activeTaskId);
    };
       
    var addTask = function (name) {
        var id = newGuid();
        var activePeriods = [];
        var task = newTask(id, name, activePeriods);
        model.tasks[task.getId()] = task;
        
        return task;
    };
    
    var deleteTask = function (task) {
        var taskId = task.getId();
        if (model.activeTaskId == taskId) {
            model.activeTaskId = null;
        }
        delete model.tasks[taskId];
    };

    var activateTask = function (newActiveTask) {
        var activeTask = getActiveTask();
        if (activeTask != null) {
            activeTask.endCurrentPeriod();
        }

        if (newActiveTask != null) {
            newActiveTask.startNewPeriod();
            model.activeTaskId = newActiveTask.getId();
        } else {
            model.activeTaskId = null;
        }
    };

    var getTasksAsArray = function() {
        var tasks = [];
        for (var key in model.tasks) {
            if (model.tasks.hasOwnProperty(key)) {
                tasks.push(model.tasks[key]);
            }
        }
        return tasks;
    };
    
    return {
        addTask: addTask,
        deleteTask: deleteTask,
        activateTask: activateTask,
        getActiveTask: getActiveTask,
        getTaskById: getTaskById,
        getAllTasks: getTasksAsArray,
        loadFromLocalStorage: loadFromLocalStorage,
        saveToLocalStorage: saveToLocalStorage,
        toJSON: function () {
            return {
                tasks: getTasksAsArray(),
                activeTaskId: model.activeTaskId
            };
        }
    };
})();
