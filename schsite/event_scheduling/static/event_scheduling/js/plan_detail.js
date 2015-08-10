/**
 * Created by jiaxinlin on 8/2/15.
 */
var STATE_MODE_NEW_USER = 0;
var STATE_MODE_RETURN_NORMAL_USER = 1;
var STATE_MODE_NEW_USER_NO_STORAGE = 2;
var STATE_MODE_USER_UNDEFINED = -1;

var STATUS_EDIT = 0;
var STATUS_ALL_DONE = 1;
var STATUS_CANT_GO = 2;


var moment_dates = [];

var euts_global = [];
var state = {
    mode: STATE_MODE_USER_UNDEFINED,
    yourName: "",
    yesDates: []
};

var determinateProgress;
$(function () {
    determinateProgress = new Mprogress({
        template: 1,
        parent: '#loaderDiv'// this option will insert bar HTML into this parent Element
    });
    showLoader();
    init();

});


function init() {
    FastClick.attach(document.body);
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
    initEuts();

}
/*
 Try to render the UI based on the status code given
 Return true if successful, else false
 */
function tryRenderStatus(status_code) {
    var cantGo = $("#cantGo");
    var edit = $("#edit");
    var done = $("#allDone");
    var yourName = $("#yourName");
    var whatToDo = $("#whatToDo");
    edit.hide();
    cantGo.hide();
    done.hide();
    whatToDo.hide();
    //yourNameDisable(yourName);
    whatToDoManagement();
    var ret = false;
    switch (status_code) {
        case STATUS_EDIT:
            showChecks();
            if (state.yesDates.length == 0) {
                cantGo.show();
            } else {
                done.show();
            }
            yourNameEnable(yourName);
            ret = true;
            break;
        case STATUS_CANT_GO:
            if (state.yourName.length >= MIN_NAME_LENGTH) {
                whatToDo.hide();//because it will show up there to ask you add days
                edit.show();
                hideChecks();
                yourNameDisable(yourName);
                ret = true;
            } else {
                cantGo.show();
                blinkSomething(whatToDo);
                ret = false;

            }
            break;
        case STATUS_ALL_DONE:
            if (state.yourName.length >= MIN_NAME_LENGTH) {
                edit.show();
                hideChecks();
                yourNameDisable(yourName);
                ret = true;
            } else {
                done.show();
                blinkSomething(whatToDo);
                ret = false;
            }

            break;
        default:
            console.error("Unrecognized status_code");
            ret = false;
            break;
    }
    return ret;
}

function hideChecks() {
    $(".checkbox").hide();
    $(".thisUserCheck").each(function () {
        if (!$(this).hasClass("tdDateChecked")) {
            $(this).addClass("tdDateNo");
        }
    });
    renderIcons();
}
function renderIcons() {
    var yesIcon = "<i class='mdi-action-done selfIcons tdIcon'></i>";
    var noIcon = "<i class='mdi-content-clear selfIcons tdIcon'></i>";
    $(".thisUserCheck").each(function () {
        if ($(this).hasClass("tdDateNo")) {
            $(this).append(noIcon);
        }
        else {
            $(this).append(yesIcon);
        }
    });
}

function showChecks() {
    $(".checkbox").show();
    $(".selfIcons").hide();
}
function yourNameDisable(yourName) {
    yourName.prop("readOnly", true);
    yourName.css("borderWidth", "0px");
}

function yourNameEnable(yourName) {
    yourName.prop("readOnly", false);
    yourName.css("borderWidth", "0px 0px 1px 0px");
}


function initSelfRow(self_euts) {
    $(".thisUserCheck").addClass("tdDateNo");
    if (self_euts.length > 0) {
        state.mode = STATE_MODE_RETURN_NORMAL_USER;
        var self_eut = self_euts[0];
        state.yourName = self_eut['display_user_name'];
        state.yesDates = self_eut['timeslots_id'];
        state.is_organizer = self_eut['is_organizer'];
        nameUpdate($("#yourName"));
        var self_eut_timeslots_ids = self_eut['timeslots_id'];
        for (var i = 0; i < self_eut_timeslots_ids.length; i++) {
            $(".datesCheck[dateNumber=" + self_eut_timeslots_ids[i] + "]").prop("checked", true);
            var $td = $("#tdWithCheckdate_" + self_eut_timeslots_ids[i]);
            $td.removeClass("tdDateNo");
            $td.addClass("tdDateChecked");
        }
    } else {
        state.mode = STATE_MODE_NEW_USER;
    }
}
function initUIHandlers() {
    $("#yourName").on("input paste", function () {
        console.log("input paste");
        whatToDoManagement();
        state.yourName = $(this).val();
        nameUpdate($(this));
    });

    $("#edit").on("click", function () {
        tryRenderStatus(STATUS_EDIT);

    });
    $("#shareLink").on("click", function () {
        prompt("复制链接八～", window.location.href);
    });
    $("#allDone").on("click", function () {
        if (tryRenderStatus(STATUS_ALL_DONE)) {
            submitSelfStateToServer();
        }


    });
    $("#cantGo").on("click", function () {
        if (tryRenderStatus(STATUS_CANT_GO)) {
            submitSelfStateToServer();
        }
    });
    $(".datesCheck").on("click", function () {
        var $td = $("#tdWithCheckdate_" + $(this).attr("dateNumber"));
        if (!$(this).is(":checked")) {
            $td.removeClass("tdDateChecked");
            $td.addClass("tdDateNo");
        } else {
            $td.addClass("tdDateChecked");
            $td.removeClass("tdDateNo");
        }
        calcWinner();
        collateChecks();
        //console.log(state.yesDates);
        whatToDoManagement();
        tryRenderStatus(STATUS_EDIT);
    });
    $(".mdi-action-delete").on('click', function () {
        $('#myModal').modal('show');
    });
    $("#planALink").on("click", function () {
        window.open("http://" + location.host);
    });

}

function submitSelfStateToServer() {
    //fetch the eut_hid from the self_eut
    showLoader();
    var obj = {
        'timeslots': JSON.stringify(state.yesDates),
        'display_user_name': state.yourName,
        'event_hid': event_hid
    };
    if ((state.mode == STATE_MODE_NEW_USER) || (state.mode == STATE_MODE_NEW_USER_NO_STORAGE)) {
        //create a new user
        obj['is_organizer'] = false;
    } else if (state.mode == STATE_MODE_RETURN_NORMAL_USER) {
        //update an existing user
        obj['eut_hid'] = state.eut_hid;
        obj['is_organizer'] = state.is_organizer;
    } else if (state.mode == STATE_MODE_USER_UNDEFINED) {
        console.log("undefined state, do not post");
        return;
    } else {
        console.error("Unrecognized state, do not post");
        return;
    }
    console.log(obj);
    $.post(save_eut_url, obj, function (response) {
        alert("submitting to save");
        console.log(response);
        if (state.mode == STATE_MODE_NEW_USER) {
            localStorage.setItem(event_hid, response);
            state.eut_hid = response;
            state.mode = STATE_MODE_RETURN_NORMAL_USER;
        }
        endLoader();
    });

}

/*
 This function runs through the self row and set the yesDates
 */
function collateChecks() {
    state.yesDates = [];
    $(".datesCheck:checked").each(function () {
            state.yesDates.push($(this).attr("dateNumber"));
        }
    );

}

function nameUpdate(nameEl) {
    if (state.yourName.length >= MIN_NAME_LENGTH) {
        if (nameEl.val() == "") {
            nameEl.val(state.yourName);
        }
        nameEl.css("borderColor", "#2e7b32");
        nameEl.css("color", "rgba(0,0,0,.87)");
    }
    else {
        nameEl.css("borderColor", "#f44336");
        nameEl.css("color", "rgba(0,0,0,.38)");
    }

    whatToDoManagement();
}
function initOthersRows(eut) {
    var username_span = "<span class='username-span'><i class='mdi-social-person-outline' style='opacity: .54;font-size: 1em;'></i> " + eut['display_user_name'] + "</span>";
    var delete_btn_span = "<span class='delete-btn-span text-center'><i class='mdi-action-delete'></i></span>";
    $("#leftNames").append("<tr><td class='names'>" + username_span + delete_btn_span + "</td></tr>");
    var tr = "<tr id='_tritem'>";
    for (i = 0; i < moment_dates.length; i++) {
        if (i > 0) {
            if (moment_dates[i].month() != moment_dates[i - 1].month()) {
                //new month
                //  var newMonth = moment(vals.pdates[i]).format("MMM") + "<br/>" + moment(vals.pdates[i]).format("YY");
                tr += "<td class='monthSeperator'></td>";
            }

        }
        var yesdate = "";
        var icon = "";
        if (eut['timeslots_id'].indexOf(dates[i]['timeslot_key']) > -1) {
            yesdate = "tdDateChecked";
            icon = "mdi-action-done";
        } else {
            yesdate = "tdDateNo";
            icon = "mdi-content-clear";
        }

        tr += "<td style='text-align:center;' class='tdDate " + yesdate + "' id='tddate_" + dates[i]['timeslot_key'] + "'><i class='" + icon + " tdIcon'></i></td>";
    }
    tr += "</tr>";
    $("#rightDates").append(tr);
}

/*function collateChecks() {
 state.yesDates = [];
 $(".datesCheck").each(function (i) {
 $("#tdWithCheckdate_" + $(this).attr("dateNumber")).removeClass("tdDateChecked");
 //    console.log(    $("#tdWithCheckdate_" + $(this).attr("dateNumber")).addClass("tdDateNo"));
 }
 );
 $(".datesCheck:checked").each(function (i) {
 state.yesDates.push($(this).attr("dateNumber"));
 $("#tdWithCheckdate_" + $(this).attr("dateNumber")).addClass("tdDateChecked");
 }
 );

 }*/
function calcWinner() {
    //$('#rightDates').velocity("fadeOut", {duration: 100});
    var trScores = [];
    $("#rightDates").find('tr').each(function (i, el) {

            var thisTRScore = [];
            var $tds = $(this).find('td');
            $tds.each(function (o, el) {
                    if ($(this).hasClass("tdDateChecked")) {
                        thisTRScore.push(1);
                    }
                    else if ($(this).hasClass("monthSeperator")) {
                        thisTRScore.push(-1);
                    } else {
                        thisTRScore.push(0);
                    }
                }
            );
            var thisTr = {
                trId: i,
                scores: thisTRScore
            };
            trScores.push(thisTr);

        }
    );
    trScores.shift();
    //console.log(trScores);

    var wCount = [];

    for (z = 0; z < trScores[0].scores.length; z++) {

        var thistickcount = 0;
        for (i = 0; i < trScores.length; i++) {
            thistickcount += trScores[i].scores[z];
        }

        wCount.push(thistickcount);

    }

    var maxIndexes = arrayAllMaxIndexes(wCount);

    $("col").removeClass("highestCol");
    for (u = 0; u < maxIndexes.length; u++) {
        //console.log(maxIndexes[u]);
        var x = maxIndexes[u] + 1;
        //console.log(x);
        var $highestCol = $("col:nth-child(" + x + ")");
        $highestCol.addClass("highestCol");
    }
    $('#rightDates').velocity("fadeIn", {duration: 200});
    //console.log(wCount);
}

function getAllIndexes(arr, val) {
    var indexes = []
        , i = -1;
    while ((i = arr.indexOf(val, i + 1)) != -1) {
        indexes.push(i);
    }
    return indexes;
}

function arrayAllMaxIndexes(array) {
    return getAllIndexes(array, Math.max.apply(null, array));
}


function initEutRows(euts) {
    initSelfRow(euts['self_euts']);

    $.each(euts['organizer_euts'], function (index, organizer_eut) {
        initOthersRows(organizer_eut);
    });
    $.each(euts['normal_euts'], function (index, normal_eut) {
        initOthersRows(normal_eut);
    });
}
function initEuts() {
    var obj = {};
    if (state.mode == STATE_MODE_RETURN_NORMAL_USER) {
        obj['eut_hid'] = state.eut_hid;
    }
    $.post(get_eut_url, obj, function (euts) {
        euts_global = euts;
        initEutRows(euts);
        $.material.init();
        initUIHandlers();
        tryRenderStatus(STATUS_CANT_GO);//Instead of all done status, this is actually only for not showing the whattodo reminder
        calcWinner();
        endLoader();
    }, 'json')
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
            state.mode = STATE_MODE_RETURN_NORMAL_USER;
        }
        else {
            state.mode = STATE_MODE_NEW_USER;
        }
    } else {
        // Sorry! No Web Storage support..
        alert("Sorry, unsupported browser, no local storage");
        state.mode = STATE_MODE_NEW_USER_NO_STORAGE;
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
    var $rightDates = $("#rightDates");
    $rightDates.prepend(cols);
    for (i = 0; i < moment_dates.length; i++) {
        //add month header seperator
        var $dateInserter = $("#dateInserter");
        if (i > 0) {
            if (moment_dates[i].month() != moment_dates[i - 1].month()) {
                //new month
                var newMonth = moment_dates[i].format("MMMM") + "<br/>" + moment_dates[i].format("YYYY");
                $dateInserter.append("<td class='monthSeperator'>" + newMonth + "</td>");
            }

        }
        var ms = moment_dates[i].format("ddd") + "<br/>" + moment_dates[i].format("Do");
        $dateInserter.append("<td>" + ms + "</td>");
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
        tr += "<td style='text-align:center;' class='tdDate thisUserCheck' id='tdWithCheckdate_" + dates[i]['timeslot_key'] + "'><div class='checkbox'><label><input type='checkbox' class='datesCheck' dateNumber='" + dates[i]['timeslot_key'] + "'/></label></div></td>";
    }
    tr += "</tr>";
    $rightDates.append(tr);


    var tdWidth = $(".tdDate").last().width();
    console.log("tdWidth:" + tdWidth);
    /*if (tdWidth < (MIN_CELL_WIDTH+20)) {
     console.log("Stretch Mode");
     var $rightScroller = $("#rightScroller");
     $rightScroller.css("width", "100%");
     $rightScroller.css("overflow-x", "scroll");

     var newWidther = moment_dates.length * (MIN_CELL_WIDTH+20);
     $rightDates.css("width", newWidther + "px");
     }*/
    if (tdWidth <= MIN_CELL_WIDTH) {
        console.log("Stretch Mode");
        //should show indicator here
        var $rightScroller = $("#rightScroller");
        $rightScroller.css("width", "100%");
        $rightScroller.css("overflow-x", "scroll");
    }

}
function whatToDoManagement() {
    var whatToDo = $("#whatToDo");
    if (state.yourName.length == 0) {
        whatToDo.text("▼ 输入名字");
        whatToDo.show();
    } else if (!(state.yourName.length >= MIN_NAME_LENGTH)) {
        whatToDo.text("▼ 名字长度需要大于 " + MIN_NAME_LENGTH.toString());
        whatToDo.show();
    } else if (state.yesDates.length == 0) {
        whatToDo.text("▼ 选择日期或选择不能去");
        whatToDo.show();
    } else {
        whatToDo.hide();
    }
}
function showLoader() {
    determinateProgress.start();
    determinateProgress.set(0.7);
}

function endLoader() {
    determinateProgress.end();
}

function blinkSomething($el) {
    $el.velocity("fadeIn", {duration: 200}).velocity("fadeOut", {duration: 200}).velocity("fadeIn", {duration: 200}).velocity("fadeOut", {duration: 200}).velocity("fadeIn", {duration: 200});
}