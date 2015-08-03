# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_scheduling', '0006_auto_20150731_1611'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='eventusertimeslots',
            name='timeslot',
        ),
        migrations.AddField(
            model_name='eventusertimeslots',
            name='timeslot',
            field=models.ManyToManyField(to='event_scheduling.Timeslot'),
        ),
    ]
