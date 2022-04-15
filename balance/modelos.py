
import sqlite3

class ProcesaDatos:
    def __init__(self, file=":memory:"):
        self.origen_datos = file

    def crea_diccionario(self, cur):
        filas = cur.fetchall()

        campos = []
        for item in cur.description:
            campos.append(item[0])

        resultado = []

        for fila in filas:
            registro = {}

            for clave, valor in zip(campos, fila):
                registro[clave] = valor

            resultado.append(registro)
        return resultado 

    def results(self, cur, con):
 
        if cur.description:
            resultado = self.crea_diccionario(cur)
        else:
            resultado = None
            con.commit()
        return resultado

    def haz_consulta(self, consulta, params=[]):
        con = sqlite3.connect(self.origen_datos)
        cur = con.cursor()

        cur.execute(consulta, params)

        resultado = self.results(cur, con)

        con.close()

        return resultado



    def recupera_datos(self):
        return self.haz_consulta("""
                        SELECT date, time, moneda_from, cantidad_from, moneda_to, cantidad_to
                        FROM movimientos
                        ORDER BY date
                    """
        )


    def consulta_id(self, id):
        return self.haz_consulta("""
                        SELECT date, time, moneda_from, cantidad_from, moneda_to, cantidad_ id
                        FROM movimientos
                         WHERE id = ?      
                    """, (id,))



    def modifica_datos(self, params):
        self.haz_consulta("""
                    INSERT INTO movimientos (date, time, moneda_from, cantidad_from, moneda_to, cantidad_to )
                                    values (?, ?, ?, ?, ?)
                    """, params)


    def update_datos(self, params):
        self.haz_consulta("""
                        UPDATE movimientos set date = ?, time = ?, moneda_from = ?, cantidad_from = ?, moneda_to = ?, cantidad_to
                        WHERE id = ?
                        """, params)

