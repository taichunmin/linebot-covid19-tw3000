# linebot-covid19-tw3000

振興三倍卷 LINE Chatbot

## GCP 服務帳戶權限

* Cloud Build Service 帳戶
* Cloud Build 編輯者
* Cloud Functions 管理員
* 服務帳戶使用者
* Storage 物件建立者
* 檢視者

## GitHub Secrets

```
ENV_PROD=
GCP_PROJECT=
GCP_SA_KEY=
```

## GitHub Actions `ENV_PROD`

```
GA_DEBUG: '0'
NODE_ENV: production
```
