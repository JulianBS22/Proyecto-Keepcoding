
import json
from select import select
from balance import app
from flask import render_template,jsonify,request
import sqlite3
import requests
from balance.modelos import ProcesaDatos

from obtenervalor import endpoint, headers,endpointCambioaEuros
import datetime
from datetime import date,datetime

ruta_db = app.config['RUTA_BBDD']
data_manager = ProcesaDatos(ruta_db)

@app.route("/")
def inicio():
    return render_template("index.html")


@app.route("/api/v1/todos")
def todos():
    datos = data_manager.recupera_datos()
    
    return  jsonify(datos)

@app.route("/api/v1/status")
def detalleBalance():
    #primero obtenemos la inversion total(aquellos mov cuya moneda from =EUR)
    inversion = data_manager.recupera_cantidadInvertida()
    #aqui consultamos/almacenamos las criptomonedas que tenemos en nuestro wallet
    wallet = data_manager.recupera_monedas_wallet()
    print(wallet)
    #ahora consultamos a la api de coin el cambio actual de todas las monedas
    response = requests.get(endpointCambioaEuros, headers=headers)
    monedasApi = response.json()
   

    # ahora filtramos de la lista de todas las criptomonedas aquellas que tenemos en nuestro wallet
    totalValor = 0
    for moneda in wallet:
        for cripto in monedasApi['rates']:
            #recorremos la lista filtrada y calculamos el valor en euros de nuestra moneda
            if cripto['asset_id_quote'] == moneda['moneda']:
                resultado = moneda['cantidad']/ cripto['rate']
                totalValor=totalValor+resultado
    
    #balanceGanancias = data_manager.recupera_monedas_wallet()
    datosBalance = {"invertido":inversion[0]["inversion"] , "valor_actual": totalValor}
   
    return jsonify(datosBalance)
  
   
        

@app.route("/api/v1/tipo_cambio/<moneda_from>/<moneda_to>/<cantidad>")
def cambiodivisa(moneda_from, moneda_to, cantidad):
    print(endpoint.format(moneda_from, moneda_to))
    response = requests.get(endpoint.format(moneda_from, moneda_to), headers=headers)
    respuestaJson = response.json()
    rate = respuestaJson['rate']
    cantidadFinal = round(float(rate) * float(cantidad),2)

    return jsonify ({
        "status": "success",
        "valor_cambio":round((cantidadFinal),2)
        })

@app.route("/api/v1/movimientos", methods=['UPDATE'])
def vistaMovimiento():
    datos=request.json
    print(datos)
   
    today =date.today()
    d = datetime.now()
    hora = (d.strftime('%H:%M:%S'))

    try:
        data_manager.modifica_datos((today, hora, datos['moneda_from'], datos ['cantidad_from'],
                                 datos['moneda_to'], datos['cantidad_to']))
       
        datosRecuperados = data_manager.recupera_datos()
        #necesitamos recuperar las criptos que tenemos en nuestro wallet antes de hacer la actualizacion del wallet
        monedasEnWallet = data_manager.recupera_monedas_wallet()
        #comprobar que tenemos la moneda origen y moneda destino que estamos comprando.
        monedaFromEncontrada = None
        monedaToEncontrada = None
        for moneda in monedasEnWallet:
                if datos['moneda_from']== moneda['moneda']:
                   monedaFromEncontrada=moneda
                if datos['moneda_to']== moneda['moneda']:
                   monedaToEncontrada=moneda
        #si estamos canjeando la moneda origen en su totalidad la borramos del wallet.
        if monedaFromEncontrada is not None: 
            cantidadActualizada = float(monedaFromEncontrada['cantidad']) - round(float(datos['cantidad_from']),2)
            if cantidadActualizada == 0:
                data_manager.borraMoneda((datos['moneda_from']))
            else:
                data_manager.actualizaMoneda((cantidadActualizada, datos['moneda_from']))
        #si la monedato existe en el wallet actualizamos su cantidad
        if monedaToEncontrada is not None:
            cantidadActualizada = float(monedaToEncontrada['cantidad']) + round(float(datos['cantidad_to']),2)
            data_manager.actualizaMoneda((cantidadActualizada, datos['moneda_to']))
        else:
            if datos['moneda_to'] != 'EUR':
                print('insert')
                data_manager.insertarMoneda((datos['cantidad_to'],datos['moneda_to']))
       
        return  jsonify(datosRecuperados)

    except sqlite3.Error as e:
        print(e)
        return render_template ('index.html'),jsonify({'status': 'error', 'msg': str(e)})

@app.route("/api/v1/walletcoins")
def wallet():
    wallet = data_manager.recupera_monedas_wallet()

    return jsonify(wallet)
