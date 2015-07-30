from django.shortcuts import render
from django.http import HttpResponse



# Create your views here.
def index(request):
    return render(request, 'event_scheduling/index.html')

def create_date(request):
    return render(request, 'event_scheduling/create_date.html')
