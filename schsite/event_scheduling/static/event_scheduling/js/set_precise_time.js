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
        var new_date_str = moment_date.calendar();
        $(date_str_div).html(new_date_str);
    })
}

function initUIHandlers() {
    $(".add-time-slot").on("click", function () {
        var $html = $(" <div class='timeslot-group'>\
                        <div class='col-xs-6 col-md-6 col-lg-2 set-precise-time-cell'>\
                                <div class='input-group'>\
                                    <input type='text' class='text-center timepicker-input start-time form-control form-control-pink-A200'\
                                           placeholder='开始时间' data-hint='智能识别,空白默认全天' data-date='" + $(this).attr("data-date") + "'>\
                                    <span class='input-group-addon' style='padding:0px; padding-bottom: 15px;'>\
                                        <i class='icon-btn-connector mdi-content-remove'></i>\
                                    </span>\
                                </div>\
                        </div>\
                         <div class='col-xs-6 col-md-6 col-lg-2 set-precise-time-cell'>\
                                <div class='input-group'>\
                                    <input type='text'\
                                           class=' text-center timepicker-input end-time form-control form-control-pink-A200'\
                                           placeholder='结束时间' data-hint='智能识别,可留白''\
                                           data-date='{{ get_date_str.grouper }}' style=''>\
                                    <span class='input-group-addon' style='padding:0px; padding-bottom: 15px;'>\
                                        <i class='icon-btn mdi-content-clear delete-time-slot'></i>\
                                    </span>\
                                </div>\
                            </div>\
                            </div>");
        $html.insertBefore($(this).parent());
        initTimePickers();
        $.material.init();
    });
    $("#dates-div").on('click', '.delete-time-slot', function () {
        console.log("clicked");
        $(this).closest(".timeslot-group").velocity("fadeOut", {duration: 500}).promise().done(function () {
            $(this).remove();
        });
    });
    $("#submit-timeslots").on('click', function () {
        submitNewEventTimesToServer();
    });
    $("#dates-div").timepicker().on('changeTime.timepicker', ".timepicker-input", function (e) {
        var start_input;
        var end_input;
        if ($(this).hasClass("end-time")) {
            end_input = $(this);
            start_input = $(this).closest(".timeslot-group").find(".start-time");
        } else {
            start_input = $(this);
            end_input = $(this).closest(".timeslot-group").find(".end-time");
        }
        if (start_input.val() != "" && end_input.val() != "") {
            var start_time = moment("1992/6/30 "+start_input.val(), "YYYY/MM/DD h:mm A");
            var end_time = moment("1992/6/30 "+end_input.val(), "YYYY/MM/DD h:mm A");
            console.log(start_time);
            console.log(end_time);
            console.log(end_time - start_time);
            //if (start_time > end_time) {
            //    $.snackbar({content: "开始时间需要在结束时间之前"});
            //}
        }
        //TODO

    });
    //$(".timepicker-input").on("input paste", function () {
    //    console.log("got");
    //    if ($(this).val() == "") {
    //        console.log("blank");
    //        $(this).next(".hint").text(空白默认为全天);
    //    }
    //});

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
        if (typeof time_str !== 'undefined') {
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
    $.post(set_times_for_precise_time_event_url, post_obj, function (response) {
        window.location.href = response['url'];
    });

}