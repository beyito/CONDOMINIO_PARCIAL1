import instancia from "../axios";

export const getareas = async () => {
    return instancia.get('areacomun/areas/');  
}
export const postareas = async (data) => {
    return instancia.post('areacomun/areas/', data);  
}
export const putareas = async (id, data) => {
    return instancia.put(`areacomun/areas/${id}/`, data);  
}
export const deleteareas = async (id) => {
    return instancia.delete(`areacomun/areas/${id}/`);  
}