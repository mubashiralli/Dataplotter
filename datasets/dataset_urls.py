from django.urls import path
from .dataset_views import UploadView,CottagesView

urlpatterns = [
    path("upload/", UploadView.as_view(), name="api"),
    path('cottages',CottagesView.as_view(),name='retrieve_property')
    ]
