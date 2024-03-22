from django.db import models
from django.contrib.auth.models import Group


class Project(models.Model):
    project_id = models.AutoField(primary_key=True)
    # id = models.AutoField(primary_key=True)
    project_name = models.CharField(max_length=255, default="")
    managed_by = models.ForeignKey(
        Group, on_delete=models.CASCADE, null=True, blank=True
    )
    created_at = models.DateField(auto_now_add=True)
    modified_at = models.DateField(auto_now=True)

    def __str__(self) -> str:
        return self.project_name


class SubProject(models.Model):
    project_id = models.AutoField(primary_key=True)
    # models.AutoField(default = 0)
    project_name = models.CharField(max_length=255, default="")
    # created_by = models.CharField(max_length=255, default ='')
    parent = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateField(auto_now_add=True)
    modified_at = models.DateField(auto_now=True)

    def __str__(self) -> str:
        return self.project_name

    def save(self, *args, **kwargs):
        created = not self.pk
        super().save(*args, **kwargs)
        if created:
            c_group, _ = Group.objects.get_or_create(name=self.project_name)
            project, _ = Project.objects.get_or_create(
                project_name=self.project_name, managed_by=c_group
            )
            self.parent = project
            self.save()


class Santander(models.Model):
    id = models.AutoField(primary_key=True)
    DateExtractRun = models.DateField()
    CarMake = models.CharField(max_length=255, default="", null=True)
    CarModel = models.CharField(max_length=255, default="", null=True)
    TypeofFinance = models.CharField(max_length=255, default="", null=True)
    MonthlyPayment = models.FloatField(default=0, null=True)
    CustomerDeposit = models.FloatField(default=0, null=True)
    RetailerDepositContribution = models.FloatField(default=0, null=True)
    RepresentativeAPR = models.FloatField(default=0, null=True)
    TotalAmountPayable = models.FloatField(default=0, null=True)
    OnTheRoadPrice = models.FloatField(default=0, null=True)
    DurationofAgreement = models.FloatField(default=0, null=True)
    OptionalPurchase_FinalPayment = models.FloatField(default=0, null=True)
    AmountofCredit = models.FloatField(default=0, null=True)
    OptionToPurchase_PurchaseActivationFee = models.FloatField(default=0, null=True)
    FixedInterestRate_RateofinterestPA = models.CharField(
        max_length=255, default="0", null=True
    )
    ExcessMilageCharge = models.FloatField(default=0, null=True)
    AverageMilesPerYear = models.FloatField(default=0, null=True)
    RetailCashPrice = models.FloatField(default=0, null=True)
    OfferExpiryDate = models.CharField(max_length=255, default="", null=True)
    DepositPercent = models.CharField(max_length=255, default="", null=True)
    FinalPaymentPercent = models.FloatField(default=1, null=True)
    WebpageURL = models.URLField(max_length=2000, default="", null=True)
    CarimageURL = models.URLField(max_length=2000, default="", null=True)
    dataset_id = models.ForeignKey(SubProject, on_delete=models.CASCADE)

    def __str__(self):
        return self.CarMake + " | " + self.CarModel


class Norton(models.Model):
    id = models.AutoField(primary_key=True)

    DateExtractRun = models.DateField()
    Company = models.CharField(max_length=255, default="")
    Country = models.CharField(max_length=255, default="")
    Brand = models.CharField(max_length=255, default="")
    Product = models.CharField(max_length=255, default="")
    Category = models.CharField(max_length=255, default="")
    SubCategory = models.CharField(max_length=255, default="")
    NoOfDevices = models.FloatField(default=0)
    InitialTerm = models.CharField(max_length=255, default="")
    BillingPeriod = models.CharField(max_length=255, default="")
    Amount = models.FloatField(default=0)
    ProductCode = models.CharField(max_length=255, default="")
    Currency = models.CharField(max_length=255, default="")
    Promotion = models.CharField(max_length=255, default="")
    ReducedAmount = models.FloatField(default=0)
    PriceAfterInitialTerm = models.FloatField(default=0)
    VatIncluded = models.CharField(max_length=255, default="")
    SearchPhrase = models.CharField(max_length=255, default="")
    Channel = models.CharField(max_length=2000)
    Features = models.CharField(max_length=2000)
    Link = models.URLField(max_length=2000, default="")
    Change = models.CharField(max_length=255, default="")
    ChangeType = models.CharField(max_length=255, default="")
    OldAmount = models.FloatField(default=0)
    StandardizedCategory = models.CharField(max_length=255, default="")

    dataset_id = models.ForeignKey(SubProject, on_delete=models.CASCADE)

    def __str__(self):
        return self.Product + " | " + self.Company


class OpenXchange(models.Model):
    id = models.AutoField(primary_key=True)

    DateExtractRun = models.DateField()
    Competitor = models.CharField(max_length=255, default="", null=True)
    Company = models.CharField(max_length=255, default="", null=True)
    Country = models.CharField(max_length=255, default="", null=True)
    Category = models.CharField(max_length=255, default="", null=True)
    Product = models.CharField(max_length=255, default="", null=True)
    ProductCategory = models.CharField(max_length=255, default="", null=True)
    StandardizedProductCategory = models.CharField(
        max_length=255, default="", null=True
    )
    MonthlyPrice = models.FloatField(default=0, null=True)
    AnnualPrice = models.FloatField(default=0, null=True)
    ActualAnnualPrice = models.CharField(max_length=255, default="", null=True)
    Currency = models.CharField(max_length=255, default="", null=True)
    MonthlyPriceUSD = models.FloatField(default=0, null=True)
    AnnualPriceUSD = models.FloatField(default=0, null=True)
    ActualAnnualPriceUSD = models.FloatField(default=0, null=True)
    NoOfUsers = models.IntegerField(default=0)
    Storage = models.CharField(max_length=255, default="", null=True)
    Duration = models.CharField(max_length=255, default="", null=True)
    BillingPeriod = models.CharField(max_length=255, default="", null=True)
    PromotionType = models.CharField(max_length=255, default="", null=True)
    Promotion = models.CharField(max_length=255, default="", null=True)
    PromotionText = models.CharField(max_length=255, default="", null=True)
    PriceAfterIntialTerm = models.FloatField(default=0, null=True)
    StorageFeature = models.CharField(max_length=255, default="", null=True)
    DomainFeature = models.CharField(max_length=255, default="", null=True)
    WebMailFeature = models.CharField(max_length=255, default="", null=True)
    CalenderFeature = models.CharField(max_length=255, default="", null=True)
    ProtectionFeature = models.CharField(max_length=255, default="", null=True)
    Features = models.CharField(max_length=255, default="", null=True)
    Link = models.URLField(max_length=2000, default="")
    Date = models.CharField(max_length=255, default="", null=True)
    Change = models.CharField(max_length=255, default="", null=True)
    ChangeType = models.CharField(max_length=255, default="", null=True)
    MonthlyUSDPriceDifference = models.FloatField(default=0, null=True)
    AnnuallyUSDPriceDifference = models.FloatField(default=0, null=True)
    OldMonthlyUSDPrice = models.FloatField(default=0, null=True)
    OldAnnuallyUSDPrice = models.FloatField(default=0, null=True)
    PromotionChangeType = models.CharField(max_length=255, default="", null=True)
    OldPromotionText = models.CharField(max_length=255, default="", null=True)

    dataset_id = models.ForeignKey(SubProject, on_delete=models.CASCADE)

    def __str__(self):
        return self.Product + " - " + self.Company


class Sykes(models.Model):
    # DateExtractRun,Competitor,PropertyName,PropertyCode,CurrentPrice,OldPrice,ChargeFrequency,NoOfNights,NoOfGuests,NoOfBedroom,NoOfBathroom,
    # HolidayYear,Region,StartDate,EndDate,PropertyAddress,Features,Ratings,IsCoastal,PropertyURL
    DateExtractRun = models.DateField()
    Competitor = models.CharField(max_length=255, default="")
    # Company = models.CharField(max_length=255, default ='')
    PropertyName = models.CharField(max_length=128)
    PropertyCode = models.CharField(max_length=128)
    CurrentPrice = models.FloatField(default=0)
    OldPrice = models.FloatField(default=0)
    ChargeFrequency = models.CharField(max_length=128, default="night")
    NoOfNights = models.FloatField(default=0)
    NoOfGuests = models.FloatField(default=0)
    NoOfBedroom = models.FloatField(default=0)
    NoOfBathroom = models.FloatField(default=0)
    HolidayYear = models.CharField(max_length=255, default="")
    Region = models.CharField(max_length=255, default="")
    StartDate = models.DateField()
    EndDate = models.DateField()
    PropertyAddress = models.CharField(max_length=255, default="")
    Features = models.TextField()
    Ratings = models.FloatField(default=0)
    IsCoastal = models.CharField(max_length=32, default="")
    PropertyURL = models.URLField(max_length=512)
    dataset_id = models.ForeignKey(SubProject, on_delete=models.CASCADE)

    def __str__(self) -> str:
        return self.Competitor + " " + self.PropertyName


class VwfsCarLeasing(models.Model):
    DateExtractRun = models.DateField()
    Customer = models.CharField(max_length=255, default="", null=True)
    Basket = models.CharField(max_length=255, default="", null=True)
    Manufacturer = models.CharField(max_length=255, default="", null=True)
    Brand = models.CharField(max_length=255, default="", null=True)
    Model = models.CharField(max_length=255, default="", null=True)
    MonthlyCharge = models.FloatField(default=0)
    RentalProfile = models.CharField(max_length=255, default="", null=True)
    AnnualMileage = models.FloatField(default=0, null=True)
    InitialRental = models.FloatField(default=0, null=True)
    AdditionalFees = models.FloatField(default=0, null=True)
    FuelType = models.CharField(max_length=255, default="", null=True)
    Transmission = models.CharField(max_length=255, default="", null=True)
    BodyStyle = models.CharField(max_length=255, default="", null=True)
    CO2 = models.FloatField(default=0, null=True)
    Doors = models.FloatField(default=0, null=True)
    DriveTrain = models.CharField(max_length=255, default="", null=True)
    ProductionStatus = models.CharField(max_length=255, default="", null=True)
    Company = models.CharField(max_length=255, default="")
    WebpageURL = models.URLField(max_length=2000, default="", null=True)
    CarimageURL = models.URLField(max_length=2000, default="", null=True)
    dataset_id = models.ForeignKey(SubProject, on_delete=models.CASCADE)

    def __str__(self):
        return self.Manufacturer + " | " + self.Brand
