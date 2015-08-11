var mail_sent = false;
var determinateProgress;
$(function () {
    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    determinateProgress = new Mprogress({
        template: 1,
        parent: '#loaderDiv'// this option will insert bar HTML into this parent Element
    });
    $("#send-suggestion-email-btn").on('click', function () {
        $("#myModal").modal('show');
    });
    $("#confirm-btn").on("click", function () {

        if (!mail_sent) {
            showLoader();
            $.post(SEND_EMAIL_URL, {"content": $("#suggestion-text").val()}, function (response) {
                mail_sent = true;
                console.log(response);
                endLoader();
                $("#myModal").modal('hide');
                $.snackbar({content: "感谢您的留言：）"});
            });
        } else {
            $.snackbar({content: "发送的有点儿太多了。。"});
        }
    });
});
function showLoader() {
    determinateProgress.start();
    determinateProgress.set(0.7);
}

function endLoader() {
    determinateProgress.end();
}
