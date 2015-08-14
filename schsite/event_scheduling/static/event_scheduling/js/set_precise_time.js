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
        var $html = $('<div class=\'col-xs-6 col-md-6 col-lg-2 set-precise-time-cell form-group\'> <input type=\'text\' class=\' text-center timepicker-input form-control\' placeholder=\'输入时间\' data-hint=\'智能识别\' data-day-index=' + $(this).attr("data-day-index") + '></div>');
        $html.insertBefore($(this).parent());
        initTimePickers();
        $.material.init();
    });
    $("#submit-timeslots").on('click',function(){
        //TODO
    })
}

function initSelfEutFromStorage(){
     if (typeof(Storage) !== "undefined") {
         self_eut_hid = localStorage.getItem(event_hid);
     }
}