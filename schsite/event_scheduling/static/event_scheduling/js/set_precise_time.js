/**
 * Created by jiaxinlin on 8/14/15.
 */
var self_eut_hid = false;
timepicker_setup_obj = {
    minuteStep: 15,
    template: false,
    snapToStep: true,
    defaultTime: false,
    disableFocus: true,
    disableMousewheel: true,
    explicitMode: true
};
$(function () {
    init();

});
function init() {
    FastClick.attach(document.body);
    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    $.material.init();
    initTimePickers();
    initMoments();
    initSelfEutFromStorage();
    initUIHandlers();
}
function initTimePickers() {
    $('.timepicker-input').timepicker(timepicker_setup_obj);
}

function initMoments() {
    moment.locale('zh-cn');
    $.each($('.date-str'), function (index, date_str_div) {
        var date_str = $(date_str_div).html();
        var moment_date = moment(date_str, "YYYY/MM/DD");
        var new_date_str = moment_date.calendar(null, {
            sameDay: '[今天] dddd MMMDo',
            nextDay: '[明天] dddd MMMDo',
            nextWeek: '[下]dddd MMMDo',
            lastDay: '[昨天] dddd MMMDo',
            lastWeek: '[上]dddd Do',
            sameElse: "LL"
        });
        $(date_str_div).html(new_date_str);
    })
}

function initUIHandlers() {
    $(".add-time-slot").on('click', function () {
        var $html = $('<div class=\'col-xs-6 col-md-6 col-lg-2 set-precise-time-cell form-group\'> <input type=\'text\' class=\' text-center timepicker-input form-control\' placeholder=\'输入时间\' data-hint=\'智能识别\' data-date=' + $(this).attr("data-date") + '></div>');
        $html.insertBefore($(this).parent());
        initTimePickers();
        $.material.init();
    });
    $("#submit-timeslots").on('click', function () {
        submitNewEventTimesToServer();
    })
}

function initSelfEutFromStorage() {
    if (typeof(Storage) !== "undefined") {
        self_eut_hid = localStorage.getItem(event_hid);
    }
}

function submitNewEventTimesToServer() {
    timeslot_str_arr = [];
    $(".timepicker-input").each(function () {
        var time_str = $(this).val();
        if (typeof time_str !== 'undefined' && time_str != "") {
            var date_str = $(this).attr("data-date");
            var date_time_obj = {
                "time_str": time_str,
                "date_str": date_str
            };
            timeslot_str_arr.push(date_time_obj);
        }
    });
    var post_obj = {
        "timeslot_str_json": JSON.stringify(timeslot_str_arr)
    };
    if (self_eut_hid) {
        post_obj['self_eut_hid'] = self_eut_hid;
    }
    console.log(timeslot_str_arr);
    $.post(set_times_for_precise_time_event_url, post_obj, function(response){
        console.log(response);
        alert("done");
    })

}