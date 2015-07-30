/**
 * Created by jilin on 7/30/2015.
 */
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
    $("#eventTitleCreate").fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200);
    $("#eventTitleCreate").focus();
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
        updateDatesCount(e.dates); //THis could possibly be disabled
        //checkState(plan_id);
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