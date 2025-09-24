import instancia from "../axios";

export const getUnidades = async () => {
    return instancia.get("unidadpertenencia/unidades");
};

export const postUnidades = async (data) => {
    return instancia.post("unidadpertenencia/unidades/crear", data);
}

export const putUnidades = async (data) => {
    const id_unidad = data.id
    return instancia.put(`unidadpertenencia/unidades/${id_unidad}/editar`, data);
}

export const getUnidadesInactivas = async () => {
    return instancia.get("unidadpertenencia/unidades/inactivas");
};

export const postResidente = async (data) => {
    return instancia.post("usuario/residentes/", data);
}   

export const postVehiculo = async (data) => {
    return instancia.post("unidadpertenencia/vehiculos/registrar", data);
}

export const updateVehiculo = async (data) => {
    const id_vehiculo = data.id
    return instancia.put(`unidadpertenencia/vehiculos/${id_vehiculo}/editar`, data);
}

export const postMascota = async (data) => {
    return instancia.post("unidadpertenencia/mascotas/registrar", data);
}

export const updateMascota = async (data) => {
    const id_mascota = data.id
    return instancia.put(`unidadpertenencia/mascotas/${id_mascota}/editar`, data);
}