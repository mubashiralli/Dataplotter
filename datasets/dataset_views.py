from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.views import APIView
from core.core_models import SubProject
from rest_framework.response import Response
from .dataset_services import get_dataset_models, authenticate_user
from .dataset_models import Cottages
from .dataset_forms import CottagesForm
# from django.contrib.auth import authenticate
# Create your views here.
class CottagesView(APIView):
    def get(self,request):
        parameters = {key : request.GET.get(key) for key in request.GET.keys()}
        if parameters:
            data = list(Cottages.objects.filter(**parameters).values())
        else:
            data = list(Cottages.objects.all().values())
        return JsonResponse({'total':len(data),'data':data})
    def post(self, request):
        data = request.data
        data = data.get('data')
        for instance in data:
            form = CottagesForm(instance)
            if form.is_valid():
                form.save()
            else:
                return Response({'form':form.errors})
        return Response({'status':200})
    def put(self,request): 
        which_comp = request.GET.get('Competitor')
        data = request.data
        data = data.get('data')
        for instance in data:
            property_code = instance.get('PropertyCode')
            try:
                cottages = Cottages.objects.get(
                PropertyCode = property_code,
                Competitor = which_comp
                )
            except:
                cottages = []
            if cottages:
                form = CottagesForm(instance = cottages, data = instance)
                if form.is_valid():
                    form.save()
                else:
                    return Response({'form':form.errors})
            else:
                form = CottagesForm(instance)
                if form.is_valid():
                    form.save()
                else:
                    return Response({'form':form.errors})
        return Response({'status':200})
class UploadView(APIView):
    def get(self, request):
        models = get_dataset_models()
        models = [model.__name__ for model in models]
        return Response({"model": models})

    def post(self, request):
        SECRET_KEY = "api-validation/////-wmc-t2ytps@zq76^-database-idnvt(+#zjfk_dr5cca&!jnoahk_a_j9701qk1_pr)cj-"
        """
        {
        "pid":"1",
        "model":"SomeModel",
        "key":"somekey",
        "dataset":[
            {"val":"val"},
            {"val1":"val1"},
        ]
        }
        """
        data = request.data
        model_name = data.get("model", "Not Given")
        key64 = data.get("key", "notavailable")
        id = data.get("pid")
        dataset = data.get("dataset")
        model = get_dataset_models(model_name)
        auth_results = authenticate_user(key64, secret_key=SECRET_KEY)
        if (auth_results) and (model_name is not None) and (id is not None):
            project_instance = SubProject.objects.get(project_id=id)
            print(project_instance)
            try:
                instances = [
                    model(**item, dataset_id=project_instance) for item in dataset
                ]
                model.objects.bulk_create(instances)
                response = {"success": True}
            except Exception as e:
                response = {
                    "error_type": "database insertion",
                    "status": "500",
                    "error": str(e),
                }
        else:
            response = {
                "success": False,
                "msg": "You are not authorized to access this service",
                "key": auth_results,
            }
        return Response(response)

