from balance import app
from flask import render_template,jsonify,request
import sqlite3
import requests
from balance.modelos import ProcesaDatos
from obtenervalor import endpoint, headers
ruta_db = app.config['RUTA_BBDD']
data_manager = ProcesaDatos(ruta_db)



@app.route("/")
def inicio():
    return render_template("index.html")


@app.route("/api/v1/todos")
def todos():
    """datos = data_manager.recupera_datos()"""
    
    datos = [{"date": "a", "time": "b","moneda_from":"EUR","cantidad_from":"5000","moneda_to":"BTC","cantidad_to":"7000"},{"date": "a", "time": "b","moneda_from":"EUR","cantidad_from":"2000","moneda_to":"BTC","cantidad_to":"3000"}]
    return jsonify(datos)

@app.route("/api/v1/status")
def balance():
    datos = {"invertido": "2000", "valor_actual": "1000"}
    return jsonify(datos)

@app.route("/api/v1/tipo_cambio/<moneda_from>/<moneda_to>/<cantidad>")
def cambiodivisa(moneda_from, moneda_to, cantidad):
    print(endpoint.format(moneda_from, moneda_to))
    response = requests.get(endpoint.format(moneda_from, moneda_to), headers=headers)
    respuestaJson = response.json()
    rate = respuestaJson['rate']
    cantidadFinal = round(float(rate) * float(cantidad),2)
    return jsonify(cantidadFinal)


