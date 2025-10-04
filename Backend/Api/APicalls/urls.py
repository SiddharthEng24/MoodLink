from django.urls import path
from . import views

urlpatterns = [
    path('', views.upload_screenshot, name='upload_screenshot'),
]
