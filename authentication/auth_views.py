from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, authenticate, logout
from .auth_decorators import unauthorized_user
from django.utils.decorators import method_decorator
from .auth_forms import UserLoginForm, SigninRecordsFrom
from django.contrib import messages
from django.urls import reverse
from django.middleware.csrf import CsrfViewMiddleware
# from core.core_models import Project

# Create your views here.


class SignupView(View):
    """
    SignView class providing Signup Page & Signup Process.
    """
    @method_decorator(unauthorized_user)
    def get(self, request):
        return render(
            request,
            "authentication/signup.html",
            {"form": UserCreationForm(), "projects": "projects"},
        )

    def post(self, request):
        form = UserCreationForm(request.POST)
        if form.is_valid():
            messages.success(request, "User created")
            form.save()
            return redirect("login")
        else:
            messages.error(request, "User not created")
            return render(
                request, "authentication/signup.html", {"form": UserCreationForm()}
            )


class LoginView(View):
    @method_decorator(unauthorized_user)
    def get(self, request):
        if request.GET.get("next"):
            next_param = request.GET.get("next")
        else:
            next_param = None
        context = {"form": UserLoginForm(), "next": next_param}
        return render(request, "authentication/login.html", context)

    @method_decorator(unauthorized_user)
    def post(self, request):
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            ip = request.META.get("HTTP_X_FORWARDED_FOR")
            signin_record = SigninRecordsFrom(
                {"username": user.username, "user": user.id, "login_ip": ip}
            )
            if signin_record.is_valid():
                signin_record.save()
            next_data = {"None": None}.get(request.POST.get("next_route"))
            if next_data:
                url = next_data.strip("/").split("/")[0]
                arg = next_data.split("/")[-1]
                return redirect(reverse(url, args=arg))
            return redirect("home")
        else:
            messages.error(request, "Username/Password is incorrect")
            return render(
                request, "authentication/login.html", {"form": UserLoginForm()}
            )


class LogoutView(View):
    # @method_decorator(unauthorized_user)
    def get(self, request):
        logout(request)
        return redirect("login")
