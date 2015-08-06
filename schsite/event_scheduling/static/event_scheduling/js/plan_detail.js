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

var MIN_NAME_LENGTH = 3;
var MIN_CELL_WIDTH = 50;
var moment_dates = [];

var euts_global = [];
var state = {
    mode: STATE_MODE_USER_UNDEFINED,
    yourName: "",
    yesDates: []
}

var indeterminateProgress;
$(function () {
    indeterminateProgress = new Mprogress({
        template: 3,
        parent: '#loaderDiv'// this option will insert bar HTML into this parent Element
    });
    //showLoader();
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
    initEuts();

}

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

    switch (status_code) {
        case STATUS_EDIT:
            showChecks();
            if (state.yesDates.length == 0) {
                cantGo.show();
            } else {
                done.show();
            }
            yourNameEnable(yourName);
            break;
        case STATUS_CANT_GO:
            if (state.yourName.length >= MIN_NAME_LENGTH) {
                edit.show();
                hideChecks();
                yourNameDisable(yourName);
            } else {
                cantGo.show();
                $("#whatToDo").fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200);

            }
            break;
        case STATUS_ALL_DONE:
            if (state.yourName.length >= MIN_NAME_LENGTH) {
                edit.show();
                hideChecks();
                yourNameDisable(yourName);
            } else {
                done.show();
                $("#whatToDo").fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200);

            }

            break;
        default:
            console.error("Unrecognized status_code");
            break;
    }
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
    $(".thisUserCheck").each(function (i) {
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
        self_eut = self_euts[0];
        state.yourName = self_eut['display_user_name'];
        state.yesDates = self_eut['timeslots_id'];
        nameUpdate($("#yourName"));
        if (state.mode == STATE_MODE_RETURN_NORMAL_USER) {
            var self_eut_timeslots_ids = self_eut['timeslots_id'];
            for (i = 0; i < self_eut_timeslots_ids.length; i++) {
                $(".datesCheck[dateNumber=" + self_eut_timeslots_ids[i] + "]").prop("checked", true);
                $("#tdWithCheckdate_" + self_eut_timeslots_ids[i]).removeClass("tdDateNo");
                $("#tdWithCheckdate_" + self_eut_timeslots_ids[i]).addClass("tdDateChecked");
            }
        }
    } else {
        state.mode = STATE_MODE_NEW_USER;
    }
}
function initUIHandlers() {
    $("#yourName").on("keyup", function () {
        whatToDoManagement();
        state.yourName = $(this).val();
        nameUpdate($(this));
    });
    $("#edit").on("click", function () {
        tryRenderStatus(STATUS_EDIT);
    });
    $("#shareLink").on("click", function () {
        prompt("Copy the link!", window.location.href);
    });
    $("#allDone").on("click", function () {
        tryRenderStatus(STATUS_ALL_DONE);
    });
    $("#cantGo").on("click", function () {
        tryRenderStatus(STATUS_CANT_GO);
    });
    $(".datesCheck").on("click", function () {
        if (!$(this).is(":checked")) {
            $("#tdWithCheckdate_" + $(this).attr("dateNumber")).removeClass("tdDateChecked");
            $("#tdWithCheckdate_" + $(this).attr("dateNumber")).addClass("tdDateNo");
        } else {
            $("#tdWithCheckdate_" + $(this).attr("dateNumber")).addClass("tdDateChecked");
            $("#tdWithCheckdate_" + $(this).attr("dateNumber")).removeClass("tdDateNo");
        }
        calcWinner();
        collateChecks();
        //console.log(state.yesDates);
        whatToDoManagement();
        tryRenderStatus(STATUS_EDIT);
    });
    $("#planALink").on("click", function () {
        window.open("http://" + location.host);
    });
}
/*
 This function runs through the self row and set the yesDates
 */
function collateChecks() {
    state.yesDates = [];
    $(".datesCheck:checked").each(function (i) {
            state.yesDates.push($(this).attr("dateNumber"));
        }
    );

}

function nameUpdate(nameEl) {
    if (state.yourName.length >= MIN_NAME_LENGTH) {
        if (nameEl.val() == "") {
            nameEl.val(state.yourName);
        }
        nameEl.css("borderColor", "green");
    }
    else {
        nameEl.css("borderColor", "red");
    }

    whatToDoManagement();
}
function initOthersRows(eut) {
    $("#leftNames").append("<tr><td id='_name'  style='color:black'>" + eut['display_user_name'] + "</td></trd>");
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
    calcWinner();
}

function collateChecks() {
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

}
function calcWinner() {
    var trScores = [];
    $("#rightDates").find('tr').each(function (i, el) {

            var thisTRScore = [];
            var $tds = $(this).find('td');
            $tds.each(function (o, el) {
                    if ($(this).hasClass("tdDateChecked")) {
                        thisTRScore.push(1);
                    }
                    else {
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
    console.log(trScores);

    var wCount = [];

    for (z = 0; z < trScores[0].scores.length; z++) {

        var thistickcount = 0;
        for (i = 0; i < trScores.length; i++) {
            thistickcount += trScores[i].scores[z];
        }

        wCount.push(thistickcount);

    }

    var i = wCount.indexOf(Math.max.apply(Math, wCount));

    var maxIndexes = arrayAllMaxIndexes(wCount);

    $("col").removeClass("highestCol");
    for (u = 0; u < maxIndexes.length; u++) {
        console.log(maxIndexes[u]);
        var x = maxIndexes[u] + 1;
        console.log(x);
        var $highestCol = $("col:nth-child(" + x + ")");
        $highestCol.addClass("highestCol");
    }
    console.log(wCount);
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
        tryRenderStatus(STATUS_EDIT);
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
        tr += "<td style='text-align:center;' class='tdDate thisUserCheck' id='tdWithCheckdate_" + dates[i]['timeslot_key'] + "'><div class='checkbox'><label><input type='checkbox' class='datesCheck' dateNumber='" + dates[i]['timeslot_key'] + "'/></label></div></td>";
    }
    tr += "</tr>";
    $rightDates.append(tr);


    var tdWidth = $(".tdDate").last().width();
    if (tdWidth < MIN_CELL_WIDTH) {
        var $rightScroller=$("#rightScroller");
        $rightScroller.css("width", "100%");
        $rightScroller.css("overflow-x", "scroll");

        var newWidther = moment_dates.length * MIN_CELL_WIDTH;
        $rightDates.css("width", newWidther + "px");
    }

}
function whatToDoManagement() {
    var whatToDo = $("#whatToDo");
    if(state.yourName.length == 0){
        whatToDo.text("▼ 输入名字");
        whatToDo.show();
    } else if (!(state.yourName.length >= MIN_NAME_LENGTH)) {
        whatToDo.text("▼ 名字长度需要大于"+MIN_NAME_LENGTH.toString());
        whatToDo.show();
    } else if (state.yesDates.length == 0) {
        whatToDo.text("▼ 选择日期或选择不能去");
        whatToDo.show();
    } else {
        whatToDo.hide();
    }
}
function showLoader() {
    indeterminateProgress.start();
}

function endLoader() {
    indeterminateProgress.end();
}