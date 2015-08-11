import datetime
import json
import logging

from django.core.urlresolvers import reverse

from django.shortcuts import render, get_object_or_404

from django.http import Http404, JsonResponse, HttpResponse

from event_scheduling.models import Event
from event_scheduling.utils import init_whole_day_event, get_euts, save_eut_to_model, delete_eut_by_id, send_email
from event_scheduling.hashids import Hashids
from django.views.decorators.csrf import ensure_csrf_cookie

DATE_STR_SPLITTER = ","
MIN_CELL_WIDTH = 50
MAX_TITLE_LENGTH = 40
MIN_TITLE_LENGTH = 3
MIN_NAME_LENGTH = 2
SALT = "jiaxin_event_scheduling"

logger = logging.getLogger(__name__)
hashids = Hashids(salt=SALT)


# Create your views here.
def index(request):
    return render(request, 'event_scheduling/index.html')


@ensure_csrf_cookie
def create_date(request):
    context_obj = {
        "DATE_STR_SPLITTER": DATE_STR_SPLITTER,
        "MAX_TITLE_LENGTH": MAX_TITLE_LENGTH,
        "MIN_TITLE_LENGTH": MIN_TITLE_LENGTH,
        "MIN_NAME_LENGTH": MIN_NAME_LENGTH,

    }
    return render(request, 'event_scheduling/create_date.html', context_obj)


@ensure_csrf_cookie
def get_plan(request, event_hid):
    event_primary_keys = hashids.decode(event_hid)
    if len(event_primary_keys) >= 1:
        event = get_object_or_404(Event, pk=event_primary_keys[0])
        context_obj = {
            "event": event,
            "event_hid": event_hid,
            "MIN_NAME_LENGTH": MIN_NAME_LENGTH,
            "MIN_CELL_WIDTH": MIN_CELL_WIDTH,

        }
        return render(request, 'event_scheduling/plan_detail.html', context_obj)
    else:
        raise Http404("Oops, 这里啥都木有。。。")


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


def save_eut(request):
    if request.method == 'POST' and request.is_ajax():
        eut_hid = request.POST.get('eut_hid', False)
        timeslots = request.POST.get('timeslots', False)
        display_user_name = request.POST.get('display_user_name', False)
        event_hid = request.POST.get('event_hid', False)
        is_organizer = request.POST.get('is_organizer', False)

        timeslots = json.loads(timeslots) if timeslots else []
        eut_pk = hashids.decode(eut_hid)[0] if eut_hid else False
        event_pk = hashids.decode(event_hid)[0] if event_hid else False

        print(is_organizer)
        print(type(is_organizer))
        eut_id = save_eut_to_model(display_user_name, timeslots, event_pk, is_organizer, eut_pk=eut_pk)
        if eut_id:
            return HttpResponse(hashids.encode(eut_id))
        else:
            raise Http404("Failed")
    else:
        raise Http404("Oops, 这里啥都木有。。。")


def get_euts_for_event(request, event_hid):
    """
    This receive the post request and returns eventUserTimeslots entries accordingly
    :param request:
    :param event_hid: hashed id of events
    :return: return HTTP response, ideally JSON, of the eut entries
    """
    if request.method == 'POST' and request.is_ajax():
        event_primary_keys = hashids.decode(event_hid)
        if len(event_primary_keys) >= 1:
            event_primary_key = event_primary_keys[0]
            self_eut_hid = request.POST.get('eut_hid', False)
            if self_eut_hid:
                # It is a returning user
                self_eut_primary_keys = hashids.decode(self_eut_hid)
                if len(self_eut_primary_keys) >= 1:
                    self_eut_primary_key = self_eut_primary_keys[0]
                else:
                    raise Http404(
                        "Oops, smart guy/gal, your localstorage seems to be changed :) <br> Well,you can choose to delete that row and proceed or restore what you changed :P ")
            else:
                self_eut_primary_key = None
            euts = get_euts(event_primary_key, SALT, self_eut_primary_key)
            if euts:
                return JsonResponse(euts)
            else:
                raise Http404("Oops, 没有任何时间被选择")
        else:
            raise Http404("Oops, 这里啥都木有。。。")
    else:
        raise Http404("Oops, 这里啥都木有。。。")


def delete_eut(request):
    """
    This will delete the eut, by it's hid, using post
    :param request: the request containing the post parameter "eut_hid"
    :return: Http404 if anything goes wrong or hid not found, else return "success"
    """
    if request.method == 'POST' and request.is_ajax():
        eut_hid = request.POST.get('eut_hid', False)
        if eut_hid:
            eut_hids = hashids.decode(eut_hid)
            if len(eut_hids) >= 1:
                eut_hid = eut_hids[0]
                if delete_eut_by_id(eut_hid):
                    return HttpResponse("success")
                else:
                    raise Http404("Oops, eut_hid错误。。。")
            else:
                raise Http404("Oops, eut_hid错误。。。")
        else:
            raise Http404("Oops, 找不到eut_hid。。。")
    else:
        raise Http404("Oops, 这里啥都木有。。。")

def send_suggestion_mail(request):
    send_email()
    return HttpResponse("OK")