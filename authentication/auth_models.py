from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class SigninRecords(models.Model):
    username = models.CharField(default="", max_length=255)
    login_ip = models.CharField(default="0.0.0.0", max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    login_time = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return (
            self.username
            + " - last login @ "
            + self.login_time.strftime("%d %b %Y %X")
            + ", from "
            + self.login_ip
        )
