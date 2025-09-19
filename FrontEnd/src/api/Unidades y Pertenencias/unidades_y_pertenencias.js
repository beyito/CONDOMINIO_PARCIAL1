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