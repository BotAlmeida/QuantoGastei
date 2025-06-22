FROM mcr.microsoft.com/azure-functions/node:4-node18
ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true
COPY . /home/site/wwwroot

HEALTHCHECK CMD curl --fail http://localhost:80 || exit 1
