import logging
from event_scheduling.models import Timeslot, User, Event, EventUserTimeslots

__author__ = 'jiaxinlin'

logger = logging.getLogger(__name__)


def init_whole_day_event(event_title, dates, organizer_name):
    """
    It initiates a whole day event
    :param event_title: The event title
    :param dates: the dates of the event 
    :return: return the initiated primary key of the event, or false/None if unsuccessful
    """
    if (len(dates) == 0):
        logging.error("Error, Dates has a length of 0")
        return None
    date_objs = []
    for date in dates:
        # Returns a tuple of (object, created),
        # where object is the retrieved or created object and created is a boolean specifying whether a new object was created.
        obj, created = Timeslot.objects.get_or_create(time_type=Timeslot.WHOLE_DAY_TIME, date=date)
        date_objs.append(obj)
    # u = User.objects.create(name=organizer_name)
    event = Event.objects.create(name=event_title)
    event.timeslots.add(*date_objs)
    eut = EventUserTimeslots.objects.create(display_user_name=organizer_name, event=event, is_organizer=True)
    eut.timeslots.add(*date_objs)
    return event.pk, eut.pk

def get_euts(event_id, self_eut_id = None):
    """
    Get eventUserTimeslots entries by event id
    :param event_id: the event id
    :param self_eut_id: if yes, then will put this entry under the "self" section of the returning array, other wise treat all of them the same
    :return:a list, or None if cannot find and eut on that event
    """
    euts = EventUserTimeslots.objects.filter(event__pk=event_id)
    normal_euts = []
    self_euts = []
    organizer_euts = []
    for eut in euts:
        eut_entry = {
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
    if len(euts) == 0:
        return None
    ret = {
        'normal_euts':normal_euts,
        'self_euts':self_euts,
        'organizer_euts':organizer_euts
    }
    return ret


