from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^create-date$', views.create_date, name='create_date'),
    url(r'^add/whole-day$', views.add_whole_day, name='add_whole_day'),
]