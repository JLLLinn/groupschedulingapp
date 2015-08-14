import logging

from django.core.mail import send_mail

from event_scheduling.hashids import Hashids
from event_scheduling.models import Timeslot, Event, EventUserTimeslots

__author__ = 'jiaxinlin'

logger = logging.getLogger(__name__)


def init_whole_day_event(event_title, dates, organizer_name):
    """
    It initiates a whole day event
    :param event_title: The event title
    :param dates: the dates of the event 
    :return: return the initiated primary key of the event, or false/None if unsuccessful
    """
    return init_event(dates, event_title, organizer_name, Timeslot.WHOLE_DAY_TIME)


def init_precise_time_event(event_title, dates, organizer_name):
    """
    Similar as above
    :param event_title:
    :param dates:
    :param organizer_name:
    :return:
    """
    return init_event(dates, event_title, organizer_name, Timeslot.PRECISE_TIME_TIME)


def init_event(dates, event_title, organizer_name, time_type):
    """
    This only init the dates, doesn't care about hte time now
    :param dates:
    :param event_title:
    :param organizer_name:
    :param time_type:
    :return:
    """
    if (len(dates) == 0):
        logging.error("Error, Dates has a length of 0")
        return None
    date_objs = []
    for date in dates:
        # Returns a tuple of (object, created),
        # where object is the retrieved or created object and created is a boolean specifying whether a new object was created.
        obj, created = Timeslot.objects.get_or_create(time_type=time_type, date=date, start_time__isnull=True,
                                                      end_time__isnull=True)
        date_objs.append(obj)
    # u = User.objects.create(name=organizer_name)
    event = Event.objects.create(name=event_title)
    event.timeslots.add(*date_objs)
    eut = EventUserTimeslots.objects.create(display_user_name=organizer_name, event=event, is_organizer=True)
    eut.timeslots.add(*date_objs)
    return event.pk, eut.pk


def get_euts(event_id, SALT, self_eut_id=None):
    """
    Get eventUserTimeslots entries by event id
    :param event_id: the event id
    :param self_eut_id: if yes, then will put this entry under the "self" section of the returning array, other wise treat all of them the same
    :return:a list, or None if cannot find and eut on that event
    """
    hashids = Hashids(salt=SALT)
    euts = EventUserTimeslots.objects.filter(event__pk=event_id)
    normal_euts = []
    self_euts = []
    organizer_euts = []
    for eut in euts:
        eut_entry = {
            'eut_hid': hashids.encode(eut.pk),
            'timeslots_id': list(eut.timeslots.values_list('pk', flat=True)),
            'display_user_name': eut.display_user_name,
            'is_organizer': eut.is_organizer
        }
        if self_eut_id and eut.pk == self_eut_id:
            self_euts.append(eut_entry)
        elif eut.is_organizer:
            organizer_euts.append(eut_entry)
        else:
            normal_euts.append(eut_entry)
    # if len(euts) == 0:
    #     return None
    ret = {
        'normal_euts': normal_euts,
        'self_euts': self_euts,
        'organizer_euts': organizer_euts
    }
    return ret


def save_eut_to_model(display_user_name, timeslots, event_pk, is_organizer, eut_pk=None):
    """
    Either create or update a eut object
    :param display_user_name: the user name to be displayed
    :param timeslots: the timeslots ids, as a list
    :param eut_pk:
    :param event_pk:
    :param is_organizer:
    :return: the eut_id updated or created if success and None/False if unsuccessful
    """
    timeslot_objs = Timeslot.objects.filter(pk__in=timeslots)
    try:
        # try get and update
        obj = EventUserTimeslots.objects.get(pk=eut_pk)
        obj.display_user_name = display_user_name
        obj.is_organizer = is_organizer
        obj.save()
        obj.timeslots = timeslot_objs
        return obj.pk
    except EventUserTimeslots.DoesNotExist:
        event_obj = Event.objects.get(pk=event_pk)
        obj = EventUserTimeslots.objects.create(display_user_name=display_user_name, is_organizer=is_organizer,
                                                event=event_obj)
        obj.timeslots = timeslot_objs
        return obj.pk


def delete_eut_by_id(eut_id):
    try:
        EventUserTimeslots.objects.get(pk=eut_id).delete()
        return True
    except EventUserTimeslots.DoesNotExist:
        return False


def send_email(subject, content, from_email, to_emails):
    send_mail(subject, content, from_email, to_emails, fail_silently=False)
