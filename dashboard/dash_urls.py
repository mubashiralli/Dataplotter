from django.urls import path, include
from .dash_views import *
from .dash_dataviews import *

urlpatterns = [
    path("<int:id>", if_features_exist, name="features"),
    path("edit/", DashboardUpdate.as_view(), name="editdashboard"),
    path("datatable/header/<int:id>", get_datatables_header, name="dt_header"),
    path("dashboard/<int:id>", DashboardView.as_view(), name="dashhome"),
    path("default/<int:did>", default_dashboard, name="defaultDashboard"),
    path("datatable/<int:id>", get_datatables, name="datables"),
    path("basket/<int:bid>", BasketView.as_view(), name="basket"),
    path("basket/", BasketView.as_view(), name="basketpost"),
    path("selection/<int:id>", BasketSelectionView.as_view(), name="basketselection"),
    path("tables/<int:pk>", DataTableView.as_view(), name="datatableview"),
    path("tables/", DataTableView.as_view(), name="datatableviewpost"),
    path("copy/", DashboardCopy.as_view(), name="copydashboard"),
    path("newbasket/", BasketCreationView.as_view(), name="basketcreationview"),
]
