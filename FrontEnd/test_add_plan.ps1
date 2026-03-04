[Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
$loginBody = @{ email="admin@cipms.com"; password="Admin@123456" } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "https://localhost:7207/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.token

$planBody = @{
    insuranceTypeId = 1
    tierName = "Premium"
    basePremium = 100
    coverageLimit = 1000
    commissionRate = 10
    features = @("F1")
    exclusions = @()
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "https://localhost:7207/api/insurance/plans" -Method Post -Body $planBody -ContentType "application/json" -Headers @{"Authorization"="Bearer $token"}
} catch {
    $_.Exception.Response.GetResponseStream() | %{ (New-Object System.IO.StreamReader($_)).ReadToEnd() }
}
