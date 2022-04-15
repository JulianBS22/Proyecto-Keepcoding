/* recuperar los movimientos de la base de datos en el servidor (backend) */
const peticionarioMovimientos = new XMLHttpRequest()
const peticionarioUpdate = new XMLHttpRequest()
let movimientos



function respuestaModificacion() {
    if (this.readyState === 4 && this.status === 200 ) {
        respuesta = JSON.parse(this.responseText)
        if (respuesta.status === 'success') {
            pideMovimientosHttp()
        } else {
            alert(respuesta.msg)
        }
    } else {
        alert('Se ha producido un error en la petición')
    }
}
function clickButton (){
    alert ('click')
}
const moneda_from = document.querySelector ("#moneda_from")
const cantidad_from = document.querySelector ("#cantidad_from")
const moneda_to = document.querySelector ("#moneda_to")
const cantidad_to = document.querySelector ("#cantidad_to")

const button=document.querySelector("#btn-alta")
     button.addEventListener('click',clickButton)
function listaMovimientos() {
    const campos = ['date', 'time', 'moneda_from', 'cantidad_from', 'moneda_to','cantidad_to']
    
    if (this.readyState === 4 && this.status === 200 ) {
        movimientos = JSON.parse(this.responseText)
        

                const tbody = document.querySelector("#tbbody-movimientos")
                tbody.innerHTML = ""
                //oculta el formulario

                for (let i = 0; i < movimientos.length; i++) {
                    const fila = document.createElement('tr')
                    fila.addEventListener('click', clickMovimiento)
                    const movimiento = movimientos[i]
                    fila.id = movimiento.id
                    for (const campo of campos) {
                        const celda = document.createElement('td')
                        /*
                        celda.innerHTML = campo !== 'es_ingreso' ? movimiento[campo] :
                                            movimiento[campo] === 1 ? 'Ingreso' : 'Gasto'
                        */

                        if (campo !== 'es_ingreso') {
                            celda.innerHTML = movimiento[campo]
                        } else if (movimiento[campo] === 1) {
                            celda.innerHTML = 'Ingreso'
                        } else {
                            celda.innerHTML = 'Gasto'
                        }

                        fila.appendChild(celda)
                    }

                    tbody.appendChild(fila)
                }
                


    } else {
        alert("Se ha producido un error al cargar los movimientos")
    }

}

function pideMovimientosHttp() {
    peticionarioMovimientos.open("GET", "http://localhost:5000/api/v01/todos", true)
    peticionarioMovimientos.onload = listaMovimientos
    
    peticionarioMovimientos.send()
}

pideMovimientosHttp()

document.querySelector("#aceptar").addEventListener('click', (ev) => {
    ev.preventDefault()
    // Aquí deberíamos validar, por ejemplo. Fecha no después de hoy y fecha valida

    const movimiento = {
        date: document.querySelector("#date").value,
        time: document.querySelector("#time").value,
        moneda_from: document.querySelector("#moneda_from").value,
        cantidad_from: document.querySelector("#cantidad_from").value,
        moneda_to: document.querySelector("#moneda_to").value,
        cantidad_to: document.querySelector("#cantidad_to").value,
        es_ingreso: document.querySelector("#es_ingreso").checked ? '1' : '0'
    }
    const id = document.querySelector("#id").value
    alert(id+": "+ movimiento)

    peticionarioUpdate.open("UPDATE", `http://localhost:5000/api/v01/movimiento/${id}`, true)
    peticionarioUpdate.onload = respuestaModificacion
    peticionarioUpdate.setRequestHeader("Content-Type", "application/json")
    peticionarioUpdate.send(JSON.stringify(movimiento))

    document.querySelector("#movimiento-activo").classList.add('inactive')



})
