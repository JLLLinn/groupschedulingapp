# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, primary_key=True, auto_created=True)),
                ('location', models.CharField(blank=True, null=True, max_length=50)),
                ('description', models.CharField(blank=True, null=True, max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Timeslot',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, primary_key=True, auto_created=True)),
                ('time_type', models.IntegerField(default=0, choices=[(0, 'Whole Day Time'), (1, 'Morning Afternoon Evening Time'), (2, 'Precise Time Time')], max_length=10)),
                ('date', models.DateField()),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, primary_key=True, auto_created=True)),
                ('name', models.CharField(max_length=50)),
                ('email', models.EmailField(blank=True, null=True, max_length=254)),
            ],
        ),
        migrations.AddField(
            model_name='event',
            name='attendees',
            field=models.ManyToManyField(related_name='attended_events', to='event_scheduling.User'),
        ),
        migrations.AddField(
            model_name='event',
            name='organizer',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, blank=True, related_name='organized_events', to='event_scheduling.User'),
        ),
        migrations.AddField(
            model_name='event',
            name='timeslots',
            field=models.ManyToManyField(null=True, blank=True, to='event_scheduling.Timeslot'),
        ),
    ]
