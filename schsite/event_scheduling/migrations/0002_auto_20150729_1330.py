# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_scheduling', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='timeslots',
            field=models.ManyToManyField(to='event_scheduling.Timeslot'),
        ),
        migrations.AlterField(
            model_name='timeslot',
            name='time_type',
            field=models.IntegerField(choices=[(0, 'Whole Day Time'), (1, 'Morning Afternoon Evening Time'), (2, 'Precise Time Time')], default=0),
        ),
    ]
