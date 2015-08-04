import datetime
import logging

from django.core.urlresolvers import reverse

from django.shortcuts import render, get_object_or_404

from django.http import Http404, JsonResponse

from event_scheduling.models import Event
from event_scheduling.utils import init_whole_day_event
from event_scheduling.hashids import Hashids

DATE_STR_SPLITTER = ","
MAX_TITLE_LENGTH = 40;
MIN_TITLE_LENGTH = 3;
SALT = "jiaxin_event_scheduling"

logger = logging.getLogger(__name__)
hashids = Hashids(salt=SALT)


# Create your views here.
def index(request):
    return render(request, 'event_scheduling/index.html')


def create_date(request):
    context_obj = {
        "DATE_STR_SPLITTER": DATE_STR_SPLITTER,
        "MAX_TITLE_LENGTH": MAX_TITLE_LENGTH,
        "MIN_TITLE_LENGTH": MIN_TITLE_LENGTH,

    }
    return render(request, 'event_scheduling/create_date.html', context_obj)


def get_plan(request, event_hid):
    event_primary_keys = hashids.decode(event_hid)
    if len(event_primary_keys) >= 1:
        event = get_object_or_404(Event, pk=event_primary_keys[0])
    return render(request, 'event_scheduling/plan_detail.html', {'event': event, 'event_hid': event_hid})


def add_whole_day(request):
    """
     Create a whole day event, handles post
        1. create a user (the organizer)
        2. find or create the time slots
        3. create the event
        4. add it to the
    """
    if request.method == 'POST' and request.is_ajax():
        title = request.POST.get('event_title', False)
        date_raw_post = request.POST.get('dates', False)
        organizer_name = request.POST.get('organizer_name', False)
        if not (title and date_raw_post and organizer_name):
            raise Http404("Oops, 这里啥都木有。。。")
            return
        date_strs = date_raw_post.split(DATE_STR_SPLITTER)
        dates = []
        for date_str in date_strs:
            dates.append(datetime.datetime.strptime(date_str, "%m/%d/%Y").date())
        event_primary_key, eventusertimeslots_primary_key = init_whole_day_event(title, dates,
                                                                                 organizer_name)
        event_hashid = hashids.encode(event_primary_key)
        eventusertimeslots_hashid = hashids.encode(eventusertimeslots_primary_key)
        response_obj = {
            'event_hashid': event_hashid,
            'eventusertimeslots_hashid': eventusertimeslots_hashid,
            'url': reverse("event_scheduling:fetch_plan", args=(event_hashid,))
        }
        return JsonResponse(response_obj)
    else:
        raise Http404("Oops, 这里啥都木有。。。")


def get_euts_for_event(request, event_hid):
    """
    This receive the post request and returns eventUserTimeslots entries accordingly
    :param request:
    :param event_hid: hashedid of events
    :return: return HTTP response, idealy JSON, of the eut entries
    """
    if request.method == 'POST' and request.is_ajax():
        event_primary_keys = hashids.decode(event_hid)
        if len(event_primary_keys) >= 1:
            event_primary_key = event_primary_keys[0]
            eut_hid = request.POST.get('eut_hid', False)
            if (eut_hid):
                # It is a returning user
                eut_primary_keys = hashids.decode(event_hid)
                if len(eut_primary_keys) >= 1:
                    eut_primary_key = eut_primary_keys[0]
                else:
                    raise Http404("Oops, smart guy/gal, your localstorage seems to be changed :)")
            else:
                # It is a new user, I will give you all the eut informations
                # TODO
                return None
        else:
            raise Http404("Oops, 这里啥都木有。。。")
    else:
        raise Http404("Oops, 这里啥都木有。。。")
