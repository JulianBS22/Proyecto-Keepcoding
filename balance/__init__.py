from flask import Flask

app = Flask(__name__,instance_relative_config=True)

app.config.from_object("config")

import balance.routes

API_KEY= "B036C6F1-E9BA-458F-88E7-1E6EADEF6011"
URL_TASA_ESPECIFICA = "https://rest.coinapi.io/v1/exchangerate/{}/{}?apikey={}"

MONEDAS = ['EUR','BTC','ETH','BCH','BNB','LINK','LUNA','ATOM','SOL','USDT']