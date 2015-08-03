# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_scheduling', '0007_auto_20150802_1151'),
    ]

    operations = [
        migrations.RenameField(
            model_name='eventusertimeslots',
            old_name='timeslot',
            new_name='timeslots',
        ),
    ]
