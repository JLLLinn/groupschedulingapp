# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('event_scheduling', '0005_auto_20150731_1609'),
    ]

    operations = [
        migrations.AlterField(
            model_name='eventusertimeslots',
            name='timeslot',
            field=models.ForeignKey(to='event_scheduling.Timeslot', on_delete=django.db.models.deletion.SET_NULL, related_name='related_events_users', null=True, blank=True),
        ),
    ]
