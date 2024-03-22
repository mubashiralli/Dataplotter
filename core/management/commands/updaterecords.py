from google.cloud import bigquery
from google.oauth2 import service_account
from core.core_models import *
import datetime
import re
from django.core.management import BaseCommand
from core.core_models import Santander
from tqdm import tqdm

credentials = service_account.Credentials.from_service_account_file("./new_auth.json")
project_id = "py-engine-wmc"
client = bigquery.Client(credentials=credentials, project=project_id)
query = "py-engine-wmc.vwfs.vwfs_data"
query_job = client.query(
    f"""
SELECT * FROM {query}
"""
)

total_records = client.query(f"SELECT COUNT(*) as total FROM {query}")
for row in total_records:
    fetched_records = row.total
# Santander_Cars.santander_data
# Santander_Bike_Calculated.SantanderBikeCalculated
required_format = {  # should be same positions as bigquery and must correspond to types it should be in mongodb
    "DateExtractRun": "date",
    "CarMake": "str",
    "CarModel": "str",
    "TypeofFinance": "str",
    "MonthlyPayment": "number",
    "CustomerDeposit": "number",
    "RetailerDepositContribution": "number",
    "RepresentativeAPR": "number",
    "TotalAmountPayable": "number",
    "OnTheRoadPrice": "number",
    "DurationofAgreement": "number",
    "OptionalPurchase_FinalPayment": "number",
    "AmountofCredit": "number",
    "OptionToPurchase_PurchaseActivationFee": "number",
    "FixedInterestRate_RateofinterestPA": "number",
    "ExcessMilageCharge": "number",
    "AverageMilesPerYear": "number",
    "RetailCashPrice": "number",
    "OfferExpiryDate": "str",
    "DepositPercent": "str",
    "FinalPaymentPercent": "str",
    "WebpageURL": "str",
    "CarimageURL": "str",
}
results = query_job.result()


def convert_eurotousd(value):
    value = value.split(",")
    if len(value) == 2:
        decimal = value[-1]
        main_value = value[0].replace(".", "")
        value = main_value + "." + decimal
    else:
        value = value[0].replace(".", "").replace(",", ".")
    return value


def return_format(val="34.56"):
    val = val.split(",")
    if len(val[-1]) == 2 and len(val) > 1:
        return "EUR"
    else:
        return "USD"


def extract_prices(val="34.53") -> float:
    if type(val) == type("") and val != "N/A":
        if return_format(val) == "EUR":
            val = convert_eurotousd(val)
        patterns = [r"\d+.\d+|\d+"]
        val = val.replace(",", "")
        for pattern in patterns:
            val = re.findall(pattern, val)
            if len(val) == 0:
                val = 0
            else:
                val = float(val[0])
                break
    return val


def return_date(required_format="%Y-%m-%d", date_value="") -> str:
    if datetime.date == type(date_value):
        date_value = date_value.strftime(required_format)
    elif type(date_value) == type(""):
        possible_formats = ["%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d"]
        for format in possible_formats:
            try:
                date_value = datetime.datetime.strptime(date_value, format).strftime(
                    required_format
                )
                break
            except:
                continue
    return date_value


def not_required(val, ty="number or string") -> int:
    if ty == "number":
        if type(val) == str:
            if val.isdigit():
                return float(val)
        return val
    else:
        nr = ["N/A"]
        if type(val) == type(""):
            for n in nr:
                if n in val:
                    return 0
        return val


def parser_for_db(row):
    required_format = {  # should be same positions as bigquery and must correspond to types it should be in mongodb
        "DateExtractRun": "date",
        "CarMake": "str",
        "CarModel": "str",
        "TypeofFinance": "str",
        "MonthlyPayment": "number",
        "CustomerDeposit": "number",
        "RetailerDepositContribution": "number",
        "RepresentativeAPR": "number",
        "TotalAmountPayable": "number",
        "OnTheRoadPrice": "number",
        "DurationofAgreement": "number",
        "OptionalPurchase_FinalPayment": "number",
        "AmountofCredit": "number",
        "OptionToPurchase_PurchaseActivationFee": "number",
        "FixedInterestRate_RateofinterestPA": "number",
        "ExcessMilageCharge": "number",
        "AverageMilesPerYear": "number",
        "RetailCashPrice": "number",
        "OfferExpiryDate": "str",
        "DepositPercent": "str",
        "FinalPaymentPercent": "number",
        "WebpageURL": "str",
        "CarimageURL": "str",
    }
    new_row = []
    for num, col in enumerate(required_format):
        type = required_format.get(col)
        if type == "date":
            new_row.append(return_date(date_value=row[num]))
        elif type == "number":
            new_row.append(not_required(extract_prices(row[num]), "number"))
        else:
            new_row.append(row[num])

    new_row = [not_required(val) for val in new_row]
    return new_row


class Command(BaseCommand):
    help = "import booms"

    def add_arguments(self, parser):
        parser.add_argument("value", type=int, help="The value argument.")
        pass

    def handle(self, *args, **options):
        main = "datafiles/"
        csv = {}
        keys = [key for key in required_format.keys()]
        commad_line_pid = options["value"]
        project = SubProject.objects.filter(project_id=commad_line_pid)[0]
        for num, col in tqdm(enumerate(results), total=fetched_records):
            # input(col)

            row = parser_for_db(col)
            row = [value if value != None or value != "" else "null" for value in row]
            # input(f'\n\n{row}')
            try:
                models = Santander(
                    DateExtractRun=row[0],
                    CarMake=row[1],
                    CarModel=row[2],
                    TypeofFinance=row[3],
                    MonthlyPayment=row[4],
                    CustomerDeposit=row[5],
                    RetailerDepositContribution=row[6],
                    RepresentativeAPR=row[7],
                    TotalAmountPayable=row[8],
                    OnTheRoadPrice=row[9],
                    DurationofAgreement=row[10],
                    OptionalPurchase_FinalPayment=row[11],
                    AmountofCredit=row[12],
                    OptionToPurchase_PurchaseActivationFee=row[13],
                    FixedInterestRate_RateofinterestPA=row[14],
                    ExcessMilageCharge=row[15],
                    AverageMilesPerYear=row[16],
                    RetailCashPrice=row[17],
                    OfferExpiryDate=row[18],
                    DepositPercent=row[19],
                    FinalPaymentPercent=row[20],
                    WebpageURL=row[21],
                    CarimageURL=row[22],
                    dataset_id=project,
                )
                models.save()
            except Exception as e:
                pass  # input(f'value = {e} ')
