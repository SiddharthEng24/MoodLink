from django.urls import path
from . import views

urlpatterns = [
    path('', views.upload_screenshot, name='upload_screenshot'),
    path('end-session/', views.end_meeting_session, name='end_meeting_session'),
    path('cleanup/', views.cleanup_all_files, name='cleanup_all_files'),
    path('report/<str:filename>', views.serve_html_report, name='serve_html_report'),
]
