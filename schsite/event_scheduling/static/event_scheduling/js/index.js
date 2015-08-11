var mail_sent = false;
$(function(){
    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    $("#send-suggestion-email-btn").on('click', function(){
       $("#myModal").modal('show');
    });
    $("#confirm-btn").on("click",function(){
        $.post(SEND_EMAIL_URL, {"content":$("#suggestion-text").val()}, function(response){
            alert(response);
        });
    });
});

