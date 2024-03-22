from django.urls import include, path
from .charts_views import *

urlpatterns = [
    path("", Charts.as_view(), name="charts"),
    path("<int:pk>", Charts.as_view(), name="charts"),
    path("details", VisualCharts.as_view(), name="chartdetails"),
    path("details/<int:id>", VisualCharts.as_view(), name="chartdetails"),
    path("filters/<int:id>", FiltersView.as_view(), name="filters"),
    path("filters", FiltersView.as_view(), name="postfilters"),
    path("createfilter/<int:pk>", CreateFilters.as_view(), name="creatfilter"),
    path("colors/<int:id>", ColorsView.as_view(), name="colorsview"),
    path("colors/", ColorsView.as_view(), name="colorsviewpost"),
]
