from django.contrib import admin

# Register your models here.
from .models import User
from .models import Timeslot
from .models import Event


class UserAdmin(admin.ModelAdmin):
    # this is for displaying in a table manner, each is a horizontal list
    list_display = ('name', 'email')


class TimeslotAdmin(admin.ModelAdmin):
    # this is for displaying in a table manner, each is a horizontal list
    list_display = ('time_type', 'date', 'start_time', 'end_time', 'get_time_str')


class EventAdmin(admin.ModelAdmin):
    # this is for displaying in a table manner, each is a horizontal list
    list_display = ('name', 'description', 'location')


admin.site.register(User, UserAdmin)
admin.site.register(Timeslot, TimeslotAdmin)
admin.site.register(Event, EventAdmin)
