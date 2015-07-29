from django.contrib import admin

# Register your models here.
from .models import User
from .models import Timeslot
from .models import Event




class UserAdmin(admin.ModelAdmin):
    # this is for displaying in a table manner, each is a horizontal list
    list_display = ('name', 'email')

admin.site.register(User,UserAdmin)
admin.site.register(Timeslot)
admin.site.register(Event)