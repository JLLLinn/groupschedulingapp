# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('event_scheduling', '0010_eventusertimeslots_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='eventusertimeslots',
            name='user',
            field=models.ForeignKey(null=True, blank=True, on_delete=django.db.models.deletion.SET_NULL, to='event_scheduling.User', related_name='related_events_timeslots'),
        ),
    ]
