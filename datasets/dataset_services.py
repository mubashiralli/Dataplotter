from django.apps import apps
from core.core_models import SubProject
import base64


def get_dataset_models(name=None):
    all_models = [
        apps.get_app_config("core").get_models(),
        apps.get_app_config("datasets").get_models(),
    ]  # this returns a
    project_models = []
    for models in all_models:
        for model in models:
            for field in model._meta.get_fields():
                if field.is_relation and field.related_model == SubProject:
                    # filter_params = {f"dataset_id": id}
                    try:
                        if model.__name__ == "Project":
                            continue
                        if name == model.__name__:
                            return model
                        elif name == None:
                            project_models.append(model)
                    except:
                        pass
    return project_models


def authenticate_user(key="usersubmitted", secret_key="ownkey") -> bool:
    # SECRET_KEY = 'api-validation/////-wmc-t2ytps@zq76^-database-idnvt(+#zjfk_dr5cca&!jnoahk_a_j9701qk1_pr)cj-'
    try:
        keydecoded = base64.b64decode(key).decode("utf-8")
    except Exception as e:
        return False
    if keydecoded == secret_key:
        return True
    return False
