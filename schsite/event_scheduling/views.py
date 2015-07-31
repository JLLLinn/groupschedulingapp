from django.shortcuts import render
from django.http import HttpResponse
# import the logging library
import logging

logger = logging.getLogger(__name__)


# Create your views here.
def index(request):
    return render(request, 'event_scheduling/index.html')


def create_date(request):
    return render(request, 'event_scheduling/create_date.html')


def add_whole_day(request):
    """
     Create a whole day event,
        1. create a user (the organizer)
        2. find or create the time slots
        3. create the event
        4. add it to the
    """
    if request.method == 'POST' and request.is_ajax():
        logger.error('Something went wrong!')
        title = request.POST['event_title']
        dates = request.POST['dates']
        print(title)
        return HttpResponse("OK")
