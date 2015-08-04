from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^create-date$', views.create_date, name='create_date'),
    url(r'^add/whole-day$', views.add_whole_day, name='add_whole_day'),
    url(r'^plan/(?P<event_hid>[\w]+)/', views.get_plan, name='fetch_plan'),
    url(r'^get-euts/(?P<event_hid>[\w]+)/', views.get_euts_for_event, name='get_euts_for_event')
]
