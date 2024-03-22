from datetime import datetime
from django.db.models import Q
from django.apps import apps
from core.core_models import SubProject


def set_none_values(object=dict(), equals=None, set_value=""):
    for key in object:
        if object.get(key) == equals:
            object[key] = set_value
    return object


def find_request_model(id):
    all_models = [
        apps.get_app_config("core").get_models(),
        apps.get_app_config("datasets").get_models(),
    ]  # this returns a
    project_models = []
    for models in all_models:
        for model in models:
            for field in model._meta.get_fields():
                if field.is_relation and field.related_model == SubProject:
                    filter_params = {f"dataset_id": id}
                    try:
                        if model.objects.filter(**filter_params).exists():
                            project_models.append(model)
                    except:
                        pass
    return project_models


def compute_page(pagno, per_page):
    if pagno > 0:
        pagno = 1 + (pagno // per_page)
    else:
        pagno = 1
    return pagno


def get_search_values(
    fields={"DateExtractRun": "DateField"}, search_values=[], id=None
) -> Q():
    """
    this function returns the Search input from the datatables in a
    hashable object with Column names as keys
    """
    if len(search_values) == 0:
        return Q(**{})
    if id:
        col_values = {"dataset_id_id": id}
    else:
        col_values = {}
    for num, field in enumerate(fields):
        value = search_values[num]
        if value:
            if fields.get(field) == "DateField":
                value = parse_date_values(date=value)
                col_values[field + "__gte"] = value
            elif fields.get(field) == "FloatField":
                col_values[field] = value
            else:
                col_values[field + "__icontains"] = value
    query = Q()
    for column, value in col_values.items():
        query &= Q(**{column: value})
    return query


def get_count(kwargs) -> int:
    model = kwargs.get("model")
    request = kwargs.get("request")
    sub_project = kwargs.get("sub_project")
    key = f"{request.user.id}-{request.user.username}-{sub_project}"
    if key not in request.session.keys():
        total_count = model.objects.filter(dataset_id_id=sub_project).count()
        request.session[key] = total_count
    else:
        total_count = request.session.get(key)
    return total_count


def parse_date_values(date="2022-04-07") -> datetime:
    year = "2022"  # datetime.now().strftime('%Y')
    if len(date) == 2:
        try:
            date = datetime.strptime(f"{year}{date}", "%Y%m")
            return date
        except:
            date = datetime.strptime(f"{year}{date}", "%Y%d")
            return date
            pass
    if "-" in date and (len(date) > 2 and len(date) == 5):
        try:
            date = datetime.strptime(f"{year}{date}", "%Y%m-%d")
            return date
        except:
            pass
    if date.count("-") == 2:
        try:
            return datetime.strptime(date, "%Y-%m-%d")
        except:
            pass
    if len(date) == 4:
        try:
            return datetime.strptime(f"{date}", "%Y")
        except:
            pass
    if len(date) == 7:
        try:
            return datetime.strptime(date, "%Y-%m")
        except:
            pass
    return datetime.strptime(f"{year}", "%Y")
