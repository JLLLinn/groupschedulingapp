# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_scheduling', '0003_event_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='timeslot',
            name='end_time',
            field=models.TimeField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='timeslot',
            name='start_time',
            field=models.TimeField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='timeslot',
            name='time_type',
            field=models.IntegerField(choices=[(0, '全天'), (1, '早中晚'), (2, '精确时间')], default=0),
        ),
    ]
