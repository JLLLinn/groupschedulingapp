# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_scheduling', '0008_auto_20150802_1152'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='eventusertimeslots',
            name='user',
        ),
        migrations.AddField(
            model_name='eventusertimeslots',
            name='display_user_name',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
