/**
 * Created by jiaxinlin on 8/2/15.
 */
var STATE_MODE_NEW_USER = 0;
var STATE_MODE_RETURN_NORMAL_USER = 1;
var STATE_MODE_NEW_USER_NO_STORAGE = 2;
var STATE_MODE_USER_UNDEFINED = -1;
var MIN_CELL_WIDTH = 50;
var moment_dates = [];
var state = {
    mode: STATE_MODE_USER_UNDEFINED
}

var indeterminateProgress;
$(function () {
    indeterminateProgress = new Mprogress({
        template: 3,
        parent: '#loaderDiv'// this option will insert bar HTML into this parent Element
    });
    showLoader();
    init();

});


function init() {
    initMoment();
    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    $("#eventTitle").html(event_name);
    document.title = event_name + " | " + document.title;
    initLocalStorage();
    initDatesLayout();

}
function initMoment() {
    moment.locale('zh-cn');
    $.each(dates, function (index, date) {
        moment_dates.push(moment(date['date'], "YYYY/MM/DD"));
    });
}
function initLocalStorage() {
    if (typeof(Storage) !== "undefined") {
        var eut_hid = localStorage.getItem(event_hid);
        if (eut_hid != null) {
            //not null key - existing user - need to build their checkboxes
            state.eut_hid = eut_hid;
            state.mode = "STATE_MODE_RETURN_NORMAL_USER";
        }
        else {
            state.mode = "STATE_MODE_NEW_USER";
        }
    } else {
        // Sorry! No Web Storage support..
        alert("Sorry, unsupported browser, no local storage");
        state.mode = "STATE_MODE_NEW_USER_NO_STORAGE";
    }
}
function initDatesLayout() {
    $("#firstMonth").html(moment_dates[0].format("MMMM") + "<br/>" + moment_dates[0].format("YYYY"));
    var cols = "";
    var colCount = moment_dates.length;
    var i;
    for (i = 0; i < colCount; i++) {
        cols += "<col>";
        if (i > 0) {
            if (moment_dates[i].month() != moment_dates[i - 1].month()) {
                //new month
                cols += "<col>";

            }

        }
    }
    $("#rightDates").prepend(cols);
    for (i = 0; i < moment_dates.length; i++) {
        //add month header seperator

        if (i > 0) {
            if (moment_dates[i].month() != moment_dates[i - 1].month()) {
                //new month
                var newMonth = moment_dates[i].format("MMMM") + "<br/>" + moment_dates[i].format("YYYY");
                $("#dateInserter").append("<td class='monthSeperator'>" + newMonth + "</td>");
            }

        }
        var ms = moment_dates[i].format("ddd") + "<br/>" + moment_dates[i].format("Do");
        $("#dateInserter").append("<td>" + ms + "</td>");
    }

    var tr = "<tr>";

    for (i = 0; i < moment_dates.length; i++) {
        //add seperator
        if (i > 0) {
            if (moment_dates[i].month() != moment_dates[i - 1].month()) {
                //new month
                //  var newMonth = moment(vals.pdates[i]).format("MMM") + "<br/>" + moment(vals.pdates[i]).format("YY");
                tr += "<td class='monthSeperator'></td>";
            }
        }
        tr += "<td style='text-align:center;' class='tdDate thisUserCheck' id='tdWithCheckdate_" + i + "'><div class='checkbox'><label><input type='checkbox' class='datesCheck' dateNumber='" + i + "'/></label></div></td>";
    }
    tr += "</tr>";
    $("#rightDates").append(tr);


    var tdWidth = $(".tdDate").last().width();
    if (tdWidth < MIN_CELL_WIDTH) {
        $("#rightScroller").css("width", "100%");
        $("#rightScroller").css("overflow-x", "scroll");

        var newWidther =moment_dates.length * MIN_CELL_WIDTH;
        $("#rightDates").css("width", newWidther + "px");
    }

}

function showLoader() {
    indeterminateProgress.start();
}

function endLoader() {
    indeterminateProgress.end();
}