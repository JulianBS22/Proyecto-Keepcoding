/* recuperar los movimientos de la base de datos en el servidor (backend) */
const peticionarioMovimientos = new XMLHttpRequest()
const peticionarioUpdate = new XMLHttpRequest()
const button= document.querySelector("#btn-alta")

//Captura el evento click del botón de alta de movimiento
button.addEventListener('click',clickButton)

function clickButton(){
    const nuevoFormulario = document.querySelector("#bloqueNuevoMov")
    nuevoFormulario.style.display = 'block'
}


function pideMovimientosHttp() {
    peticionarioMovimientos.open("GET", "http://localhost:5000/api/v1/todos", true)
    peticionarioMovimientos.onload = listaMovimientos

    peticionarioMovimientos.send()
}


function listaMovimientos() {
    const campos = ['date', 'time', 'moneda_from', 'cantidad_from', 'moneda_to','cantidad_to']
    if (this.readyState === 4 && this.status === 200 ) {
        let movimientos = JSON.parse(this.responseText)
       
        const tbody = document.querySelector("#tbbody-movimientos")
        tbody.innerHTML = ""

        for (let i = 0; i < movimientos.length; i++) {
            const fila = document.createElement('tr')
            const movimiento = movimientos[i]
            fila.id = movimiento.id
            for (const campo of campos) {
                const celda = document.createElement('td')
                celda.innerHTML = movimiento[campo]
                fila.appendChild(celda)
            }
            console.log(fila)
            tbody.appendChild(fila)
        }
                
        // Una vez recuperados los movimientos y pintada la tabla de los mismos, llamamos al backend para recuperar el balance a día de hoy
        pideBalanceHttp()

    } else {
        alert("Se ha producido un error al cargar los movimientos")
    }
}


function pideBalanceHttp() {
    peticionarioMovimientos.open("GET", "http://localhost:5000/api/v1/status", true)
    peticionarioMovimientos.onload = detalleBalance
    
    peticionarioMovimientos.send()
}


function detalleBalance() {
    
    if (this.readyState === 4 && this.status === 200 ) {
        balanceHttp = JSON.parse(this.responseText)
        const resultado= balanceHttp.valor_actual-balanceHttp.invertido

        const body = document.querySelector("#balance")
               
        body.innerHTML = ""
        
        // Se crea el contenido dinámico
        const row1 = document.createElement('div')
        row1.setAttribute('class','row')
        const labelInvertido =document.createElement('div')
        labelInvertido.innerText='Invertido:'
        labelInvertido.setAttribute('class','col-4')
        row1.appendChild(labelInvertido)
        const valorInvertido =document.createElement('div')
        valorInvertido.setAttribute('class','col-4')
        valorInvertido.innerText=balanceHttp.invertido
        row1.appendChild(valorInvertido)
        body.appendChild(row1)

        const row2 = document.createElement('div')
        row2.setAttribute('class','row')
        const labelValor =document.createElement('div')
        labelValor.setAttribute('class','col-4')
        labelValor.innerText='Valor:'
        row2.appendChild(labelValor)
        const valorValor =document.createElement('div')
        valorValor.setAttribute('class','col-4')
        valorValor.innerText=balanceHttp.valor_actual
        row2.appendChild(valorValor)
        body.appendChild(row2)

        const row3 = document.createElement('div')
        row3.setAttribute('class','row')
        const labelResultado =document.createElement('div')
        labelResultado.setAttribute('class','col-4')
        labelResultado.innerText='Resultado:'
        row3.appendChild(labelResultado)

        const valorResultado =document.createElement('div')
        valorResultado.setAttribute('class','col-4')
        valorResultado.innerText= resultado
        row3.appendChild(valorResultado)
        body.appendChild(row3)
    } else {
        alert("Se ha producido un error al cargar el balance")
    }

}

function cambioDivisa() {
    const formulario = document.forms['cambioDivisaForm'];
    const monedaFrom = formulario.elements["moneda_from"].value;
    const monedaTo = formulario.elements["moneda_to"].value
    const cantidadFrom = formulario.elements["cantidadInicial"].value
    peticionarioMovimientos.open("GET", "http://localhost:5000/api/v1/tipo_cambio/"+monedaFrom+"/"+monedaTo+"/"+cantidadFrom, true)
    peticionarioMovimientos.onload = pintarResultadoCambioDivisa
    
    peticionarioMovimientos.send()
}
function pintarResultadoCambioDivisa(){
    if (this.readyState === 4 && this.status === 200 ) {
        let cambioHttp = JSON.parse(this.responseText)
        const totalConversion = document.querySelector("#cantidadFinal")
        console.log(cambioHttp)
        totalConversion.value=cambioHttp
        
    }
}

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

/*document.querySelector("#aceptar").addEventListener('click', (ev) => {
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
*/