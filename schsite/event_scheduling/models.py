from django.db import models
from datetime import time


# Create your models here.

class User(models.Model):
    # A user needs a name
    name = models.CharField(max_length=50)
    # A user can have email.. Or not
    email = models.EmailField(blank=True, null=True)

class Timeslot(models.Model):
    # Defines the start time to represent Morning, afternoon and evening
    MORNING = time(7)
    AFTERNOON = time(13)
    EVENING = time(18)
    # A Time Will Have A Time Type
    WHOLE_DAY_TIME = 0
    MORNING_AFTERNOON_EVENING_TIME = 1
    PRECISE_TIME_TIME = 2
    TIME_TYPE_CHOICES = (
        (WHOLE_DAY_TIME, 'Whole Day Time'),
        (MORNING_AFTERNOON_EVENING_TIME, 'Morning Afternoon Evening Time'),
        (PRECISE_TIME_TIME, 'Precise Time Time')
    )
    time_type = models.IntegerField(choices=TIME_TYPE_CHOICES, default=WHOLE_DAY_TIME)

    # A Timeslot will have a date
    date = models.DateField()

    # A Timeslot can have a start time field
    start_time = models.TimeField()

    # A Timeslot can have an end time
    end_time = models.TimeField()

    # get the string represent the time (only time but not date)
    def get_time_str(self):
        if self.time_type == self.WHOLE_DAY_TIME:
            return ""
        elif self.time_type == self.MORNING_AFTERNOON_EVENING_TIME:
            if self.start_time == self.MORNING:
                return "早上"
            elif self.start_time == self.AFTERNOON:
                return "下午"
            elif self.start_time == self.EVENING:
                return "晚上"
        elif self.time_type == self.PRECISE_TIME_TIME:
            return self.start_time.strftime("%-I:%M %p") + self.end_time.strftime("%-I:%M %p")


class Event(models.Model):
    """
    The event model that stores the organizer information,
    """
    # An Event will have an organizer, it can be blank or null, which means it has no organizer
    organizer = models.ForeignKey(User
                                  , blank=True
                                  , null=True
                                  , on_delete=models.SET_NULL
                                  , related_name="organized_events")

    # An Event will have a list of person that are attending, allowing null and blank initially, or whatever
    attendees = models.ManyToManyField(User
                                       , related_name="attended_events")

    # An event time will also have a mode, can either be a whole day (WDE),
    # morning/afternoon/evening event(MAEE) or a precise time event(PTE)
    # WHOLE_DAY_EVENT = 'WDE'
    # MORNING_AFTERNOON_EVENING_EVENT = 'MAEE'
    # PRECISE_TIME_EVENT = 'PTE'
    # EVENT_TYPE_CHOICES = (
    #     (WHOLE_DAY_EVENT, 'Whole Day Event'),
    #     (MORNING_AFTERNOON_EVENING_EVENT, 'Morning Afternoon Evening Event'),
    #     (PRECISE_TIME_EVENT, 'Precise Time Event')
    # )
    # event_type = models.CharField(max_length=10, choices=EVENT_TYPE_CHOICES, default=WHOLE_DAY_EVENT)

    # An event will have a list of time, depends on the type of event
    timeslots = models.ManyToManyField(Timeslot)

    # An event will have a name
    name=models.CharField(max_length=50,blank=True, null=True)

    # An event can have a location
    location = models.CharField(max_length=50, blank=True, null=True)

    # An event can have a description
    description = models.CharField(max_length=200, blank=True, null=True)




