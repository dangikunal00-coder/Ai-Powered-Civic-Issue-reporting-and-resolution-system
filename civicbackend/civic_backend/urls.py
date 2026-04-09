from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static



urlpatterns = [
    path('api/complaints/', include('complaints.urls')),   # correct
    path('api/admin/', include('complaints.admin_urls')),  # correct
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)