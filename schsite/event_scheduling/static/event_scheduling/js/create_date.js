/**
 * Created by jilin on 7/30/2015.
 */
var MAX_TITLE_LENGTH = 40;
var MIN_TITLE_LENGTH = 3;
var dates = []; //this is for saving the current dates
var mprogress = new Mprogress();
var intObj = {
    template: 3,
    parent: '#loaderDiv'// this option will insert bar HTML into this parent Element
};
var indeterminateProgress = new Mprogress(intObj);
$(function () {

    showLoader();
    init();
    endLoader();

});


function init() {
    $.material.init();
    FastClick.attach(document.body);
    $("#planALink").on("click", function () {
            window.open("http://" + location.host);
        }
    );
    initEventTitle();
    initDatePicker();
}
var initEventTitle = function () {
    var $eventTitleCreate_id = $("#eventTitleCreate");
    $eventTitleCreate_id.fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200);
    $eventTitleCreate_id.on("keyup", function () {
        checkState();
        if ($(this).val().length >= 3) {
            $(this).css("color", "#388E3C");
        }
        else {
            $(this).css("color", "#f44336");
        }
    });
};

function initDatePicker() {
    var d = new Date();
    //datepicker modified so it doesn't close on clicking outside (mousedown)
    $("#datepicker").datepicker({
        language: "zh-CN",
        multidate: true,
        todayHighlight: true,
        startDate: d,
        autoclose: false,
    }).click(function (e) {
        e.stopPropagation(); // <--- here
    }).on("changeDate", function (e) {
        dates = e.dates;
        //updateDatesCount(e.dates); //THis could possibly be disabled
        checkState();
    });
}
function showLoader() {
    indeterminateProgress.start();
}

function endLoader() {
    indeterminateProgress.end();
}
function updateDatesCount(dates) {
    if (dates.length > 0) {
        $("#dateCount").text("选择了 " + dates.length + " 天");
        $("#pickerHeader").css("backgroundColor", "#4caf50");
    } else {
        $("#dateCount").text("尚未选择");
        $("#pickerHeader").css("backgroundColor", "#f44336");

    }
}

function checkState() {
    var titleProblems = false;
    var dateProblems = false;
    var message = "";
    if (dates.length <= 0) {
        message = "▼ 选择天数";
        dateProblems = true;
    } else {
        var title_length = $("#eventTitleCreate").val().length;
        if (title_length == 0) {
            message = "▲ 取个名字";
            titleProblems = true;
        }
        else if (title_length < MIN_TITLE_LENGTH) {
            message = "▲ 名字有点儿短。。";
            titleProblems = true;
        }
        else if (title_length >= MAX_TITLE_LENGTH) {
            message = "▲ 名字太长了。。";
            titleProblems = true;
        }
    }
    var allDoneCreate_id = $("#allDoneCreate");
    if ((titleProblems) || (dateProblems)) {
        $("#whatToDo").text(message);
        allDoneCreate_id.prop("disabled", true);
    } else if ((!titleProblems) && (!dateProblems)) {
        // $("#whatToDo").html("&#9654; Tap next when done");
        $("#whatToDo").text("选择了 "+dates.length + " 天");
        //$("#whatToDo").hide();
        //$("#eventUrl").show();
        allDoneCreate_id.prop("disabled", false);
        allDoneCreate_id.off();
        allDoneCreate_id.on("click", function () {
            //doSave(plan_id);
            //$("#eventUrl").show();
            //  $(this).hide();
            //  $("#whatToDo").hide();
        });
        //doSave(plan_id);
    }
    //else {
    //    $("#whatToDo").show();
    //    //  $("#eventUrl").hide();
    //}
}
//function localStorageInit() {
//    getNewData();
//    //TODO, get a new user id and event id and save here
//}

//function getNewData() {
//    $.getJSON("/new", function (data) {
//        if (data.user_id) {
//            localStorage.setItem("planAuserId", data.user_id);
//            var plans = [];
//            plans[0] = data.plan_id;
//            localStorage.setItem("planAplans", JSON.stringify(plans));
//            initPlan(data.plan_id);
//        }
//    });
//}