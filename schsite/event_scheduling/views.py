import datetime
import json
import logging
from schsite import settings

from django.core.urlresolvers import reverse
from django.shortcuts import render, get_object_or_404
from django.http import Http404, JsonResponse, HttpResponse

from django.views.decorators.csrf import ensure_csrf_cookie

from event_scheduling import utils
from event_scheduling.models import Event, Timeslot
from event_scheduling.utils import init_whole_day_event, get_euts, save_eut_to_model, delete_eut_by_id, \
    init_precise_time_event
from event_scheduling.hashids import Hashids

DATE_STR_SPLITTER = ","
MIN_CELL_WIDTH = 48
MIN_WIDE_CELL_WIDTH = 80
MAX_TITLE_LENGTH = 40
MIN_TITLE_LENGTH = 3
MIN_NAME_LENGTH = 2
SALT = "jiaxin_event_scheduling"
DEFAULT_FROM_EMAIL = 'noReply@'
DEFAULT_TO_EMAILS = ['craiglin1992@gmail.com']

logger = logging.getLogger(__name__)
hashids = Hashids(salt=SALT)
base_context_obj = {
    "DEBUG": settings.DEBUG
}


# Create your views here.
@ensure_csrf_cookie
def index_html(request):
    return render(request, 'event_scheduling/index.html', base_context_obj)


@ensure_csrf_cookie
def create_date_html(request):
    context_obj = {
        "TIME_TYPE_WHOLE_DAY_TIME": Timeslot.WHOLE_DAY_TIME,
        "TIME_TYPE_MORNING_AFTERNOON_EVENING_TIME": Timeslot.MORNING_AFTERNOON_EVENING_TIME,
        "TIME_TYPE_PRECISE_TIME_TIME": Timeslot.PRECISE_TIME_TIME,
        "DATE_STR_SPLITTER": DATE_STR_SPLITTER,
        "MAX_TITLE_LENGTH": MAX_TITLE_LENGTH,
        "MIN_TITLE_LENGTH": MIN_TITLE_LENGTH,
        "MIN_NAME_LENGTH": MIN_NAME_LENGTH,
    }
    context_obj.update(base_context_obj)
    return render(request, 'event_scheduling/create_date.html', context_obj)


@ensure_csrf_cookie
def plan_detail_html(request, event_hid):
    event_primary_keys = hashids.decode(event_hid)
    if len(event_primary_keys) >= 1:
        event = get_object_or_404(Event, pk=event_primary_keys[0])
        context_obj = {
            "TIME_TYPE_WHOLE_DAY_TIME": Timeslot.WHOLE_DAY_TIME,
            "TIME_TYPE_MORNING_AFTERNOON_EVENING_TIME": Timeslot.MORNING_AFTERNOON_EVENING_TIME,
            "TIME_TYPE_PRECISE_TIME_TIME": Timeslot.PRECISE_TIME_TIME,
            "event": event,
            "event_hid": event_hid,
            "MIN_NAME_LENGTH": MIN_NAME_LENGTH,
            "MIN_CELL_WIDTH": MIN_CELL_WIDTH,
            "MIN_WIDE_CELL_WIDTH": MIN_WIDE_CELL_WIDTH

        }
        context_obj.update(base_context_obj)
        return render(request, 'event_scheduling/plan_detail.html', context_obj)
    else:
        raise Http404("Oops, 这里啥都木有。。。")


@ensure_csrf_cookie
def set_precise_time_html(request, event_hid):
    # TODO
    event_primary_keys = hashids.decode(event_hid)
    if len(event_primary_keys) >= 1:
        event = get_object_or_404(Event, pk=event_primary_keys[0])
        context_obj = {
            "TIME_TYPE_PRECISE_TIME_TIME": Timeslot.PRECISE_TIME_TIME,
            "event": event,
            "event_hid": event_hid
        }
        context_obj.update(base_context_obj)
        return render(request, 'event_scheduling/set_precise_time.html', context_obj)
    else:
        raise Http404("Oops, 这里啥都木有。。。")


def add_dates_for_whole_day_event(request):
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
        description = request.POST.get('description', False)
        if not (title and date_raw_post and organizer_name):
            raise Http404("Oops, 这里啥都木有。。。")
        date_strs = date_raw_post.split(DATE_STR_SPLITTER)
        dates = []
        for date_str in date_strs:
            dates.append(datetime.datetime.strptime(date_str, "%m/%d/%Y").date())
        event_primary_key, eventusertimeslots_primary_key = init_whole_day_event(title, dates,
                                                                                 organizer_name, description)
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


def add_dates_for_precise_time_event(request):
    """
    Create a precise time event, handles post, similar to add_dates_for_whole_day_event
    :param request:
    :return:
    """
    if request.method == 'POST' and request.is_ajax():
        title = request.POST.get('event_title', False)
        date_raw_post = request.POST.get('dates', False)
        organizer_name = request.POST.get('organizer_name', False)
        description = request.POST.get('description', False)
        if not (title and date_raw_post and organizer_name):
            raise Http404("Oops, 这里啥都木有。。。")
        date_strs = date_raw_post.split(DATE_STR_SPLITTER)
        dates = []
        for date_str in date_strs:
            dates.append(datetime.datetime.strptime(date_str, "%m/%d/%Y").date())
        event_primary_key, eventusertimeslots_primary_key = init_precise_time_event(title, dates,
                                                                                    organizer_name, description)
        event_hashid = hashids.encode(event_primary_key)
        eventusertimeslots_hashid = hashids.encode(eventusertimeslots_primary_key)
        response_obj = {
            'event_hashid': event_hashid,
            'eventusertimeslots_hashid': eventusertimeslots_hashid,
            'url': reverse("event_scheduling:set_precise_time_html", args=(event_hashid,))
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


def send_email(request):
    if request.method == 'POST' and request.is_ajax():
        content = request.POST.get('content', False)
        subject = request.POST.get('content', "No Subject")
        from_email = request.POST.get('from_email', DEFAULT_FROM_EMAIL + request.META['HTTP_HOST'])
        to_emails = DEFAULT_TO_EMAILS
        if content:
            utils.send_email(subject, content, from_email, to_emails)
            return HttpResponse("OK")
        else:
            raise Http404("Oops, No Content")
    else:
        raise Http404("Oops, 这里啥都木有。。。")


def set_times_for_precise_time_event(request, event_hid):
    """
    This will take the event hid, update the timeslots for the event.
    for each time slot, I will (and must) have the date and start time:
        1. if date or start time is empty, I jump over it
        2. try get the timeslot based on the date and start time
            a. if get it, then get the id and save to timeslot_list
            b. if failed, then create one and save id to timeslot_list
        3. set the new timeslot_list to the users timeslot list based on the eut that I have
        4. set the timeslot_list to the event's timeslots

    :param request:
    :param event_hid:
    :return:
    """
    if request.method == 'POST' and request.is_ajax():
        # getting the self eut pk
        self_eut_hid = request.POST.get('self_eut_hid', False)
        if self_eut_hid:
            # It is a returning user
            self_eut_pks = hashids.decode(self_eut_hid)
            if len(self_eut_pks) >= 1:
                self_eut_pk = self_eut_pks[0]
            else:
                raise Http404(
                    "Oops, smart guy/gal, your localstorage seems to be changed :) <br> Well,you can choose to delete that row and proceed or restore what you changed :P ")
        else:
            self_eut_pk = None
        # getting the event pk
        event_primary_keys = hashids.decode(event_hid)
        if len(event_primary_keys) >= 1:
            event_pk = event_primary_keys[0]
        else:
            raise Http404("Oops, 这里啥都木有。。。")
        # getting the timeslots to update
        timeslot_str_json = request.POST.get('timeslot_str_json', False)
        if timeslot_str_json:
            timeslot_str_arr = json.loads(timeslot_str_json)
        else:
            raise Http404("Expecting timeslots but nothing given")

        # by now I should have the self eut_primary key, the event pk and the timeslot array
        # The util func will take it from here
        if utils.set_precise_timeslots_for_event_to_model(event_pk, timeslot_str_arr, self_eut_pk):
            response_obj = {
                'response': "OK",
                'url': reverse("event_scheduling:fetch_plan", args=(event_hid,))
            }
            return JsonResponse(response_obj)
        else:
            return Http404("Failed to set the precise time")
    else:
        raise Http404("Oops, 这里啥都木有。。。")
