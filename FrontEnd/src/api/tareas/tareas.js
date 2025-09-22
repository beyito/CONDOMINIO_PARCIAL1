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
export const asignarTarea = async (tareaId, personalIds) => {
  return instancia.post(`tareas/asignarPersonalTarea/${tareaId}`, { personal_ids: personalIds });
};
