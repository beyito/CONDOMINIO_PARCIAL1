import instancia from "../axios";

export const getUsuarios = async () => {
    return instancia.get('usuario/mostrarUsuarios/');  
}

export const postCopropietario = async (data) => {
    return instancia.post('usuario/registrarCopropietario/', data);  
}

export const postGuardia = async (data) => {
    return instancia.post('usuario/registrarGuardia/', data);  
}