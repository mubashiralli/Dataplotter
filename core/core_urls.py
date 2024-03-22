from django.urls import path
from .core_views import *
from .core_dataviews import *

urlpatterns = [
    path("", HomeView.as_view(), name="home"),
    # path("showbasket/<int:number>", ShowBasketView.as_view(), name="showbasket"),
    # path("addbasket/<int:number>", AddBasketView.as_view(), name="addbasket"),
    # path("viewbasket/<int:number>", ViewBasketView.as_view(), name="viewbasket"),
    ##core_dataviews
    path("sidebar", get_sidebar, name="sidebar"),
    path("isviewer", view_roles, name="isviewer"),
    path("isadmin", adminOnly, name="isadmin"),
    path("ip", get_ip, name="retrieveip"),
    path("testview", testview, name="testview"),
    path("users/", AllUsersView.as_view(), name="allusers"),
    path("users/<int:pk>", AllUsersView.as_view(), name="allusers"),
    path("addproject/", AddProject.as_view(), name="addproject"),
]
