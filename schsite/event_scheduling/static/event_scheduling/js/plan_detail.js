/**
 * Created by jiaxinlin on 8/2/15.
 */
var STATE_MODE_NEW_USER = 0;
var STATE_MODE_RETURN_NORMAL_USER = 1;
var STATE_MODE_USER_UNDEFINED = -1;
var state = {
    mode : STATE_MODE_USER_UNDEFINED
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
    $("#eventTitle").html(event_name);
    initLocalStorage();
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
            state.mode = "NEW_USER";
        }
    } else {
        // Sorry! No Web Storage support..
        alert("Sorry, unsupported browser");
        state.mode = "NEW_USER";
    }
}

function showLoader() {
    indeterminateProgress.start();
}

function endLoader() {
    indeterminateProgress.end();
}