# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('event_scheduling', '0009_auto_20150803_0432'),
    ]

    operations = [
        migrations.AddField(
            model_name='eventusertimeslots',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.SET_NULL, to='event_scheduling.User', related_name='related_events_timeslots', null=True),
        ),
    ]
