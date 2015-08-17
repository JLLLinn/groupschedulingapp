from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index_html, name='index'),
    url(r'^create-date$', views.create_date_html, name='create_date'),
    url(r'^add/whole-day$', views.add_dates_for_whole_day_event, name='add_dates_for_whole_day_event'),
    url(r'^add/precise-time-dates$', views.add_dates_for_precise_time_event, name='add_dates_for_precise_time_event'),
    url(r'^set/precise-time-times/(?P<event_hid>[\w]+)/$', views.set_times_for_precise_time_event,
        name='set_times_for_precise_time_event'),
    url(r'^get-euts/(?P<event_hid>[\w]+)/$', views.get_euts_for_event, name='get_euts_for_event'),
    url(r'^save-eut/$', views.save_eut, name='save_eut'),
    url(r'^delete-eut/$', views.delete_eut, name='delete_eut'),
    url(r'^send-email/$', views.send_email, name='send_email'),
    url(r'^set-precise-time-for-dates/(?P<event_hid>[\w]+)/$', views.set_precise_time_html,
        name='set_precise_time_html'),
    url(r'^(?P<event_hid>[\w]+)/$', views.plan_detail_html, name='fetch_plan')
]
