# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('event_scheduling', '0004_auto_20150729_1253'),
    ]

    operations = [
        migrations.CreateModel(
            name='EventUserTimeslots',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('is_organizer', models.BooleanField()),
            ],
        ),
        migrations.RemoveField(
            model_name='event',
            name='attendees',
        ),
        migrations.RemoveField(
            model_name='event',
            name='organizer',
        ),
        migrations.AddField(
            model_name='eventusertimeslots',
            name='event',
            field=models.ForeignKey(to='event_scheduling.Event', on_delete=django.db.models.deletion.SET_NULL, related_name='related_timeslots_users', null=True),
        ),
        migrations.AddField(
            model_name='eventusertimeslots',
            name='timeslot',
            field=models.ForeignKey(to='event_scheduling.Timeslot', on_delete=django.db.models.deletion.SET_NULL, related_name='related_events_users', null=True),
        ),
        migrations.AddField(
            model_name='eventusertimeslots',
            name='user',
            field=models.ForeignKey(to='event_scheduling.User', on_delete=django.db.models.deletion.SET_NULL, related_name='related_events_timeslots', null=True),
        ),
    ]
