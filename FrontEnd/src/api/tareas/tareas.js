import instancia from "../axios";

// Obtener todas las tareas (con filtros opcionales)
export const getTareas = async (params = {}) => {
  return instancia.get("tareas/mostrarTodasTareas", { params });
};

// Crear una tarea
export const postTarea = async (data) => {
  return instancia.post("tareas/crearTarea", data);
};

// Asignar personal a una tarea
export const asignarTarea = async (tareaId, { fecha, personalIds }) => {  
  console.log( "asignarTarea", tareaId, fecha, personalIds)
  const response = await instancia.post(
    `tareas/asignarPersonalTarea/${tareaId}`,
    {
      fecha,
      personal_ids: personalIds, // ojo: clave en snake_case
    }
  )
  return response.data
}
