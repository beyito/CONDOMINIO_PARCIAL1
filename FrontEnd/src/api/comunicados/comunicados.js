import instancia from "../axios";
export const getComunicados = async () => {
    return instancia.get('comunicacion/mostrarComunicados');  
}

export const postComunicado = async (data) => {
    const id_administrador = data.id_administrador
    return instancia.post('comunicacion/crearComunicado/'+id_administrador+'', data);  
}

export const deleteComunicado = async (id_administrador,data) => {
    return instancia.delete('comunicacion/eliminarComunicado/'+data+'/'+id_administrador+'');  
}
export const updateComunicado = async (id, data) => {
    const id_administrador = data.id_administrador
    return instancia.put('comunicacion/editarComunicado/'+id+'/'+id_administrador+'', data);  
}