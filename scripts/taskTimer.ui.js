// Copyright © 2013 BlackJet Software Ltd (http://www.blackjetsoftware.com/)
// Source code distributed under the terms of the GNU General Public License v3 (http://www.gnu.org/licenses/gpl.txt)

if (typeof window.taskTimer === 'undefined') {
    window.taskTimer = {};
}

window.taskTimer.ui = (function ($, model, utils) {

    var activeItemCache = {
        task: null,
        durationElement: null
    };

    var uiDurationUpdateEnabled = false;
    var editModeEnabled = false;

    var setItemStyleToActive = function (listItem) {
        listItem.addClass('activeTask');
        listItem.find('.taskName').animate({ fontSize: '150%' }, 'normal');
    };
    
    var setItemStyleToInactive = function (listItem) {
        listItem.find('.taskName').animate({ fontSize: '100%' }, 'normal');
        listItem.removeClass('activeTask');
    };

    var scrollToActiveTaskItem = function () {
        var activeTaskItem = $('#taskList li.activeTask');
        if (activeTaskItem.length == 1) {
            $('html,body').animate({
                scrollTop: activeTaskItem.offset().top - ($('.ui-header').height() + activeTaskItem.height()/2)
            }, 'slow');
        }
    };

    var getTaskListItem = function(taskId) {
        return $('#taskList li[data-task-id="' + taskId + '"]');
    };
    
    var activateTaskListItem = function (listItem) {
        var newActivatedTaskId = listItem.attr('data-task-id');
        var newActiveTask = model.getTaskById(newActivatedTaskId);
        var currentActiveTask = model.getActiveTask();

        if (newActiveTask == currentActiveTask) return;

        if (currentActiveTask != null) {
            var currentActiveTaskId = currentActiveTask.getId();
            var currentActiveItem = getTaskListItem(currentActiveTaskId);
            setItemStyleToInactive(currentActiveItem);
        }

        setItemStyleToActive(listItem);
        
        model.activateTask(newActiveTask);
        model.saveToLocalStorage();

        activeItemCache.task = newActiveTask;
        activeItemCache.durationElement = listItem.find('.duration');
    };
   
    var buildDurationHtml = function (taskDurationMs) {
        var totalSeconds = Math.round(taskDurationMs / 1000);
        return utils.secondsToHMSHtml(totalSeconds);
    };

    var deleteTaskListItem = function (listItem) {
        var taskId = listItem.attr('data-task-id');
        var task = model.getTaskById(taskId);
        model.deleteTask(task);
        model.saveToLocalStorage();

        var documentWidth = $(document).width();
        
        listItem.animate({ right: documentWidth + 'px' }, 500, function () {
            listItem.animate({ height: '0' }, 500, function () {
                listItem.remove();
                updateEditTasksButtonVisibility();
                updateEmptyTaskListBannerVisibility();
            });
        });
    };

    var deleteButtonIsPresent = function() {
        var container = $('#taskList .taskDeleteButtonContainer');
        return (container.length != 0);
    };
    
    var removeTaskDeleteButton = function() {
        var container = $('#taskList .taskDeleteButtonContainer');
        if (container.length == 0)
            return;
        
        container.animate({ width: "hide", opacity: 0 }, 250, 'linear', function () {
            container.remove();
        });
    };
    
    var showTaskDeleteButton = function(taskItem) {

        var container = $('#taskList .taskDeleteButtonContainer');
        if (container.length != 0)
            return;
            
        var newButton = $('<button class="deleteTaskButton ui-btn-up-d">');
        newButton.text('Delete');
        newButton.on('click', function() {
            deleteTaskListItem(taskItem);
            return false;
        });
        var newContainer = $('<span class="taskDeleteButtonContainer">');
        newContainer.css('right', '-130px');
        newContainer.append(newButton);
        taskItem.append(newContainer);

        newContainer.animate({ right: '0' }, 250, 'linear', function () {
            $(document).on('click', function() {
                removeTaskDeleteButton();
                resetSpinnableDeleteButton($('#taskList .spinnableDeleteButton.clicked'));
            });
        });
    };
    
    var createTaskListItem = function (task) {
        
        var selectLinkElement = $('<a>');

        selectLinkElement.append('<a href="#" class="spinnableDeleteButton" data-role="none"><img data-role="none" class="spinnableDeleteIcon" src="images/delete-icon.png"/></a>');
        selectLinkElement.append('<span class="taskName">' + task.getName() + '<span class="textFadeOut"></span>');

        var durationElement = $('<span>');
        durationElement.attr('class', 'ui-li-count duration');
        durationElement.attr('style', 'font-size:11px;');
        durationElement.html(buildDurationHtml(task.getTotalDurationMs()));
        
        selectLinkElement.append(durationElement);
        selectLinkElement.on('vclick', function () {
            if (deleteButtonIsPresent()) {
                removeTaskDeleteButton();
            } else {
                activateTaskListItem($(this).parents('li'));
            }
        });
               
        var taskElement = $('<li>');
        taskElement.attr('data-task-id', task.getId());
        taskElement.append(selectLinkElement);

        var detailsLinkElement = $('<a href="#editTaskDialog" class="ui-icon-alt">Edit Task</a>');
        detailsLinkElement.on('click', function () {
            $('#editTaskDialog').attr('data-task-id', task.getId());
            $.mobile.changePage('#editTaskDialog', {
                transition: "slide"
            });
        });
        taskElement.append(detailsLinkElement);

        return taskElement;
    };

    var addNewTask = function (name) {
        uiDurationUpdateEnabled = false;
        
        var task = model.addTask(name);
        model.saveToLocalStorage();
        
        var newItem = createTaskListItem(task);
        
        var taskList = $('#taskList');
        taskList.append(newItem);
        taskList.listview('refresh');

        activateTaskListItem(newItem);
        updateEditTasksButtonVisibility();
        updateEmptyTaskListBannerVisibility();
        
        uiDurationUpdateEnabled = true;
    };
   
    var refreshActiveTaskDurationDisplayFromModel = function () {
        // This method executes every second - it must be efficient
        if (!uiDurationUpdateEnabled) return;

        if ($('#tasksPage').is(':visible')) {
            if (activeItemCache.task != null && activeItemCache.durationElement != null) {
                var taskDurationMs = activeItemCache.task.getTotalDurationMs();

                activeItemCache.durationElement.html(buildDurationHtml(taskDurationMs));
            }
        }
        if ($('#editTaskDialog').is(':visible')) {
            var isActiveTask = activeItemCache.task != null && $('#editTaskDialog').attr('data-task-id') == activeItemCache.task.getId();

            if (isActiveTask) {
                var activePeriods = activeItemCache.task.getActivePeriods();
                if (activePeriods.length > 0 && activePeriods[0].getEndDate() == null) {
                    var updatedListItem = buildPeriodListItem(activePeriods[0]);
                    var periodsList = $('#durationPeriods');
                    periodsList.find('li.activePeriod').replaceWith(updatedListItem);
                    periodsList.listview('refresh');
                }
            }
        }
    };
    
    var refreshAllTasksFromModel = function () {
        uiDurationUpdateEnabled = false;
        var allTasks = model.getAllTasks();
        var activeTask = model.getActiveTask();
        
        var taskList = $('#taskList');
        taskList.empty();
        allTasks.forEach(function (task) {
            var taskItem = createTaskListItem(task);
            taskList.append(taskItem);
            
            if (task == activeTask) {
                setItemStyleToActive(taskItem);
                activeItemCache.task = task;
                activeItemCache.durationElement = taskItem.find('.duration');
            }
        });
        
        taskList.listview('refresh');
        scrollToActiveTaskItem();
        uiDurationUpdateEnabled = true;
    };

    var updateEmptyTaskListBannerVisibility = function () {
        var banner = $('#tasksPage .emptyTaskListBanner');
        var content = $('#tasksPage .ui-content');
        var allTasks = model.getAllTasks();
        if (allTasks.length != 0) {
            banner.hide();
            content.show();
        } else {
            content.fadeOut(400, function() {
                banner.fadeIn();
            });
        }
    };
    
    var updateEditTasksButtonVisibility = function () {
        var allTasks = model.getAllTasks();
        if (allTasks.length == 0) {
            exitEditMode();
            $('#editAllTasksButton').hide();
        } else {
            $('#editAllTasksButton').show();
        }
    };

    var rotate = function(icon, newAngleDegs) {
        icon.animate({ textIndent: newAngleDegs }, {
            step: function (now) {
                icon.css('-webkit-transform', 'rotate(' + now + 'deg)');
            },
            duration: 250
        }, 'linear');
    };

    var spinSpinnableDeleteButton = function (button) {
        var others = $('#taskList .spinnableDeleteButton.clicked');
        if (others.length == 0) {
            rotate(button.find('.spinnableDeleteIcon'), 90);
            showTaskDeleteButton(button.parents('li'));
            button.addClass('clicked');
        } else {
            resetSpinnableDeleteButton(others);
        }
    };
    var resetSpinnableDeleteButton = function (button) {
        rotate(button.find('.spinnableDeleteIcon'), 0);
        removeTaskDeleteButton();
        button.removeClass('clicked');
    };
    var spinnableDeleteButtonClickHandler = function() {
        var button = $(this);
        if (!button.hasClass('clicked')) {
            spinSpinnableDeleteButton(button);
        } else {
            resetSpinnableDeleteButton(button);
        }
        event.stopPropagation();
    };

    var switchTheme = function(button, newTheme) {
        var currentTheme = button.attr('data-theme');
        if (newTheme == currentTheme)
            return;
        
        button.attr('data-theme', newTheme)
            .removeClass('ui-btn-hover-' + currentTheme)
            .removeClass('ui-btn-up-' + currentTheme)
            .addClass('ui-btn-hover-' + newTheme)
            .addClass('ui-btn-up-' + newTheme);
    };

    var enterEditMode = function() {
        editModeEnabled = true;

        var taskList = $('#taskList');
        $('#editAllTasksButton').find('.ui-btn-text').text('Done');
        switchTheme($('#editAllTasksButton'), 'b');

        taskList.find('.ui-btn-text').animate({ paddingLeft: '34px' });
        taskList.find('.spinnableDeleteButton').animate({ left: '8px' }).on('click', spinnableDeleteButtonClickHandler);
        taskList.find('.ui-li-link-alt').show().animate({ right: '0px' });
        taskList.find('.duration ').animate({ right: '52px', opacity: 0 });
    };

    var exitEditMode = function () {
        var taskList = $('#taskList');
        
        $('#editAllTasksButton').find('.ui-btn-text').text('Edit');
        switchTheme($('#editAllTasksButton'), 'c');
        taskList.find('.ui-btn-text').animate({ paddingLeft: '0px' });
        taskList.find('.spinnableDeleteButton').animate({ left: '-26px' }).off('click');
        taskList.find('.ui-li-link-alt').animate({ right: '-42px' }).hide();
        taskList.find('.duration ').animate({ right: '10px', opacity: 1 });

        editModeEnabled = false;
    };
    
    var editAllTasksButtonClickHandler = function () {
       
        if (!editModeEnabled) {
            enterEditMode();
        } else {
            exitEditMode();
        }
    };

    var tasksPageInit = function () {

        var bindButtonEvents = function () {
            $('#editAllTasksButton').on('click', editAllTasksButtonClickHandler);
        };
        
        bindButtonEvents();

        refreshAllTasksFromModel();
        
        setInterval(refreshActiveTaskDurationDisplayFromModel, 1000);
    };

    var tasksPageShow = function () {
        exitEditMode();
        scrollToActiveTaskItem();
        updateEditTasksButtonVisibility();
        updateEmptyTaskListBannerVisibility();
    };
    
    var addTaskPageInit = function () {

        var bindButtonEvents = function () {
            
            $('#addTaskSaveButton').on('click', function () {
                addNewTask($('#addTaskName').val());
            });
            
            $('#addTaskDialogForm').on('submit', function () {
                event.stopPropagation();
                event.preventDefault();
                
                addNewTask($('#addTaskName').val());
                
                $.mobile.changePage("#tasksPage", {
                    transition: "slideup",
                    reverse: true,
                    changeHash: true
                });
            });
        };

        bindButtonEvents();
    };
    
    var addTaskPageBeforeShow = function () {
        $('#addTaskName').val('');
    };

    var addTaskPageShow = function() {
        $('#addTaskName').focus();
    };

    var buildPeriodListItem = function(activePeriod) {
        var startDate = activePeriod.getStartDate();
        var endDate = activePeriod.getEndDate();
        var duration = buildDurationHtml(activePeriod.getTotalDurationMs());

        var listItem = $('<li>');
        if (endDate == null) {
            listItem.addClass('activePeriod');
        }
        listItem.append(utils.periodToHtml(startDate, endDate));
        listItem.append('<span class="duration">' + duration + '</span>');
        
        return listItem;
    };
    var refreshEditPagePeriodsList = function (task) {
        var periodsList = $('#durationPeriods');
        periodsList.empty();
        var activePeriods = task.getActivePeriods();
        activePeriods.forEach(function (activePeriod) {
            var listItem = buildPeriodListItem(activePeriod);
            periodsList.append(listItem);
        });

        periodsList.listview('refresh');
        
        if (activePeriods.length == 0) {
            $('#clearTaskTimesButton').parent().hide();
        } else {
            $('#clearTaskTimesButton').parent().show();
        }
    };

    var showClearPeriodsConfirmationDialog = function () {

        var confirmation = $('#clearTaskPeriodsConfirmation');
        confirmation.css('position', 'fixed');
        confirmation.css('left', '0');
        confirmation.css('right', '100%');
        confirmation.css('bottom', -confirmation.height() + 'px');
        confirmation.show();

        var veil = $('<div id="fullPageVeil">');
        veil.css('opacity', 0);
        veil.css('z-index', '80');
        $('body').append(veil);
        veil.animate({ opacity: 0.6 }, 500, function () {
        });
        
        confirmation.animate({ bottom: '0px' }, 500, function () {
        });
    };

    var hideClearPeriodsConfirmationDialog = function(onComplete) {
        var confirmation = $('#clearTaskPeriodsConfirmation');
        confirmation.animate({ bottom: -confirmation.height() + 'px' }, 500, function () {
            confirmation.hide();
        });
        $('#fullPageVeil').animate({ opacity: 0 }, 500, function () {
            $(this).remove();
            onComplete();
        });
    };

    var getEditingTask = function () {
        var taskId = $('#editTaskDialog').attr('data-task-id');
        return model.getTaskById(taskId);
    };
    
    var clearPeriodsConfirmButtonClickHandler = function () {
        hideClearPeriodsConfirmationDialog(function () {

            $('#durationPeriods li').animate({ opacity: 0, height:0 }, function() {
                var task = getEditingTask();

                task.clearPeriods();
                model.saveToLocalStorage();

                refreshEditPagePeriodsList(task);
            });
        });
        return false;
    };
    
    var clearPeriodsCancelButtonClickHandler = function () {
        hideClearPeriodsConfirmationDialog(function (){});

        return false;
    };

    var editTaskPageInit = function () {
        
        $('#clearTaskTimesButton').on('click', function () {
            showClearPeriodsConfirmationDialog();

            // For some reason, the active state of the Clear button remains. Clear it by hand
            $("#clearTaskTimesButton").parents('.ui-btn').removeClass('ui-btn-active');
            return false;
        });
               
        var saveTaskAndReturn = function() {
            var task = getEditingTask();
            task.setName($('#editTaskName').val());
            model.saveToLocalStorage();
            refreshAllTasksFromModel();
            $.mobile.changePage('#tasksPage', {
                transition: 'slide',
                reverse: true,
                changeHash: true
            });
        };
        $('#editTaskSaveButton').on('click', function () {
            event.preventDefault();
            saveTaskAndReturn();
        });

        $('#editTaskDialogForm').on('submit', function () {
            event.stopPropagation();
            event.preventDefault();
            saveTaskAndReturn();
        });

        $('#confirmClearTimesButton').on('click', clearPeriodsConfirmButtonClickHandler);
        $('#cancelClearTimesButton').on('click', clearPeriodsCancelButtonClickHandler);
    };
    
    var editTaskPageBeforeShow = function () {
        var taskId = $('#editTaskDialog').attr('data-task-id');
        if (taskId != null) {
            var task = model.getTaskById(taskId);

            $('#editTaskName').val(task.getName());
            refreshEditPagePeriodsList(task);
        }
        
        var confirmation = $('#clearTaskPeriodsConfirmation');
        confirmation.hide();
    };

    $(document).on('pageinit', '#tasksPage', tasksPageInit);
    $(document).on('pageshow', '#tasksPage', tasksPageShow);
    
    $(document).on('pageinit', '#addTaskDialog', addTaskPageInit);
    $(document).on('pagebeforeshow', '#addTaskDialog', addTaskPageBeforeShow);
    $(document).on('pageshow', '#addTaskDialog', addTaskPageShow);
    
    $(document).on('pageinit', '#editTaskDialog', editTaskPageInit);
    $(document).on('pagebeforeshow', '#editTaskDialog', editTaskPageBeforeShow);

    model.loadFromLocalStorage();

})($, window.taskTimer.model, window.taskTimer.utils)