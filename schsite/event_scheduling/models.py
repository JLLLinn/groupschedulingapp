from django.db import models


# Create your models here.

class Event(models.Model):
    """
    The event model that stores the organizer information,
    """
    # An Event will have an organizer, it can be blank or null, which means it has no organizer
    organizer = models.ForeignKey(User
                                  , blank=True
                                  , null=True
                                  , on_delete=models.SET_NULL)

    # An Event will have a list of person that are attending, allowing null and blank initially, or whatever
    attendees = models.ManyToManyField(User
                                       , blank=True
                                       , null=True)

    #An event will also have a list of time,


class User(models.Model):
    pass
