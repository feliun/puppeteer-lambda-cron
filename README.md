# puppeteer-lambda-cron
A cron job that runs a puppeteer test

## Run on local
By executing `SLOWMO_MS=250 npm run local` you can check the operation while actually viewing the chrome (non-headless, slowmo).

## Deploy
Run `AWS_PROFILE=<your_profile> npm run deploy-dev` to deploy as DEV environment or `AWS_PROFILE=<your_profile> npm run deploy-live` to deploy as LIVE.

On deployment, the command `npm run package` will be run and the generated zip file will be uploaded as lambda.